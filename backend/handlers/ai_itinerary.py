"""
AI Itinerary Generator using AWS Bedrock and Amazon Location Services
"""
import json
import sys
import os
import uuid
from datetime import datetime, timezone, timedelta
import boto3

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.response import success_response, error_response
from utils.auth_utils import extract_user_id
from utils.dynamodb import get_dynamodb_table

# AWS clients
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
location_client = boto3.client('location', region_name='us-east-1')
trips_table = get_dynamodb_table('trips')

# Use cross-region inference profile for Claude 3.5 Sonnet
BEDROCK_MODEL_ID = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0'
PLACE_INDEX_NAME = os.environ.get('LOCATION_PLACE_INDEX_NAME', 'TripPlaceIndex')

def search_places(query: str, bias_position: list = None, max_results: int = 10):
    """Search for places using Amazon Location Service"""
    try:
        params = {
            'IndexName': PLACE_INDEX_NAME,
            'Text': query,
            'MaxResults': max_results
        }
        
        if bias_position:
            params['BiasPosition'] = bias_position
        
        response = location_client.search_place_index_for_text(**params)
        return response.get('Results', [])
    except Exception as e:
        print(f"Error searching places: {str(e)}")
        return []

def get_coordinates(location_name: str):
    """Get coordinates for a location"""
    results = search_places(location_name, max_results=1)
    if results:
        point = results[0]['Place']['Geometry']['Point']
        return {'lat': point[1], 'lon': point[0], 'label': results[0]['Place']['Label']}
    return None

def generate_itinerary_with_ai(trip_data: dict, user_interests: list):
    """Generate itinerary using Claude via Bedrock"""
    
    trip_type = trip_data.get('trip_type')
    duration = trip_data.get('duration', 3)
    budget = trip_data.get('budget', 500)
    intensity = trip_data.get('intensity', 3)
    
    # Determine trip description based on type
    if trip_type == 'location':
        trip_description = trip_data.get('destination', 'Unknown destination')
        main_location = trip_data.get('destination', 'Unknown')
    else:  # roadtrip
        start_loc = trip_data.get('start_location', 'Unknown')
        end_loc = trip_data.get('end_location', 'Unknown')
        trip_description = f"{start_loc} to {end_loc}"
        main_location = end_loc  # Use end location as main destination
    
    # Build concise prompt for Claude
    prompt = f"""Generate a {duration}-day travel itinerary in JSON format.

Trip: {trip_description}
Type: {trip_type}
Budget: ${budget}
Intensity: {intensity}/5 ({get_intensity_description(intensity)})
Interests: {', '.join(user_interests[:3]) if user_interests else 'general'}

Return ONLY this JSON structure (no other text):
{{
  "title": "Trip name",
  "destination": "{main_location}",
  "days": [
    {{
      "day": 1,
      "activities": [
        {{
          "time": "9:00 AM",
          "name": "Place name",
          "description": "One sentence",
          "location": "Address",
          "duration": "2 hours",
          "cost": 25,
          "category": "food"
        }}
      ]
    }}
  ],
  "total_cost": {budget}
}}

Requirements:
- Real places only
- {get_activities_per_day(intensity)} activities per day
- Costs within budget
- Mix activity types"""
    
    try:
        # Call Bedrock with shorter timeout
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,  # Reduced for faster response
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7
        }
        
        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        ai_text = response_body['content'][0]['text']
        
        # Extract JSON from response
        json_start = ai_text.find('{')
        json_end = ai_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            itinerary_json = ai_text[json_start:json_end]
            itinerary = json.loads(itinerary_json)
            return itinerary
        else:
            raise ValueError("No valid JSON found in AI response")
            
    except Exception as e:
        print(f"Error calling Bedrock: {str(e)}")
        raise

def get_activities_per_day(intensity: int) -> str:
    activities = {
        1: '2',
        2: '2-3',
        3: '3-4',
        4: '4-5',
        5: '5+'
    }
    return activities.get(intensity, '3-4')

