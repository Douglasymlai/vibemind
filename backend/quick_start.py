#!/usr/bin/env python3
"""
Quick Start Demo for Image Analysis

Simple demo script showing how to use the image analysis tools.
"""

from backend.chat_agent_with_image_analysis import ImageAnalysisChatAgent
from backend.vibe_mind import StructuredImageAnalyzer


def simple_analysis_demo():
    """Simple image analysis demo."""
    print("🤖 Simple Image Analysis Demo")
    print("=" * 40)
    
    try:
        # Initialize agent
        agent = ImageAnalysisChatAgent()
        print("✅ Agent initialized successfully!")
        
        # Demo with included image
        image_path = "palantir.png"
        print(f"\n📸 Analyzing: {image_path}")
        
        # Basic analysis
        result = agent.analyze_image(image_path, "What does this image show?")
        print(f"\n📊 Analysis Result:")
        print("-" * 30)
        print(result)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Make sure you have:")
        print("1. Set up your .env file with OPENAI_API_KEY")
        print("2. Installed requirements: pip install -r requirements.txt")


def structured_analysis_demo():
    """Structured analysis demo using profiles."""
    print("\n\n🎯 Structured Analysis Demo")
    print("=" * 40)
    
    try:
        # Initialize structured analyzer
        analyzer = StructuredImageAnalyzer()
        
        # Use the business analyst profile for demo
        profiles = analyzer.get_available_profiles()
        business_profile = profiles["business_analyst"]
        
        image_path = "palantir.png"
        print(f"📸 Analyzing with {business_profile.name} profile...")
        
        # Perform structured analysis
        result = analyzer.analyze_with_profile(
            image_url=image_path,
            profile=business_profile,
            custom_text="Analyze this dashboard for business insights"
        )
        
        # Generate report
        report = analyzer.generate_markdown_report(result, business_profile)
        
        # Save summarized version
        summary = analyzer.summarize_markdown(report, max_words=200)
        filename = analyzer.save_summarized_markdown(summary)
        
        print(f"✅ Analysis completed!")
        print(f"📄 Report saved to: {filename}")
        print(f"\n📝 Summary Preview:")
        print("-" * 30)
        print(summary[:500] + "..." if len(summary) > 500 else summary)
        
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Run both demos."""
    print("🚀 Image Analysis Demo Suite")
    print("=" * 50)
    
    # Run simple demo
    simple_analysis_demo()
    
    # Run structured demo
    structured_analysis_demo()
    
    print("\n\n✨ Demo completed!")
    print("💡 Try running vibe_mind.py for the full interactive experience")


if __name__ == "__main__":
    main()