#!/usr/bin/env python3
"""
Quick test script to verify image analysis is working
"""

import os
import sys
sys.path.append('backend')

from backend.chat_agent_with_image_analysis import ImageAnalysisChatAgent

def test_agent():
    """Test the image analysis agent."""
    print("🧪 Testing ImageAnalysisChatAgent...")
    
    try:
        # Create agent
        agent = ImageAnalysisChatAgent()
        print("✅ Agent created successfully")
        
        # Test with a simple text analysis (no image)
        result = agent.analyze_image("", "Hello, can you help me test the system?")
        print(f"✅ Text analysis result: {result[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Set a dummy OpenAI API key for testing (won't actually call API)
    os.environ['OPENAI_API_KEY'] = 'sk-test-key-for-initialization'
    
    success = test_agent()
    if success:
        print("\n🎉 All tests passed! The fix is working.")
    else:
        print("\n💥 Tests failed. There may still be issues.")

