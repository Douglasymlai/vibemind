<div align="center">
  <img src="/public/logo.png" alt="Vibe Mind Logo" width="200" />
</div>

# 🧠 Vibe Mind - Multimodal Prompt Enrichment Tool

Translate your ideas — across text, images, and files — into high-quality, designer-grade prompts for any AI vibe-coding platform.

## 🔍 What It Does

This tool helps users who work visually or conceptually — not just through words — create clearer, more effective prompts for AI design and coding workflows (e.g., V0, Magic Pattern, or similar vibe coding tools).

It automatically:
- **📸 Extracts key insights** from images, UI screenshots, or files
- **📝 Refines messy or incomplete** text input
- **🧩 Merges all input** into a structured, professional-quality prompt
- **💡 Optimizes for better AI output** with fewer tokens

## 🚧 Why It Matters

Not every designer, developer, or maker is a prompt expert. Many users express their intent through images, sketches, Figma files, or rough notes — but today's AI tools often require precise, text-only input to perform well.

**This project bridges that gap.**

## 🌱 Our Vision

While we're not yet doing full context engineering, this project is a step in that direction. We aim to:

> Make it easy for anyone to express intent in a multimodal way — and automatically translate that into agent-friendly context.

This aligns with emerging trends in AI research around prompt structuring, context-aware agents, and efficient multimodal design workflows.

## ✨ Current Features

- **🎯 Context-Aware Analysis Profiles**: Specialized workflows for different vibe-coding scenarios
- **📁 Modular Profile System**: Create, edit, and manage custom analysis profiles as JSON files
- **🔄 Dynamic Prompt Generation**: Automatically structure insights into AI-ready prompts
- **📝 Professional Report Templates**: Generate structured outputs optimized for downstream AI tools
- **🛠️ Interactive Workflow**: User-friendly menu system for multimodal input processing
- **📊 Multiple Input Types**: Support for local files, URLs, and various media formats
- **🧩 Template Customization**: Each profile can define its own prompt structure and analysis steps

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up API Key**:
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your_key_here" > .env
   ```

3. **Start Enhancing Your Prompts**:
   ```bash
   # Quick demo with UI screenshot analysis
   python quick_start.py
   
   # Full multimodal prompt enrichment workflow
   python vibe_mind.py
   
   # Direct context extraction (for developers)
   python chat_agent_with_image_analysis.py
   ```

4. **Create Custom Workflows**:
   - Run `python vibe_mind.py`
   - Choose "Manage Profiles" to create vibe-coding specific workflows
   - Customize analysis steps for your target AI platform (V0, Magic Pattern, etc.)
   - Generate optimized prompts for better AI output


## 🎯 Usage Examples

### Simple Analysis
```python
from chat_agent_with_image_analysis import ImageAnalysisChatAgent

agent = ImageAnalysisChatAgent()
result = agent.analyze_image("image.jpg", "What's in this image?")
print(result)
```

### Multimodal Prompt Enrichment
```python
from vibe_mind import StructuredImageAnalyzer

# Initialize the multimodal context enhancer
enhancer = StructuredImageAnalyzer()

# Interactive workflow for vibe-coding platforms
# - Process images, files, and text input
   # - Select target AI platform (V0, Magic Pattern, etc.)
# - Generate optimized, structured prompts
```

### Custom Vibe-Coding Workflow
```python
# Create a V0.dev-optimized workflow
v0_workflow = {
    'name': 'V0 Component Generator',
    'target_platform': 'v0.dev',
    'description': 'Convert UI concepts to V0-ready component prompts',
    'extraction_steps': [
        'Identify component structure and hierarchy',
        'Extract design tokens and styling patterns',
        'Map interactive elements and state management',
        'Determine responsive behavior and props'
    ],
    'prompt_template': '''Create a React component with the following specifications:

## Component Structure
{structure_analysis}

## Styling & Design
{styling_analysis}

## Functionality
{interaction_analysis}

## Props & State
{props_analysis}''',
    'optimization_rules': {
        'max_tokens': 1000,
        'focus_areas': ['component_architecture', 'styling_specificity', 'responsive_design']
    }
}

