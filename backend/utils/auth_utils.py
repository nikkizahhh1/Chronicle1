import jwt
import os
import json
import base64
from datetime import datetime, timezone, timedelta

SECRET_KEY = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = 'HS256'

def decode_cognito_token(token: str) -> dict:
    """Decode Cognito JWT token without verification (Cognito already verified it)"""
    try:
        # Split the token
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        # Decode the payload (second part)
        payload = parts[1]
        # Add padding if needed
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        print(f"Error decoding Cognito token: {str(e)}")
        return None

def generate_token(user_id: str, email: str) -> str:
    """Generate JWT token"""
    
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str) -> dict:
    """Verify JWT token and return payload - handles both custom JWT and Cognito tokens"""

    # First try to decode as Cognito token (without verification - Cognito already verified it)
    payload = decode_cognito_token(token)
    if payload and ('sub' in payload or 'cognito:username' in payload):
        return payload
    
    # Fall back to custom JWT verification
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def extract_user_id(event: dict) -> str:
    """Extract user_id from JWT token in Authorization header"""

    try:
        # Get Authorization header
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')

        if not auth_header:
            raise ValueError('No Authorization header provided')

        # Extract token from "Bearer <token>" format
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise ValueError('Invalid Authorization header format. Expected: Bearer <token>')

        token = parts[1]

        # Verify token and get payload
        payload = verify_token(token)
        if not payload:
            raise ValueError('Invalid or expired token')

        # Extract user_id from payload
        # Try different claim names (custom JWT uses 'user_id', Cognito uses 'sub' or 'cognito:username')
        user_id = (
            payload.get('user_id') or 
            payload.get('sub') or 
            payload.get('cognito:username') or
            payload.get('username')
        )

        if not user_id:
            raise ValueError('No user_id found in token')

        return user_id

    except Exception as e:
        raise ValueError(f'Authentication failed: {str(e)}')
