#!/usr/bin/env python3
"""
Setup script for Vibe Mind OpenAI SDK implementation

This script helps set up the environment and dependencies for the OpenAI-based
image analysis system with local profiles and platform handoff configurations.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def load_env_file():
    """Load environment variables from .env file if it exists"""
    env_file = Path(__file__).parent / ".env"
    
    if not env_file.exists():
        return
    
    try:
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    # Remove quotes if present
                    if (value.startswith('"') and value.endswith('"')) or \
                       (value.startswith("'") and value.endswith("'")):
                        value = value[1:-1]
                    os.environ[key] = value
    except Exception as e:
        print(f"⚠️  Warning: Could not load .env file: {e}")

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    
    # Use local requirements.txt if it exists, otherwise install core packages
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if requirements_file.exists():
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", 
                "-r", str(requirements_file)
            ], check=True, capture_output=True, text=True)
            
            print("✅ Dependencies installed from requirements.txt")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install from requirements.txt: {e}")
            print(f"   Error output: {e.stderr}")
            print("   Trying to install core packages individually...")
    
    # Core packages needed for the system
    core_packages = [
        "openai>=1.0.0",
        "pillow>=9.0.0",
        "requests>=2.25.0",
        "scikit-learn>=1.0.0",
        "numpy>=1.21.0",
        "pydantic>=1.8.0"
    ]
    
    try:
        for package in core_packages:
            print(f"  Installing {package}...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", package
            ], check=True, capture_output=True, text=True)
        
        print("✅ Core dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install core packages: {e}")
        return False

def check_openai_key():
    """Check if OpenAI API key is set"""
    # First try to load from .env file
    load_env_file()
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("\n⚠️  OpenAI API key not found!")
        print("   Set it with: export OPENAI_API_KEY='your-key-here'")
        print("   Or add it to your .env file")
        return False
    
    # Basic validation (starts with sk-, reasonable length)
    if not api_key.startswith("sk-") or len(api_key) < 20:
        print("\n⚠️  OpenAI API key format seems incorrect")
        print("   Should start with 'sk-' and be ~50+ characters")
        return False
    
    print("✅ OpenAI API key found and valid format")
    return True

def create_env_file():
    """Create a sample .env file"""
    env_file = Path(__file__).parent / ".env"
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    env_content = """# Vibe Mind OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o

# Optional: Custom settings
# MAX_IMAGE_DIMENSION=512
# DEFAULT_PLATFORM=v0
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"✅ Created sample .env file: {env_file}")
        print("   Please edit it with your actual OpenAI API key")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def verify_profiles():
    """Verify designer profiles are available"""
    profiles_dir = Path(__file__).parent / "profiles"
    
    if not profiles_dir.exists():
        print(f"❌ Profiles directory not found: {profiles_dir}")
        print("   Please ensure you have a 'profiles/' directory with JSON profile files")
        return False
    
    profile_files = list(profiles_dir.glob("*.json"))
    
    if not profile_files:
        print(f"❌ No profile files found in: {profiles_dir}")
        print("   Please add designer profile JSON files to the profiles/ directory")
        return False
    
    print(f"✅ Found {len(profile_files)} designer profiles:")
    
    # Validate profile files
    valid_profiles = 0
    for profile_file in profile_files:
        try:
            with open(profile_file, 'r', encoding='utf-8') as f:
                profile_data = json.load(f)
            
            # Check for required fields
            if 'name' in profile_data and 'description' in profile_data:
                profile_name = profile_data['name']
                print(f"   • {profile_file.stem}: {profile_name}")
                valid_profiles += 1
            else:
                print(f"   ⚠️  {profile_file.stem}: Missing required fields (name, description)")
                
        except json.JSONDecodeError as e:
            print(f"   ❌ {profile_file.stem}: Invalid JSON - {e}")
        except Exception as e:
            print(f"   ❌ {profile_file.stem}: Error reading file - {e}")
    
    if valid_profiles == 0:
        print("❌ No valid profile files found")
        return False
    
    return True

