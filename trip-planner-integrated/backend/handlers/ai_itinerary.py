import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.claude_service import ClaudeService
from services.prompt_builder import PromptBuilder
from services.itinerary_parser import ItineraryParser
from utils.response import success_response, error_response
from utils.auth_utils import extract_user_id

claude_service = ClaudeService()
prompt_builder = PromptBuilder()
parser = ItineraryParser()

def generate(event, context):
    try:
        # For testing: accept any token or no token
        user_id = extract_user_id(event)
        if not user_id:
            # Use test user for hackathon testing
            user_id = 'test-user-123'
        
        body = json.loads(event.get('body', '{}'))
        
        trip_type = body.get('trip_type')
        if trip_type not in ['location', 'roadtrip']:
            return error_response('Invalid trip_type. Must be "location" or "roadtrip"')
        
        system_prompt = prompt_builder.build_system_prompt()
        
        if trip_type == 'location':
            if not body.get('destination'):
                return error_response('destination is required for location trips')
            user_prompt = prompt_builder.build_location_trip_prompt(body)
        else:
            if not body.get('start_location') or not body.get('end_location'):
                return error_response('start_location and end_location are required for roadtrips')
            user_prompt = prompt_builder.build_roadtrip_prompt(body)
        
        claude_response = claude_service.generate_itinerary(system_prompt, user_prompt)
        
        itinerary = parser.parse(claude_response)
        
        result = {
            'user_id': user_id,
            'trip_type': trip_type,
            'itinerary': itinerary,
            'raw_response': claude_response
        }
        
        return success_response(result)
        
    except Exception as e:
        print(f"Error generating itinerary: {str(e)}")
        return error_response(f'Failed to generate itinerary: {str(e)}', 500)