enhancer.create_profile('V0 Component Generator', v0_workflow)

# Process multimodal input → AI-ready prompt
result = enhancer.analyze_with_profile(
    image_url='ui_screenshot.png',
    profile=v0_workflow,
    custom_text='Create a dashboard card component with hover effects'
)
```

## 🔧 Configuration

Vibe Mind uses OpenAI's GPT-4O Mini for multimodal analysis. Configure your API access:

```bash
# .env file
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Customize for your preferred AI platform
TARGET_PLATFORM=v0.dev  # or magic_pattern, lovable, etc.
MAX_PROMPT_TOKENS=1000
OPTIMIZATION_LEVEL=balanced  # or speed, quality
```

## 🎯 Vibe-Coding Workflows

### 🛠️ Custom Workflow Creation

Create workflows optimized for your specific AI vibe-coding platform:

1. **Target Platform Setup**: Define your AI tool (V0, Magic Pattern, Lovable, etc.)
2. **Context Extraction Rules**: Specify what insights to extract from multimodal input
3. **Prompt Structure**: Design the optimal format for your target AI
4. **Token Optimization**: Configure efficiency rules for better performance

### 📋 Workflow Structure

Each workflow profile contains:
- **Target Platform**: Specific AI tool or platform (V0, Magic Pattern, etc.)
- **Extraction Steps**: Multimodal analysis pipeline
- **Prompt Template**: AI platform-optimized format
- **Optimization Rules**: Token efficiency and clarity guidelines
- **Output Format**: Structured, AI-ready prompt

```json
// V0.dev Example
{
  "name": "V0 Component Builder",
  "target_platform": "v0.dev",
  "description": "Convert UI screenshots to V0-optimized component prompts",
  "extraction_steps": [
    "Identify component structure and hierarchy",
    "Extract styling and design tokens",
    "Determine interactive elements and states",
    "Map data flow and props"
  ],
  "prompt_template": "Create a React component...{structured_analysis}",
  "optimization_rules": {
    "max_tokens": 1000,
    "focus_areas": ["functionality", "styling", "responsiveness"]
  }
}

// Magic Pattern Example
{
  "name": "Magic Pattern UI Generator",
  "target_platform": "magic_pattern",
  "description": "Convert design concepts to Magic Pattern-optimized prompts",
  "extraction_steps": [
    "Analyze visual hierarchy and layout patterns",
    "Extract color schemes and typography",
    "Identify interactive components and behaviors",
    "Map responsive design requirements"
  ],
  "prompt_template": "Generate a UI pattern with these specifications...{structured_analysis}",
  "optimization_rules": {
    "max_tokens": 800,
    "focus_areas": ["design_patterns", "visual_consistency", "user_experience"]
  }
}
```

## 📦 Coming Soon

- **🔌 API for Programmatic Access**: Integrate multimodal prompt enrichment into your existing workflows
- **🎯 V0.dev Integration Demo**: Direct integration with popular vibe-coding platforms
- **📤 Plugin Support**: Drag-and-drop for image/file upload and processing
- **🧠 Advanced Context Models**: More sophisticated visual insight extraction


## 🤝 Contributing

Have ideas? Want to collaborate or experiment?

**Open an issue or submit a pull request — we're open to co-building.**


## 🎨 Example Use Cases

### UI Screenshot → V0 Component
```bash
# Input: Dashboard screenshot + "Create a data visualization component"
# Output: Optimized V0 prompt with component structure, styling, and props
```

### Design Mockup → Magic Pattern Integration
```bash
# Input: Figma export + interaction notes
# Output: Structured prompt for responsive component generation
```

### Sketch → Technical Specification
```bash
# Input: Hand-drawn wireframe + feature requirements
# Output: Detailed technical prompt for AI coding assistant
```

### Concept Art → Lovable App Builder
```bash
# Input: App concept sketches + user flow descriptions
# Output: Structured prompt for full-stack app generation
```

## Acknowledgment

*Built with CAMEL Framework • Ready for Demo*