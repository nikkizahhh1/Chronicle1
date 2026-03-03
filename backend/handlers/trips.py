import json
import uuid
from datetime import datetime, timezone
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.auth_utils import extract_user_id
from utils.response import success_response, error_response
from boto3.dynamodb.conditions import Key

trips_table = get_dynamodb_table('trips')

def create_trip(event, context):
    """Create a new trip with detailed questionnaire data"""
    try:
        user_id = extract_user_id(event)
        if not user_id:
            return error_response(401, "Unauthorized")
        
        body = json.loads(event['body'])
        
        trip_id = str(uuid.uuid4())
        
        # Extract questionnaire data
        questionnaire = body.get('questionnaire', {})
        
        trip = {
            'trip_id': trip_id,
            'user_id': user_id,
            'type': body.get('type', 'location'),  # location or roadtrip
            'destination': body.get('destination'),
            
            # Questionnaire fields from frontend
            'questionnaire': {
                # Required fields
                'starting_point': questionnaire.get('starting_point'),
                'ending_point': questionnaire.get('ending_point'),
                'duration_days': questionnaire.get('duration_days'),
                'budget': questionnaire.get('budget'),
                'how_busy': questionnaire.get('how_busy'),  # Slider value (e.g., 1-5)
                'traveling_with': questionnaire.get('traveling_with'),  # "solo" or "group"
                
                # Road trip preferences (optional)
                'road_trip_preferences': {
                    'include_gas_costs': questionnaire.get('road_trip_preferences', {}).get('include_gas_costs', False),
                    'scenic_route': questionnaire.get('road_trip_preferences', {}).get('scenic_route', False)
                },
                
                # Optional: Activity categories from quiz
                'activity_categories': questionnaire.get('activity_categories', []),
            },
            
            'preferences': body.get('preferences', {}),
            'status': 'pending',
            'itinerary': {},
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        trips_table.put_item(Item=trip)
        
        return success_response(trip)
        
    except Exception as e:
        return error_response(500, str(e))

def list_trips(event, context):
    """List all trips for a user"""
    try:
        user_id = extract_user_id(event)
        if not user_id:
            return error_response(401, "Unauthorized")
        
        response = trips_table.query(
            IndexName='user-index',
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        
        return success_response(response['Items'])
        
    except Exception as e:
        return error_response(500, str(e))

def get_trip(event, context):
    """Get a specific trip"""
    try:
        user_id = extract_user_id(event)
        if not user_id:
            return error_response(401, "Unauthorized")
        
        trip_id = event['pathParameters']['trip_id']
        
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")
        
        trip = response['Item']
        
        # Verify ownership
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        return success_response(trip)
        
    except Exception as e:
        return error_response(500, str(e))

def update_trip(event, context):
    """Update a trip"""
    try:
        user_id = extract_user_id(event)
        if not user_id:
            return error_response(401, "Unauthorized")
        
        trip_id = event['pathParameters']['trip_id']
        body = json.loads(event['body'])
        
        # Verify ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")
        
        trip = response['Item']
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        # Update trip
        update_expr = []
        expr_values = {}
        
        if 'preferences' in body:
            update_expr.append('preferences = :p')
            expr_values[':p'] = body['preferences']
        
        if 'status' in body:
            update_expr.append('status = :s')
            expr_values[':s'] = body['status']
        
        if 'itinerary' in body:
            update_expr.append('itinerary = :i')
            expr_values[':i'] = body['itinerary']
        
        if update_expr:
            trips_table.update_item(
                Key={'trip_id': trip_id},
                UpdateExpression='SET ' + ', '.join(update_expr),
                ExpressionAttributeValues=expr_values
            )
        
        return success_response({'message': 'Trip updated'})
        
    except Exception as e:
        return error_response(500, str(e))

def delete_trip(event, context):
    """Delete a trip"""
    try:
        user_id = extract_user_id(event)
        if not user_id:
            return error_response(401, "Unauthorized")
        
        trip_id = event['pathParameters']['trip_id']
        
        # Verify ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")
        
        trip = response['Item']
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        trips_table.delete_item(Key={'trip_id': trip_id})
        
        return success_response({'message': 'Trip deleted'})
        
    except Exception as e:
        return error_response(500, str(e))
