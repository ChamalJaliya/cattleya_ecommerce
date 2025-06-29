#!/usr/bin/env python3
"""
Setup script for Cattleya NLP Service
This script helps set up the environment and install dependencies
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def create_env_file():
    """Create .env file from env.sample if it doesn't exist"""
    env_sample = Path("env.sample")
    env_file = Path(".env")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return
    
    if env_sample.exists():
        shutil.copy(env_sample, env_file)
        print("✅ Created .env file from env.sample")
        print("⚠️  Please edit .env file with your actual API keys and configuration")
    else:
        print("❌ env.sample file not found")
        sys.exit(1)

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing Python dependencies...")
    
    # Core dependencies
    core_packages = [
        "fastapi",
        "uvicorn[standard]",
        "python-dotenv",
        "httpx",
        "aiohttp",
        "openai",
        "spacy",
        "textblob",
        "speech_recognition",
        "pydantic",
        "redis",
        "pymongo",
        "beautifulsoup4",
        "lxml",
        "requests",
        "python-multipart"
    ]
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install"] + core_packages, check=True)
        print("✅ Core dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install core dependencies: {e}")
        return False
    
    # Install spaCy model
    try:
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
        print("✅ spaCy model installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install spaCy model: {e}")
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    directories = ["logs", "uploads", "cache"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def check_optional_dependencies():
    """Check and suggest optional dependencies"""
    optional_packages = {
        "google-api-python-client": "Google Custom Search API",
        "serpapi": "SerpAPI for web search",
        "pytest": "Testing framework",
        "pytest-asyncio": "Async testing support",
        "black": "Code formatting",
        "flake8": "Code linting"
    }
    
    print("\n📋 Optional dependencies (install as needed):")
    for package, description in optional_packages.items():
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package} - {description}")
        except ImportError:
            print(f"❌ {package} - {description}")

def main():
    """Main setup function"""
    print("🚀 Setting up Cattleya NLP Service...\n")
    
    # Check Python version
    check_python_version()
    
    # Create .env file
    create_env_file()
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Setup failed during dependency installation")
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Check optional dependencies
    check_optional_dependencies()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Edit .env file with your API keys")
    print("2. Start the service: python -m uvicorn main:app --reload")
    print("3. Test the API: http://localhost:8000/docs")
    
    print("\n🔑 Required API Keys:")
    print("- OPENAI_API_KEY: Get from https://platform.openai.com/api-keys")
    print("- SERPAPI_API_KEY: Get from https://serpapi.com/")
    print("- GOOGLE_API_KEY: Get from https://console.cloud.google.com/")
    print("- GOOGLE_CSE_ID: Create Custom Search Engine at https://cse.google.com/")

if __name__ == "__main__":
    main() 