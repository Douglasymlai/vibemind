import React, { useState, useRef, useEffect } from 'react';
import './global.css';
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';
import InputCard from './components/inputcard';
import ApiKeyDialog from './components/ApiKeyDialog';
import ImageCacheManager from './components/ImageCacheManager';
import { Key, Settings, HardDrive } from 'lucide-react';

function App() {
  const [showEnhanceButton, setShowEnhanceButton] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check for API key on component mount
  useEffect(() => {
    const apiKey = localStorage.getItem('openai_api_key');
    setHasApiKey(!!apiKey);
    
    // Show API key dialog if no key is found
    if (!apiKey) {
      setShowApiKeyDialog(true);
    }
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log(value);
    setTextareaValue(value);
    
    if (value.length > 0 && (isTextareaFocused || isHoveringCard)) {
      setShowEnhanceButton(true);
    } else if (!isTextareaFocused && !isHoveringCard) {
      setShowEnhanceButton(false);
    }
  };

  const handleTextareaFocus = () => {
    setIsTextareaFocused(true);
    if (textareaRef.current && textareaRef.current.value.length > 0) {
      setShowEnhanceButton(true);
    }
  };

  const handleTextareaBlur = () => {
    setIsTextareaFocused(false);
    // Only hide if not hovering over the card
    if (!isHoveringCard) {
      setShowEnhanceButton(false);
    }
  };

  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Simplified position calculation - just use textarea position
      const textareaRect = textarea.getBoundingClientRect();
      
      // Fixed position relative to textarea
      const x = textareaRect.left + 20; // Fixed offset from left
      const y = textareaRect.top + 10;  // Fixed offset from top
      
      setCursorPosition({ x, y });
    }
  };

  const handleTextareaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only update position on certain keys to reduce calculations
    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
      updateCursorPosition();
    }
  };

  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Debounce the position update
    setTimeout(() => updateCursorPosition(), 10);
  };

  const handleApiKeySet = (apiKey: string) => {
    setHasApiKey(true);
    console.log('API key set successfully');
  };

  const handleOpenApiKeyDialog = () => {
    setShowApiKeyDialog(true);
  };

  return (
    <div className="App flex flex-col items-center justify-center h-screen relative">
      {/* API Key Status & Settings */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          hasApiKey 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <Key className="w-3 h-3" />
          {hasApiKey ? 'API Key Set' : 'No API Key'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCacheManager(true)}
          className="h-8 w-8 p-0"
          title="Image Cache Manager"
        >
          <HardDrive className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenApiKeyDialog}
          className="h-8 w-8 p-0"
          title="API Key Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <Textarea 
        ref={textareaRef}
        className="w-[500px] h-[200px] bg-gray-50 rounded-lg border border-gray-200 p-4"
        placeholder="Write your prompt here..."
        onChange={handleTextareaChange}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
        onKeyUp={handleTextareaKeyUp}
        onMouseUp={handleTextareaMouseUp}
      />
      
      {/* Floating InputCard */}
      {showEnhanceButton && (
        <div
          className="fixed z-40 floating-input-card"
          tabIndex={-1}
          onMouseEnter={() => setIsHoveringCard(true)}
          onMouseLeave={() => {
            setIsHoveringCard(false);
            if (!isTextareaFocused) {
              setShowEnhanceButton(false);
            }
          }}
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: 'translateX(-5%) translateY(-80%)',
            marginTop: '-8px'
          }}
        >
          <InputCard textareaValue={textareaValue} />
        </div>
      )}

      {/* API Key Dialog */}
      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onApiKeySet={handleApiKeySet}
      />

      {/* Image Cache Manager */}
      <ImageCacheManager
        open={showCacheManager}
        onOpenChange={setShowCacheManager}
      />
    </div>
  );
}

export default App;
