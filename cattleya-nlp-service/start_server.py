import os
import uvicorn
from dotenv import load_dotenv

print("🚀 Starting FastAPI server...")
# Load environment variables from .env if present
load_dotenv()

# Set the OpenAI API key from environment (do not hardcode)
openai_api_key = os.environ.get('OPENAI_API_KEY')
if not openai_api_key:
    print("⚠️  WARNING: OPENAI_API_KEY is not set in environment variables or .env file!")
else:
    print(f"✅ OpenAI API Key set: {openai_api_key[:8]}...{'*' * (len(openai_api_key)-8) if len(openai_api_key) > 8 else ''}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True) 