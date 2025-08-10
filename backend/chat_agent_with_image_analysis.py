#!/usr/bin/env python3
"""
Image Analysis Chat Agent Demo

A simplified chat agent for analyzing images using CAMEL's framework.
"""

import requests
from typing import Optional
from io import BytesIO
from urllib.parse import urlparse

from dotenv import load_dotenv
load_dotenv()

from PIL import Image

from camel.agents import ChatAgent
from camel.configs import ChatGPTConfig
from camel.messages import BaseMessage
from camel.models import ModelFactory
from camel.types import ModelPlatformType, ModelType


class ImageAnalysisToolkit:
    """Simple image analysis toolkit for demo purposes."""
    
    def __init__(self, model=None, timeout: Optional[float] = None):
        """Initialize the toolkit.
        
        Args:
            model: The model backend to use
            timeout: Timeout for requests in seconds
        """
        self.timeout = timeout or 15
        self.model = model or ModelFactory.create(
            model_platform=ModelPlatformType.OPENAI,
            model_type=ModelType.GPT_4O_MINI,
        )
    
    def _load_image(self, image_path: str) -> Image.Image:
        """Load image from local path or URL."""
        parsed = urlparse(image_path)
        
        if parsed.scheme in ("http", "https"):
            response = requests.get(image_path, timeout=self.timeout)
            response.raise_for_status()
            return Image.open(BytesIO(response.content))
        else:
            return Image.open(image_path)
    
    def analyze_image(self, image_path: str, question: Optional[str] = None) -> str:
        """Analyze an image with optional question.
        
        Args:
            image_path: Path or URL to image
            question: Optional question about the image
            
        Returns:
            Analysis result
        """
        try:
            image = self._load_image(image_path)
            
            # Create system message
            system_msg = BaseMessage.make_assistant_message(
                role_name="Image Analysis Expert",
                content="You are an expert at analyzing images. Provide detailed, accurate descriptions and answer questions about visual content."
            )
            
            # Create agent
            agent = ChatAgent(system_message=system_msg, model=self.model)
            
            # Create user message
            content = question if question else "Describe this image in detail."
            user_msg = BaseMessage.make_user_message(
                role_name="User",
                content=content,
                image_list=[image]
            )
            
            response = agent.step(user_msg)
            agent.reset()
            return response.msgs[0].content
            
        except Exception as e:
            return f"Error analyzing image: {str(e)}"
    



class ImageAnalysisChatAgent:
    """Simple image analysis chat agent for demo."""
    
    def __init__(self, temperature: float = 0.0):
        """Initialize the agent."""
        # Create model
        model_config = ChatGPTConfig(temperature=temperature).as_dict()
        self.model = ModelFactory.create(
            model_platform=ModelPlatformType.OPENAI,
            model_type=ModelType.GPT_4O_MINI,
            model_config_dict=model_config,
        )
        
        # Initialize toolkit
        self.toolkit = ImageAnalysisToolkit(model=self.model)
    
    def analyze_image(self, image_path: str, question: Optional[str] = None) -> str:
        """Analyze an image with optional question.
        
        Args:
            image_path: Path or URL to the image
            question: Optional question about the image
            
        Returns:
            Analysis result
        """
        return self.toolkit.analyze_image(image_path, question)


def main():
    """Demo function for ImageAnalysisChatAgent."""
    print("🤖 Image Analysis Demo")
    print("=" * 30)
    
    # Create agent
    agent = ImageAnalysisChatAgent()
    
    # Demo with example
    image_path = input("📸 Enter image path or URL: ").strip()
    if not image_path:
        print("❌ No image provided. Exiting.")
        return
    
    question = input("❓ Enter question (or press Enter for general description): ").strip()
    
    print("\n🔄 Analyzing image...")
    result = agent.analyze_image(image_path, question if question else None)
    
    print(f"\n📊 Analysis Result:")
    print("-" * 40)
    print(result)
    print("\n✅ Demo completed!")


if __name__ == "__main__":
    main() 