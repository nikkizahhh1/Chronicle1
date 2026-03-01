"""
Backend handler that calls the deployed AI layer API
This replaces the old ai_itinerary.py that tried to call Bedrock directly
"""
import json
import sys
import os
import requests

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.response import success_response, error_response
from utils.auth_utils import extract_user_id

# Your deployed AI layer endpoint
AI_LAYER_URL = os.environ.get(
    'AI_LAYER_URL',
    'https://ksalbazufb.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate'
)

def generate(event, context):
    """
    Generate itinerary by calling the AI layer API
    """
    try:
        # Extract user ID from JWT
        user_id = extract_user_id(event)
        if not user_id:
            return error_response('Unauthorized', 401)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        trip_type = body.get('trip_type')
        if trip_type not in ['location', 'roadtrip']:
            return error_response('Invalid trip_type. Must be "location" or "roadtrip"')
        
        if trip_type == 'location' and not body.get('destination'):
            return error_response('destination is required for location trips')
        
        if trip_type == 'roadtrip':
            if not body.get('start_location') or not body.get('end_location'):
                return error_response('start_location and end_location are required for roadtrips')
        
        # Call AI layer API
        print(f"Calling AI layer for user {user_id}")
        
        ai_response = requests.post(
            AI_LAYER_URL,
            json=body,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if ai_response.status_code != 200:
            error_msg = ai_response.json().get('error', 'AI layer request failed')
            return error_response(f'AI generation failed: {error_msg}', 500)
        
        # Get itinerary from AI layer
        ai_data = ai_response.json()
        
        if not ai_data.get('success'):
            return error_response(ai_data.get('error', 'Unknown error'), 500)
        
        itinerary_data = ai_data['data']
        
        # TODO: Save to DynamoDB here
        # save_itinerary_to_db(user_id, itinerary_data)
        
        # Return itinerary to frontend
        return success_response({
            'user_id': user_id,
            'itinerary': itinerary_data['itinerary'],
            'trip_type': itinerary_data['trip_type']
        })
        
    except requests.exceptions.Timeout:
        return error_response('AI generation timed out. Please try again.', 504)
    except requests.exceptions.RequestException as e:
        print(f"Error calling AI layer: {str(e)}")
        return error_response(f'Failed to connect to AI service: {str(e)}', 500)
    except Exception as e:
        print(f"Error generating itinerary: {str(e)}")
        return error_response(f'Failed to generate itinerary: {str(e)}', 500)
