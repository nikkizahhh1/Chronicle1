import jwt
import os
from datetime import datetime, timezone, timedelta

SECRET_KEY = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = 'HS256'

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
    """Verify JWT token and return payload"""

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
        user_id = payload.get('user_id')
        if not user_id:
            # Fallback to 'sub' claim (Cognito standard)
            user_id = payload.get('sub')

        if not user_id:
            raise ValueError('No user_id found in token')

        return user_id

    except Exception as e:
        raise ValueError(f'Authentication failed: {str(e)}')
