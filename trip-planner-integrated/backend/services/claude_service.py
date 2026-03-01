import boto3
import json
import os
from typing import Dict, Any

class ClaudeService:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
        self.model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-sonnet-4-6-20260217-v1:0')
    
    def generate_itinerary(self, system_prompt: str, user_prompt: str) -> str:
        # Check if using Nova model (different API format)
        if 'nova' in self.model_id.lower():
            body = json.dumps({
                "messages": [
                    {
                        "role": "user",
                        "content": [{"text": f"{system_prompt}\n\n{user_prompt}"}]
                    }
                ],
                "inferenceConfig": {
                    "max_new_tokens": 4096,
                    "temperature": 0.7
                }
            })
        else:
            # Claude format
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4096,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                "temperature": 0.7
            })
        
        response = self.bedrock.invoke_model(
            modelId=self.model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        
        # Parse response based on model type
        if 'nova' in self.model_id.lower():
            return response_body['output']['message']['content'][0]['text']
        else:
            return response_body['content'][0]['text']
