import boto3
import os

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))

def get_dynamodb_table(table_name: str):
    """Get DynamoDB table resource"""
    return dynamodb.Table(table_name)

def batch_write_items(table_name: str, items: list):
    """Batch write items to DynamoDB"""
    table = get_dynamodb_table(table_name)
    
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)
