# Vibe Mind - OpenAI SDK Implementation

A comprehensive image analysis system that processes UI/UX designs using OpenAI's vision models to generate structured handoff prompts for vibe coding platforms like V0, Magic Pattern, and Lovable.

## 🏗️ Architecture Overview

This implementation follows the specifications outlined in `vibe_mind.mdx`:

### Core Components

1. **ImagePreprocessor**: Handles image loading, resizing, and color extraction
2. **DesignerProfile**: Machine-readable profiles that define analysis behavior  
3. **VibeMindOpenAI**: Main orchestrator using OpenAI SDK
4. **DesignHandoff**: Structured output schema for vibe coding platforms

### Data Flow

```
Image Input → Preprocessing → OpenAI Vision Analysis → Structured Handoff JSON
     ↓              ↓                ↓                        ↓
   Resize      Extract Colors    AI Analysis        Platform-Ready Prompt
```

## 🚀 Quick Start

### 1. Setup

```bash
# Install dependencies
pip install -r ../backend/requirements.txt

# Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"
```

### 2. Run Interactive Demo

```bash
python vibe_mind.py
```

### 3. Run Tests

```bash
python test_vibe_mind.py
```

## 🎯 Usage Examples

### Basic Analysis

```python
from vibe_mind import VibeMindOpenAI

# Initialize analyzer
analyzer = VibeMindOpenAI()

# Analyze image with designer profile
handoff = analyzer.analyze_image(
    image_input="https://example.com/ui-design.png",
    designer_profile_key="product_designer",
    platform_target="v0",
    project_context={
        "app_type": "dashboard",
        "theme": "modern"
    }
)

# Save structured handoff
output_file = analyzer.save_handoff(handoff)
print(f"Handoff saved to: {output_file}")
```

### Batch Processing

```python
# Process multiple images
images = [
    ("design1.png", "product_designer", "v0"),
    ("design2.png", "fintech_designer", "magic-pattern"),
    ("design3.png", "gaming_designer", "lovable")
]

for image_url, profile, platform in images:
    handoff = analyzer.analyze_image(image_url, profile, platform)
    analyzer.save_handoff(handoff, f"handoff_{platform}_{profile}.json")
```

## 📋 Designer Profiles

### Available Profiles

- **product_designer**: General UI/UX analysis for web/mobile
- **fintech_designer**: Financial app interfaces
- **gaming_designer**: Game UI and interactive elements
- **age_inclusive_designer**: Accessibility-focused analysis
- **vibe_coding_specialist**: Optimized for vibe coding platforms

### Profile Structure

```json
{
  "name": "Profile Name",
  "description": "Profile description",
  "analysis_steps": [
    "Step 1: Layout analysis",
    "Step 2: Visual design extraction",
    "Step 3: Component identification"
  ],
  "platform_targets": ["v0", "magic-pattern", "lovable"],
  "specializations": ["modern_ui", "design_systems"]
}
```

## 🎨 Output Schema

### DesignHandoff Structure

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "image_url": "source_image.png", 
  "designer_profile": "product_designer",
  "platform_target": "v0",
  
  "dominant_colors": [
    {
      "hex": "#3B82F6",
      "rgb": [59, 130, 246],
      "name": "blue",
      "confidence": 0.85
    }
  ],
  
  "layout": {
    "structure": "Three-column layout with sidebar",
    "grid_system": "CSS Grid",
    "spacing": {"base": "16px"},
    "responsive_behavior": "Mobile-first"
  },
  
  "components": [
    {
      "type": "Button",
      "location": "top-right",
      "description": "Primary CTA button",
      "properties": {
        "variant": "filled",
        "size": "medium"
      },
      "confidence": 0.9
    }
  ],
  
  "prompt_for_platform": "Create a modern dashboard with...",
  "confidence_score": 0.87,
  "uncertain_flags": ["Complex navigation structure"]
}
```

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: Model to use (default: `gpt-4.1`)

### Image Processing

- **Max Dimension**: 512px (configurable)
- **Supported Formats**: JPEG, PNG, WebP
- **Input Types**: URL, file path, base64 data

### Color Extraction

- **Algorithm**: K-means clustering
- **Default Colors**: 5 dominant colors
- **Confidence Scoring**: Based on cluster size

## 🎯 Platform Integration

### V0 (Vercel)

```javascript
// Example V0 prompt generated
"Create a React component with Tailwind CSS featuring a clean dashboard layout with sidebar navigation, primary blue (#3B82F6) color scheme, and responsive design for mobile and desktop."
```

### Magic Pattern

```javascript
// Example Magic Pattern prompt
"Design a financial dashboard component with card-based layout, data visualization elements, and professional color palette suitable for fintech applications."
```

### Lovable

```javascript
// Example Lovable prompt  
"Build an accessible web application with inclusive design principles, high contrast colors, and keyboard navigation support."
```

## 🧪 Testing

### Test Suite

The `test_vibe_mind.py` script includes:

- ✅ Profile loading verification
- ✅ Image preprocessing tests
- ✅ OpenAI API integration
- ✅ Multiple platform output
- ✅ Validation checks

### Manual Testing

```bash
# Test with sample images
python test_vibe_mind.py

# Interactive analysis
python vibe_mind.py
```

## 🔍 Advanced Features

### Image Preprocessing

- **Auto-resize**: Maintains aspect ratio
- **Color extraction**: K-means clustering
- **Format conversion**: Optimized for API
- **Memory efficient**: Handles large images

### AI Analysis

- **Structured prompts**: JSON schema enforcement
- **Context awareness**: Project-specific analysis  
- **Confidence scoring**: Reliability metrics
- **Error handling**: Graceful fallbacks

### Validation

- **Schema validation**: Ensures data completeness
- **Confidence thresholds**: Quality assurance
- **Error reporting**: Detailed diagnostics

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**
   ```bash
   export OPENAI_API_KEY="your-key-here"
   ```

2. **Profile Not Found**
   - Check `backend/profiles/` directory
   - Verify JSON syntax

3. **Image Loading Failed**
   - Verify URL accessibility
   - Check file permissions
   - Supported formats: JPEG, PNG, WebP

4. **Low Confidence Score**
   - Try higher resolution image
   - Ensure clear UI elements
   - Check lighting/contrast

### Debug Mode

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

analyzer = VibeMindOpenAI()
```

## 📚 API Reference

### VibeMindOpenAI

```python
class VibeMindOpenAI:
    def __init__(self, api_key=None, model=None)  # defaults to env or gpt-4.1
    def analyze_image(self, image_input, designer_profile_key, platform_target, project_context=None)
    def save_handoff(self, handoff, filepath=None)
    def validate_handoff(self, handoff)
```

### DesignHandoff

```python
@dataclass
class DesignHandoff:
    timestamp: str
    image_url: str
    designer_profile: str
    platform_target: str
    dominant_colors: List[ColorInfo]
    # ... additional fields
```

## 🤝 Contributing

1. **Add New Profiles**: Create JSON files in `backend/profiles/`
2. **Extend Analysis**: Modify `_analyze_with_openai()` method
3. **Platform Support**: Add new platform targets
4. **Testing**: Run test suite before commits

## 📄 License

See LICENSE file in the project root.

## 🔗 Related Files

- `vibe_mind.mdx`: Product requirements and architecture
- `../backend/vibe_mind.py`: Original CAMEL framework implementation
- `../backend/profiles/`: Designer profile definitions
- `test_vibe_mind.py`: Comprehensive test suite

---

Built with ❤️ for the vibe coding community.
