import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.auth_utils import verify_token
from utils.response import success_response, error_response
from services.trip_calculator import (
    calculate_trip_budget,
    get_scenic_route_guidance,
    adjust_pois_for_busy_level,
    calculate_group_adjustments
)

trips_table = get_dynamodb_table('trips')

def get_trip_recommendations(event, context):
    """
    Get trip planning recommendations based on questionnaire
    This endpoint helps the AI team understand how to plan the trip
    """
    try:
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        trip_id = event['pathParameters']['trip_id']
        
        # Get trip
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")
        
        trip = response['Item']
        
        # Verify ownership
        if trip['user_id'] != user_data['user_id']:
            return error_response(403, "Forbidden")
        
        questionnaire = trip.get('questionnaire', {})
        
        # Extract questionnaire data
        duration_days = questionnaire.get('duration_days', 3)
        budget = questionnaire.get('budget', 1000)
        how_busy = questionnaire.get('how_busy', 3)
        traveling_with = questionnaire.get('traveling_with', 'solo')
        road_trip_prefs = questionnaire.get('road_trip_preferences', {})
        include_gas = road_trip_prefs.get('include_gas_costs', False)
        scenic_route = road_trip_prefs.get('scenic_route', False)
        
        # Calculate POI recommendations based on busy level
        poi_recommendations = adjust_pois_for_busy_level([], how_busy, duration_days)
        
        # Calculate group adjustments
        group_adjustments = calculate_group_adjustments(
            traveling_with,
            budget,
            poi_recommendations['pois_per_day']
        )
        
        # Get scenic route guidance if requested
        scenic_guidance = None
        if scenic_route:
            scenic_guidance = get_scenic_route_guidance()
        
        # Build recommendations
        recommendations = {
            'trip_id': trip_id,
            'duration_days': duration_days,
            'budget': budget,
            'how_busy': how_busy,
            'traveling_with': traveling_with,
            
            # POI recommendations
            'poi_planning': {
                'pois_per_day': group_adjustments['adjusted_pois_per_day'],
                'total_pois_needed': group_adjustments['adjusted_pois_per_day'] * duration_days,
                'recommended_duration_per_poi_minutes': poi_recommendations['recommended_duration_per_poi_minutes'],
                'time_multiplier': group_adjustments['time_multiplier']
            },
            
            # Budget planning
            'budget_planning': {
                'include_gas_costs': include_gas,
                'adjusted_budget': group_adjustments['adjusted_budget'],
                'budget_per_day': group_adjustments['adjusted_budget'] / duration_days,
                'notes': 'Gas costs will be calculated after route is determined' if include_gas else None
            },
            
            # Scenic route guidance
            'scenic_route': scenic_guidance if scenic_route else None,
            
            # Group travel adjustments
            'group_adjustments': group_adjustments if traveling_with == 'group' else None,
            
            # General recommendations
            'recommendations': [
                f"Plan for {group_adjustments['adjusted_pois_per_day']} POIs per day",
                f"Allocate approximately ${round(group_adjustments['adjusted_budget'] / duration_days, 2)} per day",
                f"Each POI should take about {poi_recommendations['recommended_duration_per_poi_minutes']} minutes"
            ] + (group_adjustments['recommendations'] if traveling_with == 'group' else [])
        }
        
        return success_response(recommendations)
        
    except Exception as e:
        return error_response(500, str(e))

def calculate_trip_costs(event, context):
    """
    Calculate trip costs including gas (if applicable)
    Call this after itinerary is generated to get accurate costs
    """
    try:
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        trip_id = event['pathParameters']['trip_id']
        
        # Get trip
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")
        
        trip = response['Item']
        
        # Verify ownership
        if trip['user_id'] != user_data['user_id']:
            return error_response(403, "Forbidden")
        
        questionnaire = trip.get('questionnaire', {})
        itinerary = trip.get('itinerary', {})
        
        if not itinerary or not itinerary.get('days'):
            return error_response(400, "Trip must have an itinerary to calculate costs")
        
        # Extract data
        budget = questionnaire.get('budget', 1000)
        road_trip_prefs = questionnaire.get('road_trip_preferences', {})
        include_gas = road_trip_prefs.get('include_gas_costs', False)
        
        # Calculate budget breakdown
        budget_breakdown = calculate_trip_budget(
            itinerary,
            budget,
            include_gas=include_gas
        )
        
        return success_response(budget_breakdown)
        
    except Exception as e:
        return error_response(500, str(e))
