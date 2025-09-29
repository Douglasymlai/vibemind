#!/usr/bin/env python3
"""
Vibe Mind - OpenAI SDK Image Analysis for Designer Profile Handoff

This system provides structured image analysis based on designer profiles
to generate handoff prompts for vibe coding platforms like V0, Magic Pattern, 
and Lovable.

Architecture follows the specifications in vibe_mind.mdx:
- Uses OpenAI SDK for vision analysis
- Processes images with designer profiles
- Generates structured handoff JSON
- Includes preprocessing and validation
"""

import json
import os
import base64
import io
import re
from datetime import datetime
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, asdict
from PIL import Image, ImageDraw
import requests
from urllib.parse import urlparse
import colorsys
from sklearn.cluster import KMeans
import numpy as np

try:
    import openai
    from openai import OpenAI
except ImportError:
    print("❌ OpenAI SDK not installed. Please run: pip install openai")
    raise

from pydantic import BaseModel, validator
import tempfile

def load_env_file():
    """Load environment variables from .env file if it exists"""
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if not os.path.exists(env_file_path):
        return
    
    try:
        with open(env_file_path, 'r') as f:
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

# Load .env file at module import
load_env_file()


# JSON Schema Models for Handoff
@dataclass
class ColorInfo:
    hex: str
    rgb: tuple
    name: str
    confidence: float

@dataclass
class ComponentInfo:
    type: str
    location: str
    description: str
    properties: Dict[str, Any]
    confidence: float

@dataclass
class LayoutInfo:
    structure: str
    grid_system: Optional[str]
    spacing: Dict[str, Any]
    responsive_behavior: Optional[str]

@dataclass
class DesignHandoff:
    """Structured design handoff JSON schema"""
    timestamp: str
    image_url: str
    designer_profile: str
    platform_target: str
    
    # Visual Analysis
    dominant_colors: List[ColorInfo]
    typography: Dict[str, Any]
    layout: LayoutInfo
    components: List[ComponentInfo]
    
    # Technical Specifications
    style_tokens: Dict[str, Any]
    responsive_specs: Dict[str, Any]
    accessibility_notes: List[str]
    
    # Vibe Coding Output
    prompt_for_platform: str
    code_suggestions: List[str]
    confidence_score: float
    uncertain_flags: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)