def verify_handoff_configs():
    """Verify platform handoff configurations are available"""
    handoff_dir = Path(__file__).parent / "handoff"
    
    if not handoff_dir.exists():
        print(f"❌ Handoff directory not found: {handoff_dir}")
        print("   Please ensure you have a 'handoff/' directory with platform JSON files")
        return False
    
    handoff_files = list(handoff_dir.glob("*.json"))
    
    if not handoff_files:
        print(f"❌ No handoff files found in: {handoff_dir}")
        print("   Please add platform handoff JSON files to the handoff/ directory")
        return False
    
    print(f"✅ Found {len(handoff_files)} platform configurations:")
    
    # Validate handoff files
    valid_configs = 0
    for handoff_file in handoff_files:
        try:
            with open(handoff_file, 'r', encoding='utf-8') as f:
                handoff_data = json.load(f)
            
            # Check for required fields
            platform_name = handoff_data.get('platform_name', handoff_file.stem)
            description = handoff_data.get('description', 'No description')
            
            print(f"   • {handoff_file.stem}: {platform_name}")
            print(f"     {description}")
            valid_configs += 1
                
        except json.JSONDecodeError as e:
            print(f"   ❌ {handoff_file.stem}: Invalid JSON - {e}")
        except Exception as e:
            print(f"   ❌ {handoff_file.stem}: Error reading file - {e}")
    
    if valid_configs == 0:
        print("❌ No valid handoff configurations found")
        return False
    
    return True

def run_quick_test():
    """Run a quick test to verify everything works"""
    print("\n🧪 Running quick test...")
    
    try:
        # Load .env file before testing
        load_env_file()
        
        # Import the main module
        sys.path.insert(0, str(Path(__file__).parent))
        from vibe_mind import VibeMindOpenAI
        
        # Initialize analyzer
        analyzer = VibeMindOpenAI()
        
        # Check profiles loaded
        if not analyzer.profiles:
            print("❌ No profiles loaded")
            return False
        
        # Check platform handoffs loaded
        if not analyzer.platform_handoffs:
            print("❌ No platform handoff configurations loaded")
            return False
        
        print(f"✅ Successfully loaded {len(analyzer.profiles)} profiles")
        print(f"   Available profiles: {', '.join(analyzer.profiles.keys())}")
        
        print(f"✅ Successfully loaded {len(analyzer.platform_handoffs)} platform configs")
        print(f"   Available platforms: {', '.join(analyzer.platform_handoffs.keys())}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Some dependencies may be missing")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def create_requirements_file():
    """Create a requirements.txt file if it doesn't exist"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if requirements_file.exists():
        print("✅ requirements.txt already exists")
        return True
    
    requirements_content = """# Vibe Mind OpenAI SDK Requirements
openai>=1.0.0
pillow>=9.0.0
requests>=2.25.0
scikit-learn>=1.0.0
numpy>=1.21.0
pydantic>=1.8.0

# Optional: For enhanced functionality
python-dotenv>=0.19.0
"""
    
    try:
        with open(requirements_file, 'w') as f:
            f.write(requirements_content)
        
        print(f"✅ Created requirements.txt: {requirements_file}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create requirements.txt: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Vibe Mind OpenAI SDK Setup")
    print("=" * 40)
    
    success_count = 0
    total_checks = 7
    
    # Run all checks
    checks = [
        ("Python Version", check_python_version),
        ("Requirements File", create_requirements_file),
        ("Dependencies", install_dependencies), 
        ("OpenAI API Key", check_openai_key),
        ("Environment File", create_env_file),
        ("Designer Profiles", verify_profiles),
        ("Platform Handoff Configs", verify_handoff_configs),
        ("Quick Test", run_quick_test)
    ]
    
    for check_name, check_func in checks:
        print(f"\n🔍 {check_name}...")
        if check_func():
            success_count += 1
        else:
            print(f"   ⚠️  {check_name} check failed")
    
    # Summary
    print(f"\n📊 Setup Summary")
    print("=" * 20)
    print(f"Passed: {success_count}/{len(checks)} checks")
    
    if success_count == len(checks):
        print("\n🎉 Setup completed successfully!")
        print("\n🚀 Ready to use Vibe Mind!")
        print("\nNext steps:")
        print("  1. python vibe_mind.py - Interactive mode")
        print("  2. Check your profiles/ and handoff/ directories")
        print("  3. Set your OPENAI_API_KEY if not already done")
        print("\nUsage example:")
        print("  from vibe_mind import VibeMindOpenAI")
        print("  analyzer = VibeMindOpenAI()")
        print("  result = analyzer.analyze_image(image_path, 'profile_key', 'platform', output_mode='prompt')")
        
    elif success_count >= len(checks) - 2:
        print("\n✅ Setup mostly complete!")
        print("   Fix the warnings above and you're ready to go")
        
    else:
        print("\n❌ Setup incomplete")
        print("   Please fix the errors above before proceeding")
        print("\n💡 Common solutions:")
        print("   • Install Python 3.8+")
        print("   • Set OPENAI_API_KEY environment variable")
        print("   • Ensure profiles/ and handoff/ directories exist with JSON files")
        print("   • Run: pip install -r requirements.txt")

if __name__ == "__main__":
    main()