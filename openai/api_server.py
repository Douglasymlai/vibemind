#!/usr/bin/env python3
"""
FastAPI server for Vibe Mind OpenAI Backend
Provides REST API endpoints compatible with the Chrome extension.
"""

import os
import json
import base64
import tempfile
import shutil
from datetime import datetime
from typing import Dict, Any, Optional, List, Union
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import the OpenAI backend
from vibe_mind import VibeMindOpenAI, DesignHandoff

# Pydantic models for request/response
class ApiKeyRequest(BaseModel):
    api_key: str

class AnalysisRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    image_filename: Optional[str] = None
    message: str
    profile_key: Optional[str] = None
    platform_target: Optional[str] = "v0"
    api_key: str

class ProfileRequest(BaseModel):
    name: str
    description: str
    analysis_steps: List[str]
    platform_targets: List[str] = ["v0", "magic-pattern", "lovable"]
    specializations: List[str] = []

# Initialize FastAPI app
app = FastAPI(
    title="Vibe Mind OpenAI API",
    description="OpenAI SDK-based Multimodal Prompt Enrichment Tool API",
    version="2.0.0"
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

def get_analyzer(api_key: Optional[str] = None) -> VibeMindOpenAI:
    """Get or create the analyzer instance with optional API key."""
    global analyzer
    # Always create a new instance if API key is provided or if no instance exists
    if api_key or analyzer is None:
        analyzer = VibeMindOpenAI(api_key=api_key)
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
    """Get all available designer profiles."""
    try:
        analyzer_instance = get_analyzer()
        profiles = analyzer_instance.profiles
        
        # Convert DesignerProfile objects to dictionaries
        profiles_dict = {}
        for key, profile in profiles.items():
            profiles_dict[key] = {
                "name": profile.name,
                "description": profile.description,
                "analysis_steps": profile.analysis_steps,
                "platform_targets": profile.platform_targets,
                "specializations": profile.specializations
            }
        
        return {"status": "success", "profiles": profiles_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profiles: {str(e)}")

@app.get("/api/platforms")
async def get_platforms():
    """Get all available platform targets."""
    try:
        analyzer_instance = get_analyzer()
        platforms = analyzer_instance.get_available_platforms()
        
        # Get platform info
        platform_info = {}
        for platform in platforms:
            platform_info[platform] = analyzer_instance.get_platform_info(platform)
        
        return {"status": "success", "platforms": platform_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get platforms: {str(e)}")

@app.post("/api/analyze")
async def analyze_image(request: AnalysisRequest):
    """Analyze an image with optional profile and platform target."""
    try:
        # Set API key if provided
        if request.api_key:
            set_openai_api_key(request.api_key)
        
        analyzer_instance = get_analyzer(api_key=request.api_key)
        
        # Handle base64 image data
        image_input = None
        if request.image_base64:
            # Create a temporary file from base64 data
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
        else:
            # Text-only analysis (no image)
            if not request.message.strip():
                raise HTTPException(status_code=400, detail="No image or message provided")
            
            # For text-only analysis, we'll create a simple response
            return {
                "status": "success",
                "structured_result": {
                    "analysis_result": f"Text analysis: {request.message}",
                    "confidence_score": 0.8
                },
                "summarized_report": f"Enhanced prompt: {request.message}"
            }
        
        try:
            # Determine profile and platform
            profile_key = request.profile_key or "product_designer"
            platform_target = request.platform_target or "v0"
            
            # Check if profile exists
            if profile_key not in analyzer_instance.profiles:
                # Use default profile if specified one doesn't exist
                available_profiles = list(analyzer_instance.profiles.keys())
                if available_profiles:
                    profile_key = available_profiles[0]
                else:
                    raise HTTPException(status_code=404, detail="No profiles available")
            
            # Perform analysis
            handoff = analyzer_instance.analyze_image(
                image_input=image_input,
                designer_profile_key=profile_key,
                platform_target=platform_target,
                project_context={"message": request.message} if request.message else None,
                output_mode="json"
            )
            
            # Convert DesignHandoff to compatible format
            structured_result = {
                "analysis_result": handoff.prompt_for_platform,
                "confidence_score": handoff.confidence_score,
                "designer_profile": handoff.designer_profile,
                "platform_target": handoff.platform_target,
                "dominant_colors": [{"hex": color.hex, "name": color.name} for color in handoff.dominant_colors],
                "components": [{"type": comp.type, "description": comp.description} for comp in handoff.components],
                "uncertain_flags": handoff.uncertain_flags
            }
            
            # Generate summarized report
            summarized_report = handoff.prompt_for_platform
            if len(summarized_report) > 500:
                summarized_report = summarized_report[:500] + "..."
            
            # Save handoff if needed
            try:
                output_file = analyzer_instance.save_handoff(handoff)
            except Exception as e:
                print(f"Warning: Could not save handoff: {e}")
                output_file = None
            
            return {
                "status": "success",
                "structured_result": structured_result,
                "summarized_report": summarized_report,
                "files": {
                    "handoff_file": output_file
                }
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
    platform_target: Optional[str] = Form("v0"),
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
            analyzer_instance = get_analyzer(api_key=api_key)
            
            # Determine profile and platform
            profile_key = profile_key or "product_designer"
            platform_target = platform_target or "v0"
            
            # Check if profile exists
            if profile_key not in analyzer_instance.profiles:
                available_profiles = list(analyzer_instance.profiles.keys())
                if available_profiles:
                    profile_key = available_profiles[0]
                else:
                    raise HTTPException(status_code=404, detail="No profiles available")
            
            # Perform analysis
            handoff = analyzer_instance.analyze_image(
                image_input=temp_path,
                designer_profile_key=profile_key,
                platform_target=platform_target,
                project_context={"message": message} if message else None,
                output_mode="json"
            )
            
            # Convert DesignHandoff to compatible format
            structured_result = {
                "analysis_result": handoff.prompt_for_platform,
                "confidence_score": handoff.confidence_score,
                "designer_profile": handoff.designer_profile,
                "platform_target": handoff.platform_target,
                "dominant_colors": [{"hex": color.hex, "name": color.name} for color in handoff.dominant_colors],
                "components": [{"type": comp.type, "description": comp.description} for comp in handoff.components],
                "uncertain_flags": handoff.uncertain_flags
            }
            
            # Generate summarized report
            summarized_report = handoff.prompt_for_platform
            if len(summarized_report) > 500:
                summarized_report = summarized_report[:500] + "..."
            
            # Save handoff if needed
            try:
                output_file = analyzer_instance.save_handoff(handoff)
            except Exception as e:
                print(f"Warning: Could not save handoff: {e}")
                output_file = None
            
            return {
                "status": "success",
                "structured_result": structured_result,
                "summarized_report": summarized_report,
                "files": {
                    "handoff_file": output_file
                }
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
    try:
        # Check if analyzer can be initialized
        analyzer_instance = get_analyzer()
        profile_count = len(analyzer_instance.profiles)
        platform_count = len(analyzer_instance.platform_handoffs)
        
        return {
            "status": "healthy", 
            "timestamp": datetime.now().isoformat(),
            "profiles_loaded": profile_count,
            "platforms_available": platform_count,
            "openai_configured": bool(os.getenv("OPENAI_API_KEY"))
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

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
        "name": "Vibe Mind OpenAI API",
        "version": "2.0.0",
        "description": "OpenAI SDK-based Multimodal Prompt Enrichment Tool API",
        "endpoints": {
            "health": "/api/health",
            "profiles": "/api/profiles",
            "platforms": "/api/platforms",
            "analyze": "/api/analyze",
            "analyze_upload": "/api/analyze-upload",
            "set_api_key": "/api/set-api-key"
        },
        "features": [
            "OpenAI Vision API integration",
            "Designer profile-based analysis",
            "Platform-specific handoff generation",
            "Image preprocessing and color extraction",
            "Structured JSON output"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
