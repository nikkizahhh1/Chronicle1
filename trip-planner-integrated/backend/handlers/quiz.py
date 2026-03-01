import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.auth_utils import verify_token
from utils.response import success_response, error_response

users_table = get_dynamodb_table('users')

def submit_quiz(event, context):
    """Save user quiz results"""
    try:
        # Verify token
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        body = json.loads(event['body'])
        quiz_results = body.get('quiz_results')
        
        if not quiz_results:
            return error_response(400, "Quiz results required")
        
        # Update user with quiz results
        users_table.update_item(
            Key={'email': user_data['email']},
            UpdateExpression='SET quiz_results = :qr',
            ExpressionAttributeValues={':qr': quiz_results}
        )
        
        return success_response({
            'message': 'Quiz results saved',
            'quiz_results': quiz_results
        })
        
    except Exception as e:
        return error_response(500, str(e))

def get_quiz(event, context):
    """Get user quiz results"""
    try:
        # Verify token
        token = event['headers'].get('Authorization', '').replace('Bearer ', '')
        user_data = verify_token(token)
        if not user_data:
            return error_response(401, "Unauthorized")
        
        # Get user
        response = users_table.get_item(Key={'email': user_data['email']})
        if 'Item' not in response:
            return error_response(404, "User not found")
        
        user = response['Item']
        
        return success_response({
            'quiz_results': user.get('quiz_results', {})
        })
        
    except Exception as e:
        return error_response(500, str(e))
