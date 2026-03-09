import jwt
import os
import json
import requests
import boto3
from datetime import datetime, timezone, timedelta
from jose import jwt as jose_jwt, JWTError
from jose.exceptions import JWKError

# Configuration
ALGORITHM = 'HS256'
COGNITO_REGION = os.getenv('AWS_REGION', 'us-east-1')
COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')

# JWKS caching (global to Lambda container for reuse)
_jwks_cache = {
    'keys': None,
    'expires_at': None
}
JWKS_CACHE_TTL = 300  # 5 minutes

# JWT secret caching (global to Lambda container for reuse)
_jwt_secret_cache = {
    'secret': None,
    'expires_at': None
}
JWT_SECRET_CACHE_TTL = 3600  # 1 hour


def get_jwt_secret():
    """Fetch JWT secret from AWS Secrets Manager with caching"""
    global _jwt_secret_cache

    # Check if cache is valid
    now = datetime.now(timezone.utc).timestamp()
    if _jwt_secret_cache['secret'] and _jwt_secret_cache['expires_at'] and now < _jwt_secret_cache['expires_at']:
        return _jwt_secret_cache['secret']

    # Try to fetch from Secrets Manager
    try:
        secrets_client = boto3.client('secretsmanager', region_name=COGNITO_REGION)
        response = secrets_client.get_secret_value(SecretId='tripcraft/jwt-secret')

        secret_data = json.loads(response['SecretString'])
        secret_key = secret_data.get('key')

        if not secret_key:
            raise ValueError("Secret key not found in Secrets Manager response")

        # Cache the secret
        _jwt_secret_cache['secret'] = secret_key
        _jwt_secret_cache['expires_at'] = now + JWT_SECRET_CACHE_TTL

        return secret_key
    except Exception as e:
        print(f"Error fetching JWT secret from Secrets Manager: {str(e)}")
        # Fall back to environment variable if Secrets Manager fails
        fallback_secret = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')

        # Use expired cache if available, otherwise use fallback
        if _jwt_secret_cache['secret']:
            print("Using expired JWT secret cache as fallback")
            return _jwt_secret_cache['secret']

        print("Using JWT_SECRET environment variable as fallback")
        return fallback_secret


def get_cognito_jwks():
    """Fetch Cognito JSON Web Key Set (JWKS) with caching"""
    global _jwks_cache

    # Check if cache is valid
    now = datetime.now(timezone.utc).timestamp()
    if _jwks_cache['keys'] and _jwks_cache['expires_at'] and now < _jwks_cache['expires_at']:
        return _jwks_cache['keys']

    # Fetch JWKS from Cognito
    if not COGNITO_USER_POOL_ID:
        raise ValueError("COGNITO_USER_POOL_ID environment variable not set")

    jwks_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

    try:
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
        jwks = response.json()

        # Cache the JWKS
        _jwks_cache['keys'] = jwks
        _jwks_cache['expires_at'] = now + JWKS_CACHE_TTL

        return jwks
    except Exception as e:
        print(f"Error fetching JWKS: {str(e)}")
        # If fetch fails but we have cached keys, use them even if expired
        if _jwks_cache['keys']:
            print("Using expired JWKS cache as fallback")
            return _jwks_cache['keys']
        raise


def verify_cognito_token(token: str) -> dict:
    """
    Verify Cognito JWT token with proper signature validation.

    This function:
    1. Fetches the Cognito JWKS (public keys)
    2. Verifies the token signature using the appropriate key
    3. Validates claims (issuer, audience, expiration, token_use)

    Args:
        token: Cognito JWT token string

    Returns:
        dict: Decoded token payload if valid

    Raises:
        ValueError: If token is invalid, expired, or verification fails
    """
    try:
        # Get JWKS
        jwks = get_cognito_jwks()

        # Decode token header to get key ID (kid)
        unverified_header = jose_jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')

        if not kid:
            raise ValueError("Token missing 'kid' in header")

        # Find the matching key in JWKS
        key = None
        for jwk_key in jwks.get('keys', []):
            if jwk_key.get('kid') == kid:
                key = jwk_key
                break

        if not key:
            raise ValueError(f"Public key not found for kid: {kid}")

        # Verify and decode token with signature validation
        # This will check:
        # - Signature is valid using the public key
        # - Token hasn't expired
        # - Issuer matches Cognito User Pool
        issuer = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"

        payload = jose_jwt.decode(
            token,
            key,
            algorithms=['RS256'],  # Cognito uses RS256
            audience=None,  # Cognito ID tokens don't always have audience
            issuer=issuer,
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_iss': True,
                'verify_aud': False,  # Disable audience verification for Cognito ID tokens
            }
        )

        # Additional validation for token_use claim
        token_use = payload.get('token_use')
        if token_use not in ['id', 'access']:
            raise ValueError(f"Invalid token_use: {token_use}. Expected 'id' or 'access'")

        return payload

    except JWTError as e:
        raise ValueError(f"JWT verification failed: {str(e)}")
    except JWKError as e:
        raise ValueError(f"JWK error: {str(e)}")
    except Exception as e:
        raise ValueError(f"Token verification error: {str(e)}")


def generate_token(user_id: str, email: str) -> str:
    """Generate custom JWT token (for testing/non-Cognito use cases)"""

    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }

    secret_key = get_jwt_secret()
    token = jwt.encode(payload, secret_key, algorithm=ALGORITHM)
    return token


def verify_token(token: str) -> dict:
    """
    Verify JWT token - handles both Cognito tokens and custom tokens.

    Attempts to verify as Cognito token first (with signature verification),
    then falls back to custom JWT if needed.

    Args:
        token: JWT token string

    Returns:
        dict: Decoded token payload if valid, None if invalid
    """
    # First, try to verify as Cognito token (most common case)
    try:
        payload = verify_cognito_token(token)
        # If successful, it's a valid Cognito token
        return payload
    except ValueError as e:
        # Not a Cognito token or verification failed
        print(f"Cognito verification failed: {str(e)}, trying custom JWT")

    # Fall back to custom JWT verification
    try:
        secret_key = get_jwt_secret()
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("Custom JWT expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Custom JWT invalid: {str(e)}")
        return None


def extract_user_id(event: dict) -> str:
    """
    Extract user_id from JWT token in Authorization header.

    This function:
    1. Extracts the token from the Authorization header
    2. Verifies the token (with proper signature validation for Cognito)
    3. Extracts the user_id from various possible claim names

    Args:
        event: Lambda event dict containing headers

    Returns:
        str: User ID extracted from token

    Raises:
        ValueError: If authentication fails for any reason
    """
    try:
        # Get Authorization header (case-insensitive)
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')

        if not auth_header:
            raise ValueError('No Authorization header provided')

        # Extract token from "Bearer <token>" format
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise ValueError('Invalid Authorization header format. Expected: Bearer <token>')

        token = parts[1]

        # Verify token with signature validation
        payload = verify_token(token)
        if not payload:
            raise ValueError('Invalid or expired token')

        # Extract user_id from payload
        # Priority order: sub (Cognito standard), user_id (custom), cognito:username, username
        user_id = (
            payload.get('sub') or  # Cognito standard claim
            payload.get('user_id') or  # Custom JWT
            payload.get('cognito:username') or  # Cognito fallback
            payload.get('username')  # Generic fallback
        )

        if not user_id:
            raise ValueError('No user identifier found in token')

        return user_id

    except ValueError:
        # Re-raise ValueError as-is
        raise
    except Exception as e:
        # Wrap unexpected errors
        raise ValueError(f'Authentication failed: {str(e)}')
