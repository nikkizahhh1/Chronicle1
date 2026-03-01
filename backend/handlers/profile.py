import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.auth_utils import verify_token
from utils.response import success_response, error_response

users_table = get_dynamodb_table('users')

def get_profile(event, context):
    """Get user profile"""
    try:
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        response = users_table.get_item(Key={'user_id': user_data['user_id']})
        if 'Item' not in response:
            return error_response(404, "User not found")
        
        user = response['Item']
        
        # Remove sensitive data
        user.pop('password_hash', None)
        
        return success_response(user)
        
    except Exception as e:
        return error_response(500, str(e))

def update_profile(event, context):
    """Update user profile"""
    try:
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        body = json.loads(event['body'])
        
        # Build update expression
        update_expr = []
        expr_values = {}
        
        allowed_fields = ['name', 'bio', 'profile_photo_url', 'preferences']
        
        for field in allowed_fields:
            if field in body:
                update_expr.append(f'{field} = :{field[0]}')
                expr_values[f':{field[0]}'] = body[field]
        
        if not update_expr:
            return error_response(400, "No valid fields to update")
        
        users_table.update_item(
            Key={'user_id': user_data['user_id']},
            UpdateExpression='SET ' + ', '.join(update_expr),
            ExpressionAttributeValues=expr_values
        )
        
        return success_response({'message': 'Profile updated successfully'})
        
    except Exception as e:
        return error_response(500, str(e))

def get_settings(event, context):
    """Get user settings"""
    try:
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        response = users_table.get_item(Key={'user_id': user_data['user_id']})
        if 'Item' not in response:
            return error_response(404, "User not found")
        
        user = response['Item']
        settings = user.get('settings', {
            'notifications': True,
            'email_updates': True,
            'theme': 'light',
            'units': 'imperial'
        })
        
        return success_response({'settings': settings})
        
    except Exception as e:
        return error_response(500, str(e))

def update_settings(event, context):
    """Update user settings"""
    try:
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        body = json.loads(event['body'])
        settings = body.get('settings')
        
        if not settings:
            return error_response(400, "Settings required")
        
        users_table.update_item(
            Key={'user_id': user_data['user_id']},
            UpdateExpression='SET settings = :s',
            ExpressionAttributeValues={':s': settings}
        )
        
        return success_response({'message': 'Settings updated successfully'})
        
    except Exception as e:
        return error_response(500, str(e))
