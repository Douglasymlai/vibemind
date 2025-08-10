import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Sparkles, Mic, Link, Image } from 'lucide-react';
import PromptEnhancementDialog from './PromptEnhancementDialog';

interface InputCardProps {
  textareaValue: string;
}

const InputCard: React.FC<InputCardProps> = ({ textareaValue }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePromptEnhancement = () => {
    setIsDialogOpen(true);
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      
      // Set both states immediately
      setUploadedImage(file);
      setIsDialogOpen(true);
      
      console.log('Dialog should open now, uploadedImage set to:', file.name);
      console.log('isDialogOpen will be set to true');
      
      // Force a re-render and check state after a short delay
      setTimeout(() => {
        console.log('Checking state after timeout - isDialogOpen should be true');
      }, 100);
    } else {
      console.log('No file selected');
    }
    
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleRecording = () => {
    console.log('Recording clicked - feature coming soon');
  };

  const handleAddLinks = () => {
    console.log('Add links clicked - feature coming soon');
  };

  return (
    <>
      <div className="flex flex-row p-1 bg-white rounded-lg shadow-md border border-gray-100">
        <Button 
          variant="ghost" 
          className="flex-1 gap-2"
          size="default"
          onClick={handlePromptEnhancement}
        >
          <Sparkles className="w-4 h-4" />
          <span>Prompt Enhancement</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex-1 gap-2"
          size="icon"
          onClick={handleUploadImage}
        >
          <Image className="w-4 h-4" /> 
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex-1 gap-2 disabled:opacity-50"
          size="icon"
          onClick={handleRecording}
          disabled
        >
          <Mic className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex-1 gap-2 disabled:opacity-50"
          size="icon"
          onClick={handleAddLinks}
          disabled={true}
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Prompt Enhancement Dialog */}
      <PromptEnhancementDialog 
        open={isDialogOpen} 
        onOpenChange={(newOpen) => {
          console.log('Dialog onOpenChange called with:', newOpen);
          setIsDialogOpen(newOpen);
        }}
        uploadedImage={uploadedImage}
        textareaValue={textareaValue}
      />
    </>
  );
};

export default InputCard;