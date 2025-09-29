#!/usr/bin/env python3
"""
Platform Handoff Generator

This module integrates the platform-specific handoff configurations with the 
VibeMindOpenAI system to generate optimized prompts for V0, Lovable, and Magic Patterns.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from vibe_mind import VibeMindOpenAI, DesignHandoff


class PlatformHandoffGenerator:
    """Generates platform-specific handoffs using predefined configurations"""
    
    def __init__(self):
        """Initialize with handoff configurations"""
        self.handoff_dir = Path(__file__).parent
        self.configs = self._load_platform_configs()
        self.analyzer = VibeMindOpenAI()
    
    def _load_platform_configs(self) -> Dict[str, Dict[str, Any]]:
        """Load platform configuration files"""
        configs = {}
        
        platform_files = {
            "v0": "v0.json",
            "lovable": "lovable.json", 
            "magic-patterns": "magic-patterns.json"
        }
        
        for platform, filename in platform_files.items():
            config_path = self.handoff_dir / filename
            if config_path.exists():
                with open(config_path, 'r', encoding='utf-8') as f:
                    configs[platform] = json.load(f)
                print(f"✅ Loaded {platform} config")
            else:
                print(f"⚠️  Config not found: {config_path}")
        
        return configs
    
    def generate_platform_prompt(
        self,
        platform: str,
        scenario: str,
        analysis_result: Dict[str, Any],
        custom_params: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate platform-specific prompt based on analysis results"""
        
        if platform not in self.configs:
            raise ValueError(f"Platform '{platform}' not supported")
        
        config = self.configs[platform]
        
        # Get scenario configuration
        if scenario in config.get("scenarios", {}):
            scenario_config = config["scenarios"][scenario]
        else:
            # Use first available scenario as fallback
            scenario_config = list(config["scenarios"].values())[0]
            print(f"⚠️  Scenario '{scenario}' not found, using default")
        
        # Merge custom parameters
        if custom_params:
            scenario_config.update(custom_params)
        
        # Generate platform-specific prompt
        if platform == "v0":
            return self._generate_v0_prompt(analysis_result, scenario_config, config)
        elif platform == "lovable":
            return self._generate_lovable_prompt(analysis_result, scenario_config, config)
        elif platform == "magic-patterns":
            return self._generate_magic_patterns_prompt(analysis_result, scenario_config, config)
        
        return analysis_result.get("implementation_prompt", "")
    
    def _generate_v0_prompt(
        self,
        analysis: Dict[str, Any],
        scenario: Dict[str, Any],
        config: Dict[str, Any]
    ) -> str:
        """Generate V0-specific prompt focusing on components"""
        
        # Extract component details from analysis
        layout_analysis = analysis.get("layout_analysis", "")
        components = analysis.get("components_identified", [])
        
        # Build component list
        component_descriptions = []
        for comp in components if isinstance(components, list) else []:
            if isinstance(comp, dict):
                comp_type = comp.get("type", "Component")
                comp_desc = comp.get("description", "")
                component_descriptions.append(f"- {comp_type}: {comp_desc}")
        
        # Use scenario prompt as template
        base_prompt = scenario.get("prompt", config["prompt_templates"]["base_template"])
        
        # Enhance with V0-specific details
        v0_prompt = f"""{base_prompt}

📋 Component specifications:
{chr(10).join(component_descriptions) if component_descriptions else "- Auto-detect components based on the design"}

🎨 Styling requirements:
- Use shadcn/ui component library
- Tailwind CSS for styling
- Support responsive layout
- Implement hover and interaction states

🔧 Tech stack:
- React + TypeScript
- Next.js framework
- shadcn/ui + Radix UI
- Tailwind CSS

📱 Responsive design:
- Mobile-first
- Tablet and desktop adaptations
- Sensible breakpoint setup"""
        
        return v0_prompt
    
    def _generate_lovable_prompt(
        self,
        analysis: Dict[str, Any], 
        scenario: Dict[str, Any],
        config: Dict[str, Any]
    ) -> str:
        """Generate Lovable-specific prompt focusing on user flows"""
        
        # Extract functionality from analysis
        interaction_patterns = analysis.get("interaction_patterns", "")
        
        # Use scenario prompt as template
        base_prompt = scenario.get("prompt", config["prompt_templates"]["base_template"])
        
        # Enhance with Lovable-specific user flows
        lovable_prompt = f"""{base_prompt}

👥 User roles:
- Primary users: {scenario.get('user_roles', ['users'])}
- Permission levels: basic, power, admin

🔄 Detailed user flow:
1. User login/registration
2. Browse main interface
3. Perform core actions
4. Review results/feedback
5. Follow-up actions

⚡ Core feature modules:
{scenario.get('core_features', ['basic features'])}

🔗 System integrations:
- Authentication system
- Data storage solution
- Real-time communication (if needed)
- Third-party integrations

📊 Business logic:
- Data validation rules
- User permission control
- Workflow automation
- Notification mechanism

🎯 Success metrics:
- User activation rate
- Feature usage frequency
- User satisfaction
- Business conversion rate"""
        
        return lovable_prompt
    
    def _generate_magic_patterns_prompt(
        self,
        analysis: Dict[str, Any],
        scenario: Dict[str, Any], 
        config: Dict[str, Any]
    ) -> str:
        """Generate Magic Patterns-specific prompt focusing on design systems"""
        
        # Extract visual design details
        visual_design = analysis.get("visual_design", {})
        colors = analysis.get("dominant_colors", [])
        
        # Build color specifications
        color_specs = []
        for i, color in enumerate(colors[:5]):
            if hasattr(color, 'hex'):
                color_specs.append(f"- Color {i+1}: {color.hex} ({color.name})")
            elif isinstance(color, dict):
                color_specs.append(f"- Color {i+1}: {color.get('hex', '#000000')}")
        
        # Use scenario prompt as template  
        base_prompt = scenario.get("prompt", config["prompt_templates"]["base_template"])
        
        # Enhance with Magic Patterns-specific design tokens
        color_system = chr(10).join(color_specs) if color_specs else "- Primary: #3B82F6\n- Secondary: #64748B"
        
        magic_patterns_prompt = f"""{base_prompt}

🎨 Design Tokens:

Color system:
{color_system}

Typography:
- Primary font: Inter, system-ui, sans-serif
- Headings: 24px-32px, font-weight: 700
- Body: 16px, font-weight: 400
- Small: 14px, font-weight: 400
- Line height: 1.5 (body), 1.25 (headings)

Spacing system:
- Base unit: 8px
- Component padding: 16px
- Component spacing: 24px
- Section spacing: 48px
- Page margin: 32px

Border radius system:
- Small: 4px (buttons, badges)
- Medium: 8px (cards, inputs)
- Large: 12px (panels, modals)

Shadow levels:
- Subtle: 0 1px 3px rgba(0,0,0,0.1)
- Normal: 0 4px 6px rgba(0,0,0,0.1)
- Prominent: 0 10px 15px rgba(0,0,0,0.1)

🔧 CSS implementation guidelines:
- Use CSS custom properties
- BEM naming
- Mobile-first responsive
- Support dark mode

📱 Responsive breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px  
- Desktop: 1024px - 1439px
- Wide: 1440px+

🎭 Component states:
- Default, hover, active
- Disabled, loading, error
- Focus (keyboard navigation)"""
        
        return magic_patterns_prompt
    
    def generate_all_platforms(
        self,
        image_input: str,
        designer_profile_key: str = "product_designer",
        scenario: str = "enterprise_dashboard",
        project_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """Generate handoff prompts for all three platforms"""
        
        print("🔄 Analyzing image with OpenAI...")
        
        # First get the basic analysis
        handoff = self.analyzer.analyze_image(
            image_input=image_input,
            designer_profile_key=designer_profile_key,
            platform_target="v0",  # Initial analysis
            project_context=project_context
        )
        
        # Convert handoff to analysis dict
        analysis_result = {
            "layout_analysis": handoff.layout.structure,
            "visual_design": handoff.typography,
            "components_identified": [
                {
                    "type": comp.type,
                    "description": comp.description,
                    "properties": comp.properties
                } for comp in handoff.components
            ],
            "interaction_patterns": "Standard UI interactions",
            "implementation_prompt": handoff.prompt_for_platform,
            "dominant_colors": handoff.dominant_colors
        }
        
        print("🚀 Generating platform-specific prompts...")
        
        # Generate platform-specific prompts
        results = {}
        platforms = ["v0", "lovable", "magic-patterns"]
        
        for platform in platforms:
            try:
                prompt = self.generate_platform_prompt(
                    platform=platform,
                    scenario=scenario,
                    analysis_result=analysis_result
                )
                results[platform] = prompt
                print(f"✅ Generated {platform} prompt")
            except Exception as e:
                print(f"❌ Failed to generate {platform} prompt: {e}")
                results[platform] = f"Error: {e}"
        
        return results
    
    def save_handoff_results(
        self,
        results: Dict[str, str],
        base_filename: str = "platform_handoff"
    ) -> Dict[str, str]:
        """Save platform-specific prompts to files"""
        
        saved_files = {}
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Create output directory in the parent directory (main project folder)
        output_dir = self.handoff_dir.parent / "output"
        output_dir.mkdir(exist_ok=True)
        
        for platform, prompt in results.items():
            filename = f"{base_filename}_{platform}_{timestamp}.md"
            filepath = output_dir / filename
            
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(f"# {platform.upper()} Platform Prompt\n\n")
                    f.write(f"Generated at: {timestamp}\n\n")
                    f.write("## Prompt Content\n\n")
                    f.write(prompt)
                
                saved_files[platform] = str(filepath)
                print(f"💾 Saved {platform} prompt to: {filename}")
                
            except Exception as e:
                print(f"❌ Failed to save {platform} prompt: {e}")
        
        return saved_files


def demo_platform_handoff():
    """Demo function showing platform handoff generation"""
    print("🎯 Platform Handoff Generator Demo")
    print("=" * 50)
    
    # Initialize generator
    generator = PlatformHandoffGenerator()
    
    # Check configurations loaded
    print(f"\n📋 Loaded {len(generator.configs)} platform configurations:")
    for platform in generator.configs:
        print(f"  • {platform}")
    
    # Get user input
    image_url = input("\n📸 Enter image URL or path: ").strip()
    if not image_url:
        print("❌ No image provided")
        return
    
    # Available scenarios
    scenarios = ["enterprise_dashboard", "ecommerce_grid", "social_feed"]
    print(f"\n🎭 Available scenarios: {', '.join(scenarios)}")
    scenario = input(f"Select scenario [{scenarios[0]}]: ").strip() or scenarios[0]
    
    try:
        # Generate all platform prompts
        results = generator.generate_all_platforms(
            image_input=image_url,
            scenario=scenario,
            project_context={
                "industry": "technology",
                "target_users": "professionals",
                "brand_tone": "modern"
            }
        )
        
        # Save results
        saved_files = generator.save_handoff_results(results)
        
        # Display summary
        print(f"\n📊 Generated prompts for {len(results)} platforms:")
        for platform, prompt in results.items():
            print(f"\n{'='*20} {platform.upper()} {'='*20}")
            preview = prompt[:200] + "..." if len(prompt) > 200 else prompt
            print(preview)
        
        print(f"\n💾 Files saved:")
        for platform, filepath in saved_files.items():
            print(f"  • {platform}: {filepath}")
        
        print(f"\n🎉 Platform handoff generation completed!")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")


if __name__ == "__main__":
    demo_platform_handoff()