class ImagePreprocessor:
    """Handles image preprocessing as specified in the architecture"""
    
    def __init__(self, max_dimension: int = 512):
        self.max_dimension = max_dimension
    
    def load_image(self, image_input: Union[str, bytes]) -> Image.Image:
        """Load image from URL, path, or base64 data"""
        if isinstance(image_input, bytes):
            return Image.open(io.BytesIO(image_input))
        
        if isinstance(image_input, str):
            # Check if it's a URL
            parsed = urlparse(image_input)
            if parsed.scheme in ("http", "https"):
                response = requests.get(image_input, timeout=30)
                response.raise_for_status()
                return Image.open(io.BytesIO(response.content))
            
            # Check if it's base64
            if image_input.startswith('data:image'):
                header, data = image_input.split(',', 1)
                return Image.open(io.BytesIO(base64.b64decode(data)))
            
            # Local file path
            return Image.open(image_input)
    
    def resize_image(self, image: Image.Image) -> Image.Image:
        """Resize image to max dimension while maintaining aspect ratio"""
        width, height = image.size
        
        if max(width, height) <= self.max_dimension:
            return image
        
        if width > height:
            new_width = self.max_dimension
            new_height = int(height * (self.max_dimension / width))
        else:
            new_height = self.max_dimension
            new_width = int(width * (self.max_dimension / height))
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    def extract_dominant_colors(self, image: Image.Image, n_colors: int = 5) -> List[ColorInfo]:
        """Extract dominant colors using clustering"""
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get image data
        data = np.array(image)
        data = data.reshape((-1, 3))
        
        # Remove pure white and near-white pixels
        mask = np.sum(data, axis=1) < 750  # Remove pixels where R+G+B > 750
        if np.any(mask):
            data = data[mask]
        
        if len(data) == 0:
            return []
        
        # Sample data for performance
        if len(data) > 10000:
            indices = np.random.choice(len(data), 10000, replace=False)
            data = data[indices]
        
        # Perform clustering
        kmeans = KMeans(n_clusters=min(n_colors, len(data)), random_state=42, n_init=10)
        kmeans.fit(data)
        
        colors = []
        for i, color in enumerate(kmeans.cluster_centers_):
            rgb = tuple(map(int, color))
            hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb)
            
            # Calculate confidence based on cluster size
            labels = kmeans.labels_
            confidence = np.sum(labels == i) / len(labels)
            
            # Generate color name (simplified)
            color_name = self._get_color_name(rgb)
            
            colors.append(ColorInfo(
                hex=hex_color,
                rgb=rgb,
                name=color_name,
                confidence=float(confidence)
            ))
        
        # Sort by confidence
        colors.sort(key=lambda x: x.confidence, reverse=True)
        return colors
    
    def _get_color_name(self, rgb: tuple) -> str:
        """Generate a descriptive color name"""
        r, g, b = rgb
        
        # Convert to HSV for better color categorization
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        h_deg = h * 360
        
        # Basic color categorization
        if s < 0.2:
            if v < 0.3:
                return "dark gray"
            elif v > 0.8:
                return "light gray"
            else:
                return "gray"
        
        if h_deg < 15 or h_deg >= 345:
            return "red"
        elif h_deg < 45:
            return "orange" 
        elif h_deg < 75:
            return "yellow"
        elif h_deg < 165:
            return "green"
        elif h_deg < 195:
            return "cyan"
        elif h_deg < 255:
            return "blue"
        elif h_deg < 285:
            return "purple"
        else:
            return "pink"
    
    def image_to_base64(self, image: Image.Image, format: str = "JPEG") -> str:
        """Convert PIL Image to base64 string for API"""
        buffer = io.BytesIO()
        
        # Convert RGBA to RGB for JPEG
        if format.upper() == "JPEG" and image.mode == "RGBA":
            # Create white background
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        
        image.save(buffer, format=format, quality=85, optimize=True)
        buffer.seek(0)
        
        image_data = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/{format.lower()};base64,{image_data}"


class DesignerProfile:
    """Enhanced designer profile for OpenAI SDK integration"""
    
    def __init__(self, profile_data: Dict[str, Any]):
        self.name = profile_data['name']
        self.description = profile_data['description']
        self.analysis_steps = profile_data['analysis_steps']
        self.platform_targets = profile_data.get('platform_targets', ['v0', 'magic-pattern', 'lovable'])
        self.output_format = profile_data.get('output_format', 'structured_json')
        self.specializations = profile_data.get('specializations', [])
        
        # Vibe coding specific prompts
        self.system_prompt = self._build_system_prompt()
        self.handoff_template = profile_data.get('handoff_template', self._default_handoff_template())
    
    def _build_system_prompt(self) -> str:
        """Build system prompt for OpenAI vision model"""
        return f"""You are an expert {self.name} specializing in analyzing UI/UX designs for vibe coding platforms.

Your role: {self.description}

Platform targets: {', '.join(self.platform_targets)}

You analyze images to extract:
1. Layout structure and component hierarchy
2. Visual design system (colors, typography, spacing)
3. Interactive elements and user flows
4. Technical specifications for implementation
5. Accessibility considerations

Always provide structured, actionable analysis that developers can use immediately for implementation.
Focus on generating precise, implementable prompts for vibe coding tools.
"""
    
    def _default_handoff_template(self) -> str:
        """Default handoff template for the profile"""
        return """
## Design Analysis Summary
{analysis_summary}

## Implementation Prompt
{implementation_prompt}

## Technical Specifications
{technical_specs}

## Vibe Coding Suggestions
{vibe_suggestions}
"""