def get_intensity_description(level: int) -> str:
    descriptions = {
        1: '≤2 activities per day (very relaxed)',
        2: '2-3 activities per day (relaxed)',
        3: '3-4 activities per day (moderate)',
        4: '4-5 activities per day (packed)',
        5: '≥5 activities per day (very packed)'
    }
    return descriptions.get(level, 'moderate pace')

def generate(event, context):
    """Generate AI-powered itinerary"""
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # Extract user ID from JWT
        user_id = extract_user_id(event)
        if not user_id:
            print("ERROR: No user_id found in token")
            return error_response('Unauthorized', 401)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        print(f"Request body: {json.dumps(body)}")
        
        # Validate required fields
        trip_type = body.get('trip_type')
        if trip_type not in ['location', 'roadtrip']:
            print(f"ERROR: Invalid trip_type: {trip_type}")
            return error_response('Invalid trip_type. Must be "location" or "roadtrip"')
        
        if trip_type == 'location' and not body.get('destination'):
            print("ERROR: Missing destination for location trip")
            return error_response('destination is required for location trips')
        
        if trip_type == 'roadtrip':
            if not body.get('start_location') or not body.get('end_location'):
                print(f"ERROR: Missing locations - start: {body.get('start_location')}, end: {body.get('end_location')}")
                return error_response('start_location and end_location are required for roadtrips')
        
        print(f"Generating itinerary for user {user_id}, trip_type: {trip_type}")
        
        # Get user interests
        user_interests = body.get('interests', [])
        
        # Get location coordinates using Amazon Location Service
        if trip_type == 'location':
            destination = body.get('destination')
            coords = get_coordinates(destination)
            if coords:
                body['destination_coords'] = coords
        else:
            start_coords = get_coordinates(body.get('start_location'))
            end_coords = get_coordinates(body.get('end_location'))
            if start_coords and end_coords:
                body['start_coords'] = start_coords
                body['end_coords'] = end_coords
        
        # Generate itinerary with AI
        itinerary = generate_itinerary_with_ai(body, user_interests)
        
        # Create trip in database
        trip_id = str(uuid.uuid4())
        
        # Calculate dates
        start_date = body.get('start_date')
        if not start_date:
            start_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        duration = body.get('duration', 3)
        end_date = body.get('end_date')
        if not end_date:
            end_date = (datetime.strptime(start_date, '%Y-%m-%d') + timedelta(days=duration)).strftime('%Y-%m-%d')
        
        # Determine destination for trip record
        if trip_type == 'location':
            trip_destination = itinerary.get('destination', body.get('destination'))
        else:  # roadtrip
            trip_destination = f"{body.get('start_location')} to {body.get('end_location')}"
        
        trip = {
            'trip_id': trip_id,
            'user_id': user_id,
            'title': itinerary.get('title', f"Trip to {trip_destination}"),
            'type': trip_type,
            'destination': trip_destination,
            'start_date': start_date,
            'end_date': end_date,
            'budget': body.get('budget', 500),
            'duration': duration,
            'intensity': body.get('intensity', 3),
            'group_type': body.get('group_type', 'solo'),
            'interests': user_interests,
            'itinerary': itinerary,
            'status': 'active',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Add roadtrip-specific fields
        if trip_type == 'roadtrip':
            trip['start_location'] = body.get('start_location')
            trip['end_location'] = body.get('end_location')
            trip['include_gas'] = body.get('include_gas', False)
            trip['scenic_route'] = body.get('scenic_route', True)
        
        # Save to DynamoDB
        trips_table.put_item(Item=trip)
        
        print(f"Trip {trip_id} created successfully")
        
        # Return trip data
        return success_response({
            'trip_id': trip_id,
            'trip': trip
        })
        
    except Exception as e:
        print(f"Error generating itinerary: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f'Failed to generate itinerary: {str(e)}', 500)
