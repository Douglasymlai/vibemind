#!/usr/bin/env python3
"""
FastAPI server for Vibe Mind - Multimodal Prompt Enrichment Tool
Provides REST API endpoints for the frontend to interact with the backend.
"""

import os
import json
import base64
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import shutil

from vibe_mind import StructuredImageAnalyzer, UserProfile

# Pydantic models for request/response
class ApiKeyRequest(BaseModel):
    api_key: str

class AnalysisRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    image_filename: Optional[str] = None
    message: str
    profile_key: Optional[str] = None
    api_key: str

class ProfileRequest(BaseModel):
    name: str
    description: str
    analysis_steps: List[str]
    report_template: str
    template_mapping: Dict[str, str] = {}
    summary_text: str = ""

class ProfileUpdateRequest(BaseModel):
    profile_key: str
    profile_data: ProfileRequest

# Initialize FastAPI app
app = FastAPI(
    title="Vibe Mind API",
    description="Multimodal Prompt Enrichment Tool API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "chrome-extension://*",   # Chrome extension
        "https://v0.dev",         # V0.dev
        "https://v0.app",         # V0.app
        "https://magicpattern.design",  # Magic Pattern
        "https://lovable.dev",    # Lovable.dev
        "https://claude.ai",      # Claude AI
        "https://chatgpt.com",    # ChatGPT
        "https://chat.openai.com", # ChatGPT alternative URL
        "https://gemini.google.com", # Google Gemini
        "https://www.figma.com",  # Figma
        "https://linear.app",     # Linear
        "https://notion.so",      # Notion
        "https://*.notion.so",    # Notion subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global analyzer instance
analyzer = None

def get_analyzer() -> StructuredImageAnalyzer:
    """Get or create the analyzer instance."""
    global analyzer
    if analyzer is None:
        analyzer = StructuredImageAnalyzer()
    return analyzer

def set_openai_api_key(api_key: str):
    """Set the OpenAI API key in environment variables."""
    os.environ['OPENAI_API_KEY'] = api_key

@app.post("/api/set-api-key")
async def set_api_key(request: ApiKeyRequest):
    """Set the OpenAI API key."""
    try:
        set_openai_api_key(request.api_key)
        return {"status": "success", "message": "API key set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to set API key: {str(e)}")

@app.get("/api/profiles")
async def get_profiles():
    """Get all available user profiles."""
    try:
        analyzer_instance = get_analyzer()
        profiles = analyzer_instance.get_available_profiles()
        
        # Convert UserProfile objects to dictionaries
        profiles_dict = {}
        for key, profile in profiles.items():
            profiles_dict[key] = profile.to_dict()
        
        return {"status": "success", "profiles": profiles_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profiles: {str(e)}")

@app.post("/api/profiles")
async def create_profile(request: ProfileRequest):
    """Create a new user profile."""
    try:
        analyzer_instance = get_analyzer()
        profile_data = request.dict()
        
        success = analyzer_instance.create_profile(request.name, profile_data)
        if success:
            return {"status": "success", "message": "Profile created successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to create profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@app.put("/api/profiles/{profile_key}")
async def update_profile(profile_key: str, request: ProfileRequest):
    """Update an existing user profile."""
    try:
        analyzer_instance = get_analyzer()
        profile_data = request.dict()
        
        success = analyzer_instance.update_profile(profile_key, profile_data)
        if success:
            return {"status": "success", "message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@app.delete("/api/profiles/{profile_key}")
async def delete_profile(profile_key: str):
    """Delete a user profile."""
    try:
        analyzer_instance = get_analyzer()
        success = analyzer_instance.delete_profile(profile_key)
        if success:
            return {"status": "success", "message": "Profile deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete profile: {str(e)}")

@app.post("/api/analyze")
async def analyze_image(request: AnalysisRequest):
    """Analyze an image with optional profile."""
    try:
        # Set API key if provided
        if request.api_key:
            set_openai_api_key(request.api_key)
        
        analyzer_instance = get_analyzer()
        
        # Handle base64 image data
        image_input = None
        if request.image_base64:
            # Create a temporary file from base64 data
            import base64
            image_data = base64.b64decode(request.image_base64)
            
            # Create temp file with appropriate extension
            file_extension = '.jpg'  # default
            if request.image_filename:
                file_extension = os.path.splitext(request.image_filename)[1] or '.jpg'
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
                tmp_file.write(image_data)
                image_input = tmp_file.name
        elif request.image_url:
            image_input = request.image_url
        
        try:
            if request.profile_key:
                # Profile-based analysis
                profiles = analyzer_instance.get_available_profiles()
                if request.profile_key not in profiles:
                    raise HTTPException(status_code=404, detail="Profile not found")
                
                profile = profiles[request.profile_key]
                
                # Use message as custom text if provided
                custom_text = request.message if request.message.strip() else None
                
                structured_result = analyzer_instance.analyze_with_profile(
                    image_url=image_input,
                    profile=profile,
                    custom_text=custom_text
                )
                
                # Generate markdown report
                markdown_report = analyzer_instance.generate_markdown_report(structured_result, profile)
                summarized_report = analyzer_instance.summarize_markdown(markdown_report, max_words=300)
                
                # Save reports
                original_filename = analyzer_instance.save_markdown_report(markdown_report)
                summarized_filename = analyzer_instance.save_summarized_markdown(summarized_report)
                
                return {
                    "status": "success",
                    "structured_result": structured_result,
                    "markdown_report": markdown_report,
                    "summarized_report": summarized_report,
                    "files": {
                        "original_report": original_filename,
                        "summarized_report": summarized_filename
                    }
                }
            else:
                # Simple message-based analysis
                structured_result = analyzer_instance.analyze_with_message(
                    image_url=image_input,
                    message=request.message,
                    save_result=True
                )
                
                return {
                    "status": "success",
                    "structured_result": structured_result
                }
        
        finally:
            # Clean up temporary file if it was created
            if request.image_base64 and image_input and os.path.exists(image_input):
                os.unlink(image_input)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analyze-upload")
async def analyze_uploaded_image(
    file: UploadFile = File(...),
    message: str = Form(...),
    profile_key: Optional[str] = Form(None),
    api_key: str = Form(...)
):
    """Analyze an uploaded image file."""
    try:
        # Set API key
        set_openai_api_key(api_key)
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            temp_path = tmp_file.name
        
        try:
            analyzer_instance = get_analyzer()
            
            if profile_key:
                # Profile-based analysis
                profiles = analyzer_instance.get_available_profiles()
                if profile_key not in profiles:
                    raise HTTPException(status_code=404, detail="Profile not found")
                
                profile = profiles[profile_key]
                custom_text = message if message.strip() else None
                
                structured_result = analyzer_instance.analyze_with_profile(
                    image_url=temp_path,
                    profile=profile,
                    custom_text=custom_text
                )
                
                # Generate reports
                markdown_report = analyzer_instance.generate_markdown_report(structured_result, profile)
                summarized_report = analyzer_instance.summarize_markdown(markdown_report, max_words=300)
                
                # Save reports
                original_filename = analyzer_instance.save_markdown_report(markdown_report)
                summarized_filename = analyzer_instance.save_summarized_markdown(summarized_report)
                
                return {
                    "status": "success",
                    "structured_result": structured_result,
                    "markdown_report": markdown_report,
                    "summarized_report": summarized_report,
                    "files": {
                        "original_report": original_filename,
                        "summarized_report": summarized_filename
                    }
                }
            else:
                # Simple message-based analysis
                structured_result = analyzer_instance.analyze_with_message(
                    image_url=temp_path,
                    message=message,
                    save_result=True
                )
                
                return {
                    "status": "success",
                    "structured_result": structured_result
                }
                
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/shutdown")
async def shutdown_server():
    """Gracefully shutdown the server."""
    import os
    import signal
    
    def shutdown():
        # Give time for response to be sent
        import time
        time.sleep(0.5)
        os.kill(os.getpid(), signal.SIGTERM)
    
    # Schedule shutdown in background
    import threading
    threading.Thread(target=shutdown, daemon=True).start()
    
    return {"status": "shutting down", "message": "Server shutdown initiated"}

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Vibe Mind API",
        "version": "1.0.0",
        "description": "Multimodal Prompt Enrichment Tool API",
        "endpoints": {
            "health": "/api/health",
            "profiles": "/api/profiles",
            "analyze": "/api/analyze",
            "analyze_upload": "/api/analyze-upload",
            "set_api_key": "/api/set-api-key"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