class VibeMindOpenAI:
    """Main class for OpenAI SDK-based image analysis"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = None):
        """Initialize with OpenAI client"""
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        # Prefer explicit arg, else env var, else default to gpt-4o (vision capable)
        self.model = (
            model
            or os.getenv("OPENAI_MODEL")
            or "gpt-4o"
        )
        self.preprocessor = ImagePreprocessor()
        
        # Load designer profiles and platform handoffs
        self.profiles = self._load_designer_profiles()
        self.platform_handoffs = self._load_platform_handoffs()
    
    def _load_designer_profiles(self) -> Dict[str, DesignerProfile]:
        """Load designer profiles from the local profiles directory"""
        profiles = {}
        profiles_dir = os.path.join(os.path.dirname(__file__), 'profiles')
        
        if not os.path.exists(profiles_dir):
            print(f"⚠️  Profiles directory not found: {profiles_dir}")
            return profiles
        
        for filename in os.listdir(profiles_dir):
            if filename.endswith('.json'):
                try:
                    filepath = os.path.join(profiles_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        profile_data = json.load(f)
                    
                    profile_key = filename[:-5]  # Remove .json
                    profiles[profile_key] = DesignerProfile(profile_data)
                    print(f"✅ Loaded profile: {profile_data['name']}")
                    
                except Exception as e:
                    print(f"❌ Error loading profile {filename}: {e}")
        
        return profiles
    
    def _load_platform_handoffs(self) -> Dict[str, Any]:
        """Load platform-specific handoff configurations"""
        handoffs = {}
        handoff_dir = os.path.join(os.path.dirname(__file__), 'handoff')
        
        if not os.path.exists(handoff_dir):
            print(f"⚠️  Handoff directory not found: {handoff_dir}")
            return handoffs
        
        for filename in os.listdir(handoff_dir):
            if filename.endswith('.json'):
                try:
                    filepath = os.path.join(handoff_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        handoff_data = json.load(f)
                    
                    platform_key = filename[:-5]  # Remove .json
                    handoffs[platform_key] = handoff_data
                    print(f"✅ Loaded handoff config: {handoff_data.get('platform_name', platform_key)}")
                    
                except Exception as e:
                    print(f"❌ Error loading handoff config {filename}: {e}")
        
        return handoffs
    
    def analyze_image(
        self,
        image_input: Union[str, bytes],
        designer_profile_key: str,
        platform_target: str = "v0",
        project_context: Optional[Dict[str, Any]] = None,
        output_mode: str = "json"
    ) -> Union[DesignHandoff, str]:
        """
        Main analysis method following the architecture specification
        
        Args:
            image_input: Image URL, path, or bytes
            designer_profile_key: Key for designer profile to use
            platform_target: Target platform (v0, magic-patterns, lovable)
            project_context: Optional project context
            output_mode: "json" for structured output, "prompt" for direct prompt text
            
        Returns:
            Structured DesignHandoff object or formatted prompt string
        """
        
        if designer_profile_key not in self.profiles:
            raise ValueError(f"Designer profile '{designer_profile_key}' not found")
        
        profile = self.profiles[designer_profile_key]
        
        # Step 1: Preprocess image
        print("🔄 Preprocessing image...")
        original_image = self.preprocessor.load_image(image_input)
        resized_image = self.preprocessor.resize_image(original_image)
        
        # Step 2: Extract visual features
        print("🎨 Extracting visual features...")
        dominant_colors = self.preprocessor.extract_dominant_colors(resized_image)
        
        # Step 3: Convert to base64 for API
        image_b64 = self.preprocessor.image_to_base64(resized_image)
        
        # Step 4: LLM Analysis with platform-specific context
        print("🤖 Performing AI analysis...")
        platform_config = self.platform_handoffs.get(platform_target, {})
        
        analysis_result = self._analyze_with_openai(
            image_b64, profile, platform_target, project_context, platform_config
        )
        
        # Step 5: Return based on output mode
        if output_mode == "prompt":
            print("📝 Generating direct prompt...")
            return self._format_prompt_output(analysis_result, platform_config, platform_target)
        else:
            print("📋 Generating handoff JSON...")
            handoff = self._create_handoff_json(
                analysis_result, 
                dominant_colors, 
                profile, 
                platform_target,
                image_input if isinstance(image_input, str) else "uploaded_image"
            )
            return handoff
    
    def _analyze_with_openai(
        self,
        image_b64: str,
        profile: DesignerProfile,
        platform_target: str,
        project_context: Optional[Dict[str, Any]],
        platform_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform analysis using OpenAI vision model"""
        
        context_str = ""
        if project_context:
            context_str = f"\nProject Context: {json.dumps(project_context, indent=2)}"
        
        # Get platform-specific context
        platform_name = platform_config.get('platform_name', platform_target)
        platform_strategy = platform_config.get('strategy', {})
        platform_keywords = platform_strategy.get('keywords', [])
        platform_approach = platform_strategy.get('approach', '')
        
        # Create platform-enhanced prompt
        user_prompt = f"""
Analyze this UI/UX design image as a {profile.name} for {platform_name} platform.

{context_str}

Platform-Specific Focus: {platform_approach}
Key Terms to Use: {', '.join(platform_keywords[:10])}

Please provide a comprehensive analysis covering:

1. **Layout Structure**: Describe the overall layout, grid system, component hierarchy
2. **Visual Design**: Colors, typography, spacing, visual hierarchy  
3. **Components**: Identify UI components and their properties
4. **Interactions**: User flows and interactive elements
5. **Technical Specs**: CSS/styling requirements, responsive behavior
6. **Accessibility**: A11y considerations and improvements
7. **Platform Implementation Prompt**: Detailed prompt optimized for {platform_name} using their specific terminology and best practices

Format your response as a structured JSON with these keys:
- layout_analysis
- visual_design
- components_identified
- interaction_patterns
- technical_specifications
- accessibility_notes
- implementation_prompt
- confidence_score (0-1)
- uncertain_elements (array of strings)

Be specific and actionable. Focus on details that developers need for accurate implementation.
For the implementation_prompt, use {platform_name}-specific terminology and follow their recommended patterns.
"""

        try:
            # Use standard Chat Completions API for vision models
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": profile.system_prompt
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
                            {"type": "image_url", "image_url": {"url": image_b64}}
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.1
            )

            # Extract text output from Chat Completions API
            content = ""
            if hasattr(response, "choices") and len(response.choices) > 0:
                content = response.choices[0].message.content or ""
            
            # Try to extract JSON from the response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            # If JSON parsing fails, create structured response
            return self._parse_text_response(content)
            
        except Exception as e:
            print(f"❌ OpenAI API error: {e}")
            return self._create_fallback_analysis(str(e))
    
    def _parse_text_response(self, content: str) -> Dict[str, Any]:
        """Parse text response when JSON extraction fails"""
        return {
            "layout_analysis": content[:300] + "..." if len(content) > 300 else content,
            "visual_design": "Analysis completed - see full response",
            "components_identified": [],
            "interaction_patterns": "Standard UI interactions detected",
            "technical_specifications": "CSS and responsive design needed",
            "accessibility_notes": ["Review for WCAG compliance"],
            "implementation_prompt": content,
            "confidence_score": 0.7,
            "uncertain_elements": ["JSON parsing failed - text response provided"]
        }
    
    def _create_fallback_analysis(self, error: str) -> Dict[str, Any]:
        """Create fallback analysis when API fails"""
        return {
            "layout_analysis": f"Analysis failed: {error}",
            "visual_design": "Unable to analyze",
            "components_identified": [],
            "interaction_patterns": "Unable to analyze",
            "technical_specifications": "Unable to analyze", 
            "accessibility_notes": ["Manual review required"],
            "implementation_prompt": f"Analysis failed due to: {error}. Please analyze manually.",
            "confidence_score": 0.0,
            "uncertain_elements": [f"API Error: {error}"]
        }
    
    def _create_handoff_json(
        self,
        analysis: Dict[str, Any],
        colors: List[ColorInfo],
        profile: DesignerProfile,
        platform_target: str,
        image_url: str
    ) -> DesignHandoff:
        """Create structured handoff JSON"""
        
        # Parse components from analysis
        components = []
        if isinstance(analysis.get('components_identified'), list):
            for comp in analysis['components_identified']:
                if isinstance(comp, dict):
                    components.append(ComponentInfo(
                        type=comp.get('type', 'unknown'),
                        location=comp.get('location', 'unknown'),
                        description=comp.get('description', ''),
                        properties=comp.get('properties', {}),
                        confidence=comp.get('confidence', 0.5)
                    ))
        
        # Create layout info
        layout = LayoutInfo(
            structure=analysis.get('layout_analysis', 'Unknown layout'),
            grid_system=None,
            spacing={},
            responsive_behavior=None
        )
        
        # Generate style tokens
        style_tokens = {
            "colors": {
                "primary": colors[0].hex if colors else "#000000",
                "secondary": colors[1].hex if len(colors) > 1 else "#666666",
                "palette": [color.hex for color in colors[:5]]
            },
            "typography": analysis.get('visual_design', {}),
            "spacing": {},
            "borders": {},
            "shadows": {}
        }
        
        # Create handoff object
        handoff = DesignHandoff(
            timestamp=datetime.now().isoformat(),
            image_url=image_url,
            designer_profile=profile.name,
            platform_target=platform_target,
            dominant_colors=colors,
            typography=analysis.get('visual_design', {}),
            layout=layout,
            components=components,
            style_tokens=style_tokens,
            responsive_specs={},
            accessibility_notes=analysis.get('accessibility_notes', []),
            prompt_for_platform=analysis.get('implementation_prompt', ''),
            code_suggestions=[],
            confidence_score=analysis.get('confidence_score', 0.5),
            uncertain_flags=analysis.get('uncertain_elements', [])
        )
        
        return handoff
    
    def _format_prompt_output(
        self, 
        analysis: Dict[str, Any], 
        platform_config: Dict[str, Any],
        platform_target: str
    ) -> str:
        """Format analysis result as a clean prompt for direct use"""
        platform_name = platform_config.get('platform_name', platform_target)
        
        prompt_text = f"""# {platform_name} Implementation Prompt

## Analysis Summary
{analysis.get('layout_analysis', 'Layout analysis not available')}

## Visual Design
{analysis.get('visual_design', 'Visual design analysis not available')}

## Components Identified
"""
        
        components = analysis.get('components_identified', [])
        if isinstance(components, list):
            for comp in components:
                if isinstance(comp, dict):
                    prompt_text += f"- {comp.get('type', 'Component')}: {comp.get('description', 'No description')}\n"
                else:
                    prompt_text += f"- {comp}\n"
        else:
            prompt_text += f"{components}\n"
        
        prompt_text += f"""
## Technical Specifications
{analysis.get('technical_specifications', 'Technical specs not available')}

## Implementation Prompt for {platform_name}
{analysis.get('implementation_prompt', 'Implementation prompt not available')}

## Accessibility Notes
"""
        
        accessibility_notes = analysis.get('accessibility_notes', [])
        if isinstance(accessibility_notes, list):
            for note in accessibility_notes:
                prompt_text += f"- {note}\n"
        else:
            prompt_text += f"{accessibility_notes}\n"
        
        confidence = analysis.get('confidence_score', 0.5)
        prompt_text += f"\n## Analysis Confidence: {confidence:.1%}\n"
        
        uncertain_elements = analysis.get('uncertain_elements', [])
        if uncertain_elements:
            prompt_text += "\n## Uncertain Elements:\n"
            for element in uncertain_elements:
                prompt_text += f"- {element}\n"
        
        return prompt_text
    
    def save_handoff(self, handoff: Union[DesignHandoff, str], filepath: Optional[str] = None, output_mode: str = "json") -> str:
        """Save handoff JSON or prompt text to file"""
        if not filepath:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            if output_mode == "prompt":
                filepath = f"design_prompt_{timestamp}.md"
            else:
                # Save JSON files in output folder
                output_dir = "output"
                filepath = os.path.join(output_dir, f"design_handoff_{timestamp}.json")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else '.', exist_ok=True)
        
        if output_mode == "prompt" and isinstance(handoff, str):
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(handoff)
        elif isinstance(handoff, DesignHandoff):
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(handoff.to_dict(), f, indent=2, ensure_ascii=False)
        else:
            raise ValueError("Invalid handoff type for specified output mode")
        
        return filepath
    
    def get_available_platforms(self) -> List[str]:
        """Get list of available platform targets"""
        return list(self.platform_handoffs.keys())
    
    def get_platform_info(self, platform_key: str) -> Dict[str, Any]:
        """Get information about a specific platform"""
        return self.platform_handoffs.get(platform_key, {})
    
    def validate_handoff(self, handoff: DesignHandoff) -> List[str]:
        """Validate handoff JSON against schema"""
        errors = []
        
        # Check required fields
        if not handoff.prompt_for_platform.strip():
            errors.append("Missing implementation prompt")
        
        if handoff.confidence_score < 0.3:
            errors.append("Low confidence score - manual review recommended")
        
        if not handoff.dominant_colors:
            errors.append("No colors extracted")
        
        if len(handoff.uncertain_flags) > 3:
            errors.append("Too many uncertain elements")
        
        return errors


