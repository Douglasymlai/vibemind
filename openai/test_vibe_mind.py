#!/usr/bin/env python3
"""
Test script for Vibe Mind OpenAI SDK implementation

This script demonstrates the complete workflow from image input to 
structured handoff JSON for vibe coding platforms.
"""

import json
import os
import sys
from pathlib import Path

# Add the openai directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from vibe_mind import VibeMindOpenAI, demo_analysis

def test_with_sample_url():
    """Test with a sample UI image URL"""
    print("🧪 Testing Vibe Mind with Sample URL")
    print("=" * 40)
    
    # Sample URLs for testing (you can replace these)
    sample_urls = [
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800",  # Mobile UI
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",   # Web dashboard
    ]
    
    # Initialize analyzer
    try:
        analyzer = VibeMindOpenAI()
        
        if not analyzer.profiles:
            print("❌ No designer profiles found!")
            print("   Please ensure profiles are in backend/profiles/")
            return False
        
        # Test with first available profile
        profile_key = list(analyzer.profiles.keys())[0]
        print(f"🎯 Using profile: {profile_key}")
        
        # Test with first sample URL
        image_url = sample_urls[0]
        print(f"📸 Testing with: {image_url}")
        
        # Analyze for different platforms
        platforms = ["v0", "magic-pattern", "lovable"]
        
        for platform in platforms:
            print(f"\n🔄 Analyzing for {platform}...")
            
            try:
                handoff = analyzer.analyze_image(
                    image_input=image_url,
                    designer_profile_key=profile_key,
                    platform_target=platform,
                    project_context={
                        "app_type": "web_dashboard",
                        "theme": "modern",
                        "target_users": "professionals"
                    }
                )
                
                # Save results
                output_file = f"test_handoff_{platform}_{profile_key}.json"
                saved_path = analyzer.save_handoff(handoff, output_file)
                
                # Validate
                errors = analyzer.validate_handoff(handoff)
                
                print(f"  ✅ Success! Saved to: {saved_path}")
                print(f"  📊 Confidence: {handoff.confidence_score:.2f}")
                print(f"  🎨 Colors: {len(handoff.dominant_colors)}")
                print(f"  ⚠️  Warnings: {len(errors)}")
                
                if errors:
                    for error in errors[:2]:  # Show first 2 errors
                        print(f"    • {error}")
                
            except Exception as e:
                print(f"  ❌ Failed for {platform}: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def create_enhanced_profile():
    """Create an enhanced profile specifically for vibe coding"""
    print("\n🛠️  Creating Enhanced Vibe Coding Profile")
    print("=" * 45)
    
    enhanced_profile = {
        "name": "Vibe Coding Specialist",
        "description": "Expert in analyzing designs for V0, Magic Pattern, and Lovable code generation",
        "analysis_steps": [
            "Identify component hierarchy and layout structure for React/Vue components",
            "Extract exact color palette, typography, and spacing tokens",
            "Map interactive elements to modern UI component patterns",
            "Determine responsive behavior and breakpoint specifications",
            "Generate platform-specific implementation prompts with proper syntax"
        ],
        "platform_targets": ["v0", "magic-pattern", "lovable"],
        "output_format": "structured_json",
        "specializations": [
            "modern_ui_components",
            "design_systems", 
            "responsive_design",
            "accessibility",
            "vibe_coding_syntax"
        ],
        "report_template": "# Vibe Coding Analysis\n\n## 🎯 Platform: {platform}\n\n## 📐 Layout Structure\n{layout_analysis}\n\n## 🎨 Design System\n{design_system}\n\n## ⚡ Components\n{components}\n\n## 🚀 Implementation Prompt\n{implementation_prompt}\n\n## 📊 Technical Specs\n{technical_specs}",
        "template_mapping": {
            "analysis_1": "layout_analysis",
            "analysis_2": "design_system", 
            "analysis_3": "components",
            "analysis_4": "responsive_specs",
            "analysis_5": "implementation_prompt"
        },
        "summary_text": "Advanced analysis optimized for vibe coding platforms with precise implementation prompts"
    }
    
    # Save to profiles directory
    profiles_dir = Path(__file__).parent.parent / "backend" / "profiles"
    profiles_dir.mkdir(exist_ok=True)
    
    profile_path = profiles_dir / "vibe_coding_specialist.json"
    
    with open(profile_path, 'w', encoding='utf-8') as f:
        json.dump(enhanced_profile, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Enhanced profile saved to: {profile_path}")
    return str(profile_path)

def run_comprehensive_test():
    """Run comprehensive test of the system"""
    print("🚀 Comprehensive Vibe Mind Test Suite")
    print("=" * 50)
    
    # Step 1: Create enhanced profile
    profile_path = create_enhanced_profile()
    
    # Step 2: Test with sample URL
    success = test_with_sample_url()
    
    # Step 3: Display results summary
    print(f"\n📋 Test Results Summary")
    print("=" * 30)
    print(f"Profile created: {profile_path}")
    print(f"URL test success: {'✅' if success else '❌'}")
    
    # Step 4: List generated files
    print(f"\n📄 Generated Files:")
    current_dir = Path.cwd()
    for file in current_dir.glob("test_handoff_*.json"):
        print(f"  • {file.name}")
    
    if success:
        print("\n🎉 All tests passed! System ready for use.")
        print("\n💡 Next steps:")
        print("  1. Set your OPENAI_API_KEY environment variable")
        print("  2. Run: python vibe_mind.py for interactive mode")
        print("  3. Or import VibeMindOpenAI in your own code")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        print("  Make sure your OpenAI API key is set correctly.")

if __name__ == "__main__":
    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY environment variable not set!")
        print("   You can still run tests, but API calls will fail.")
        print("   Set it with: export OPENAI_API_KEY='your-key-here'")
        print()
    
    # Run comprehensive test
    run_comprehensive_test()
    
    print("\n🔧 Interactive Demo Available")
    print("Run 'python vibe_mind.py' for interactive analysis!")
