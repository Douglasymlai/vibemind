import React, { useState, useRef, useEffect } from 'react';
import './global.css';
import { Textarea } from './components/ui/textarea';
import InputCard from './components/inputcard';

function App() {
  const [showEnhanceButton, setShowEnhanceButton] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="App flex flex-col items-center justify-center h-screen relative">
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
    </div>
  );
}

export default App;
