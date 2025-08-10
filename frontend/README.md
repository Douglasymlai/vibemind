# VibeMind Frontend

## Folder Structure

```
frontend/
├── public/
│   ├── generating.json          # Lottie animation data for loading states
│   ├── index.html               # Main HTML template
│   ├── manifest.json            # PWA manifest
│   ├── robots.txt               # SEO robots file
│   ├── favicon.ico              # App icon
│   ├── logo192.png              # App logo (192px)
│   └── logo512.png              # App logo (512px)
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── button.tsx       # Button component
│   │   │   ├── card.tsx         # Card component
│   │   │   ├── dialog.tsx       # Dialog/Modal component
│   │   │   ├── input.tsx        # Input field component
│   │   │   ├── radio-group.tsx  # Radio button group
│   │   │   ├── tabs.tsx         # Tab navigation
│   │   │   ├── textarea.tsx     # Textarea component
│   │   │   └── tooltips.tsx     # Tooltip component
│   │   ├── inputcard.tsx        # Floating enhancement card
│   │   └── PromptEnhancementDialog.tsx  # Main enhancement dialog
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── types/
│   │   └── json.d.ts            # TypeScript declarations
│   ├── App.tsx                  # Main application component
│   ├── App.test.tsx             # App component tests
│   ├── global.css               # Global styles
│   ├── index.tsx                # Application entry point
│   ├── logo.svg                 # SVG logo
│   ├── react-app-env.d.ts       # React app type declarations
│   ├── reportWebVitals.ts       # Performance monitoring
│   └── setupTests.ts            # Test configuration
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── .gitignore                   # Git ignore rules
```

## Components Data Points

### App.tsx - Main Application Component

#### State Management
- **`showEnhanceButton`** (boolean)
  - Controls visibility of floating InputCard
  - Shows when textarea has content AND is focused/hovered
  
- **`cursorPosition`** (object: { x: number, y: number })
  - Tracks position for floating card placement
  - Calculated relative to textarea position
  
- **`isTextareaFocused`** (boolean)
  - Tracks if textarea has focus
  - Prevents card from disappearing when focused
  
- **`isHoveringCard`** (boolean)
  - Tracks if user is hovering over floating card
  - Keeps card visible during hover interactions
  
- **`textareaValue`** (string)
  - Stores current textarea content
  - Passed down to child components for processing

#### Event Handlers
- **`handleTextareaChange`**
  - Updates `textareaValue` state
  - Controls `showEnhanceButton` visibility logic
  - Triggers on every text input
  
- **`handleTextareaFocus`**
  - Sets `isTextareaFocused` to true
  - Shows enhancement card if text exists
  
- **`handleTextareaBlur`**
  - Sets `isTextareaFocused` to false
  - Hides card unless hovering over it
  
- **`updateCursorPosition`**
  - Calculates floating card position
  - Uses simplified positioning (fixed offsets)
  
- **`handleTextareaKeyUp`**
  - Updates position on specific keys (Enter, Backspace, Delete)
  - Optimized for performance
  
- **`handleTextareaMouseUp`**
  - Updates position on mouse clicks
  - Debounced with 10ms delay

#### UI Elements
- **Textarea Component**
  - 500px width × 200px height
  - Gray background with border
  - Placeholder: "Write your prompt here..."
  - Multiple event listeners for interaction tracking
  
- **Floating InputCard**
  - Conditional rendering based on `showEnhanceButton`
  - Fixed positioning with z-index 40
  - Hover detection for persistent visibility
  - Transform positioning for precise placement

#### Props Flow
```
App.tsx → InputCard → PromptEnhancementDialog
textareaValue → textareaValue → textareaValue
```

### Key Features
1. **Smart Visibility**: Card appears only when textarea has content and is active
2. **Hover Persistence**: Card stays visible when hovering over it
3. **Performance Optimized**: Reduced position calculations and debounced updates
4. **Accessibility**: Proper focus management and keyboard navigation
5. **Responsive Design**: Fixed positioning that adapts to textarea location

### Dependencies
- React 18+ with hooks
- Tailwind CSS for styling
- Lucide React for icons
- Radix UI for dialog components
- Lottie for animations

