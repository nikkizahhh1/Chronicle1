import json
import base64
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.s3_utils import (
    upload_profile_photo as s3_upload_profile_photo,
    upload_trip_photo as s3_upload_trip_photo,
    upload_poi_image as s3_upload_poi_image,
    delete_file as s3_delete_file
)
from utils.response import success_response, error_response
from utils.dynamodb import get_dynamodb_table

users_table = get_dynamodb_table('users')
trips_table = get_dynamodb_table('trips')

def upload_profile_photo(event, context):
    """Upload user profile photo (Lambda handler)"""
    
    try:
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        file_data = body.get('file_data')  # Base64 encoded
        file_name = body.get('file_name')
        content_type = body.get('content_type', 'image/jpeg')
        
        if not all([user_id, file_data, file_name]):
            return error_response(400, "user_id, file_data, and file_name required")
        
        # Decode base64 file data
        try:
            file_content = base64.b64decode(file_data)
        except Exception as e:
            return error_response(400, f"Invalid base64 file data: {str(e)}")
        
        # Upload to S3
        s3_url = s3_upload_profile_photo(file_content, file_name, content_type, user_id)
        
        if not s3_url:
            return error_response(500, "Failed to upload photo")
        
        # Update user record with photo URL
        try:
            users_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression='SET profile_photo_url = :url',
                ExpressionAttributeValues={':url': s3_url}
            )
        except Exception as e:
            print(f"Warning: Failed to update user record: {e}")
        
        return success_response({
            'photo_url': s3_url,
            'message': 'Profile photo uploaded successfully'
        })
        
    except ValueError as e:
        return error_response(400, str(e))
    except Exception as e:
        return error_response(500, str(e))

def upload_trip_photo(event, context):
    """Upload trip photo (Lambda handler)"""
    
    try:
        body = json.loads(event['body'])
        trip_id = body.get('trip_id')
        file_data = body.get('file_data')  # Base64 encoded
        file_name = body.get('file_name')
        content_type = body.get('content_type', 'image/jpeg')
        caption = body.get('caption', '')
        
        if not all([trip_id, file_data, file_name]):
            return error_response(400, "trip_id, file_data, and file_name required")
        
        # Decode base64 file data
        try:
            file_content = base64.b64decode(file_data)
        except Exception as e:
            return error_response(400, f"Invalid base64 file data: {str(e)}")
        
        # Upload to S3
        s3_url = s3_upload_trip_photo(file_content, file_name, content_type, trip_id)
        
        if not s3_url:
            return error_response(500, "Failed to upload photo")
        
        # Add photo to trip record
        try:
            # Get current trip
            response = trips_table.get_item(Key={'trip_id': trip_id})
            trip = response.get('Item', {})
            
            # Add photo to photos array
            photos = trip.get('photos', [])
            photos.append({
                'url': s3_url,
                'caption': caption,
                'uploaded_at': context.request_time_epoch if hasattr(context, 'request_time_epoch') else None
            })
            
            trips_table.update_item(
                Key={'trip_id': trip_id},
                UpdateExpression='SET photos = :photos',
                ExpressionAttributeValues={':photos': photos}
            )
        except Exception as e:
            print(f"Warning: Failed to update trip record: {e}")
        
        return success_response({
            'photo_url': s3_url,
            'message': 'Trip photo uploaded successfully'
        })
        
    except ValueError as e:
        return error_response(400, str(e))
    except Exception as e:
        return error_response(500, str(e))

def delete_upload(event, context):
    """Delete photo from S3 (Lambda handler)"""

    try:
        body = json.loads(event['body'])
        photo_url = body.get('photo_url')

        if not photo_url:
            return error_response(400, "photo_url required")

        # Delete from S3
        success = s3_delete_file(photo_url)

        if not success:
            return error_response(500, "Failed to delete photo")

        return success_response({
            'message': 'Photo deleted successfully'
        })

    except Exception as e:
        return error_response(500, str(e))

def upload_poi_image(event, context):
    """Upload POI image (Lambda handler)"""

    try:
        body = json.loads(event['body'])
        poi_id = body.get('poi_id')
        file_data = body.get('file_data')  # Base64 encoded
        file_name = body.get('file_name')
        content_type = body.get('content_type', 'image/jpeg')

        if not all([poi_id, file_data, file_name]):
            return error_response(400, "poi_id, file_data, and file_name required")

        # Decode base64 file data
        try:
            file_content = base64.b64decode(file_data)
        except Exception as e:
            return error_response(400, f"Invalid base64 file data: {str(e)}")

        # Upload to S3
        s3_url = s3_upload_poi_image(file_content, file_name, content_type, poi_id)

        if not s3_url:
            return error_response(500, "Failed to upload POI image")

        return success_response({
            'image_url': s3_url,
            'message': 'POI image uploaded successfully'
        })

    except ValueError as e:
        return error_response(400, str(e))
    except Exception as e:
        return error_response(500, str(e))

def upload_itinerary_pdf(event, context):
    """Upload/generate itinerary PDF (Lambda handler)"""

    try:
        body = json.loads(event['body'])
        trip_id = body.get('trip_id')

        if not trip_id:
            return error_response(400, "trip_id required")

        # Get trip data
        response = trips_table.get_item(Key={'trip_id': trip_id})
        trip = response.get('Item')

        if not trip:
            return error_response(404, "Trip not found")

        # TODO: Implement PDF generation using reportlab or weasyprint
        # For now, return placeholder response
        return success_response({
            'message': 'PDF generation not yet implemented',
            'trip_id': trip_id,
            'status': 'pending'
        })

    except ValueError as e:
        return error_response(400, str(e))
    except Exception as e:
        return error_response(500, str(e))
