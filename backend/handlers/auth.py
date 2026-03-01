import json
import boto3
import os
from datetime import datetime, timezone
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.response import success_response, error_response

# Cognito client
cognito = boto3.client('cognito-idp', region_name='us-east-1')

# Get Cognito User Pool ID and Client ID from environment
USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID', '')
CLIENT_ID = os.getenv('COGNITO_CLIENT_ID', '')

users_table = get_dynamodb_table('users')

def signup(event, context):
    """Handle user signup with Cognito"""
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return error_response(400, "Email and password required")
        
        # Sign up user in Cognito
        try:
            response = cognito.sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                Password=password,
                UserAttributes=[
                    {'Name': 'email', 'Value': email}
                ]
            )
            
            user_sub = response['UserSub']  # Cognito user ID
            
            # Create user record in DynamoDB
            user = {
                'user_id': user_sub,
                'email': email,
                'quiz_results': {},
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            users_table.put_item(Item=user)
            
            return success_response({
                'user_id': user_sub,
                'email': email,
                'message': 'User created successfully. Please check your email to verify your account.'
            })
            
        except cognito.exceptions.UsernameExistsException:
            return error_response(400, "User already exists")
        except cognito.exceptions.InvalidPasswordException as e:
            return error_response(400, f"Invalid password: {str(e)}")
        except Exception as e:
            return error_response(500, f"Cognito error: {str(e)}")
        
    except Exception as e:
        return error_response(500, str(e))

def login(event, context):
    """Handle user login with Cognito"""
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return error_response(400, "Email and password required")
        
        # Authenticate with Cognito
        try:
            response = cognito.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )
            
            # Get tokens from Cognito
            id_token = response['AuthenticationResult']['IdToken']
            access_token = response['AuthenticationResult']['AccessToken']
            refresh_token = response['AuthenticationResult']['RefreshToken']
            
            # Get user info from Cognito
            user_info = cognito.get_user(AccessToken=access_token)
            
            # Extract user_sub (Cognito user ID)
            user_sub = None
            for attr in user_info['UserAttributes']:
                if attr['Name'] == 'sub':
                    user_sub = attr['Value']
                    break
            
            return success_response({
                'user_id': user_sub,
                'email': email,
                'id_token': id_token,
                'access_token': access_token,
                'refresh_token': refresh_token
            })
            
        except cognito.exceptions.NotAuthorizedException:
            return error_response(401, "Invalid credentials")
        except cognito.exceptions.UserNotConfirmedException:
            return error_response(401, "User email not verified. Please check your email.")
        except Exception as e:
            return error_response(500, f"Cognito error: {str(e)}")
        
    except Exception as e:
        return error_response(500, str(e))

def confirm_signup(event, context):
    """Confirm user signup with verification code"""
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        code = body.get('code')
        
        if not email or not code:
            return error_response(400, "Email and verification code required")
        
        try:
            cognito.confirm_sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                ConfirmationCode=code
            )
            
            return success_response({
                'message': 'Email verified successfully. You can now log in.'
            })
            
        except cognito.exceptions.CodeMismatchException:
            return error_response(400, "Invalid verification code")
        except cognito.exceptions.ExpiredCodeException:
            return error_response(400, "Verification code expired")
        except Exception as e:
            return error_response(500, f"Cognito error: {str(e)}")
        
    except Exception as e:
        return error_response(500, str(e))

def resend_confirmation(event, context):
    """Resend confirmation code"""
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        
        if not email:
            return error_response(400, "Email required")
        
        try:
            cognito.resend_confirmation_code(
                ClientId=CLIENT_ID,
                Username=email
            )
            
            return success_response({
                'message': 'Verification code sent to your email.'
            })
            
        except Exception as e:
            return error_response(500, f"Cognito error: {str(e)}")
        
    except Exception as e:
        return error_response(500, str(e))