def demo_analysis():
    """Demo function showing the complete workflow"""
    print("🧠 Vibe Mind - OpenAI SDK Demo")
    print("=" * 40)
    
    # Initialize analyzer
    analyzer = VibeMindOpenAI()
    
    # Check if profiles are loaded
    if not analyzer.profiles:
        print("❌ No designer profiles found. Please ensure profiles are in profiles/")
        return
    
    if not analyzer.platform_handoffs:
        print("❌ No platform configurations found. Please ensure handoff configs are in handoff/")
        return
    
    print("\n📋 Available Designer Profiles:")
    for key, profile in analyzer.profiles.items():
        print(f"  • {key}: {profile.name}")
    
    print("\n🎯 Available Platforms:")
    for key, config in analyzer.platform_handoffs.items():
        platform_name = config.get('platform_name', key)
        description = config.get('description', 'No description')
        print(f"  • {key}: {platform_name}")
        print(f"    {description}")
    
    # Get user input
    image_input = input("\n📸 Enter image URL or path: ").strip()
    if not image_input:
        print("❌ No image provided")
        return
    
    profile_key = input(f"\n👤 Select profile ({', '.join(analyzer.profiles.keys())}): ").strip()
    if profile_key not in analyzer.profiles:
        profile_key = list(analyzer.profiles.keys())[0]
        print(f"Using default profile: {profile_key}")
    
    available_platforms = list(analyzer.platform_handoffs.keys())
    platform = input(f"\n🎯 Target platform ({'/'.join(available_platforms)}) [{available_platforms[0]}]: ").strip()
    if not platform or platform not in available_platforms:
        platform = available_platforms[0]
        print(f"Using default platform: {platform}")
    
    output_mode = input("\n📄 Output mode (json/prompt) [json]: ").strip().lower() or "json"
    if output_mode not in ["json", "prompt"]:
        output_mode = "json"
        print(f"Using default output mode: {output_mode}")
    
    try:
        # Perform analysis
        print(f"\n🔄 Analyzing with {profile_key} profile for {platform}...")
        result = analyzer.analyze_image(image_input, profile_key, platform, output_mode=output_mode)
        
        # Save results
        output_file = analyzer.save_handoff(result, output_mode=output_mode)
        print(f"✅ Analysis complete! Saved to: {output_file}")
        
        if output_mode == "json":
            # Validate results
            errors = analyzer.validate_handoff(result)
            if errors:
                print(f"\n⚠️  Validation warnings:")
                for error in errors:
                    print(f"  • {error}")
            
            # Display summary
            print(f"\n📊 Analysis Summary:")
            print(f"  • Profile: {result.designer_profile}")
            print(f"  • Platform: {result.platform_target}")
            print(f"  • Confidence: {result.confidence_score:.2f}")
            print(f"  • Colors found: {len(result.dominant_colors)}")
            print(f"  • Components: {len(result.components)}")
            
            print(f"\n🚀 Implementation Prompt Preview:")
            print("-" * 40)
            prompt_preview = result.prompt_for_platform[:300]
            print(prompt_preview + "..." if len(result.prompt_for_platform) > 300 else prompt_preview)
        else:
            # Display prompt preview
            print(f"\n🚀 Generated Prompt Preview:")
            print("-" * 40)
            lines = result.split('\n')
            preview_lines = lines[:15]
            for line in preview_lines:
                print(line)
            if len(lines) > 15:
                print(f"... and {len(lines) - 15} more lines")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")


if __name__ == "__main__":
    demo_analysis()
