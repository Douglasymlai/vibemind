import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Sparkles, Mic, Link, Image, Upload, AlertCircle } from 'lucide-react';
import PromptEnhancementDialog from './PromptEnhancementDialog';
import { imageCacheService } from '../services/imageCache';

interface InputCardProps {
  textareaValue: string;
}

const InputCard: React.FC<InputCardProps> = ({ textareaValue }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [cachedImageId, setCachedImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePromptEnhancement = () => {
    setIsDialogOpen(true);
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('File selected:', file.name, file.size, file.type);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 10MB');
      }

      // Cache the image
      const imageId = await imageCacheService.cacheImage(file);
      console.log('Image cached with ID:', imageId);
      
      // Set states and open dialog
      setUploadedImage(file);
      setCachedImageId(imageId);
      setIsDialogOpen(true);
      
    } catch (error: any) {
      console.error('Failed to process image:', error);
      setUploadError(error.message || 'Failed to process image');
      
      // Show error for a few seconds
      setTimeout(() => {
        setUploadError(null);
      }, 5000);
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleRecording = () => {
    console.log('Recording clicked - feature coming soon');
  };

  const handleAddLinks = () => {
    console.log('Add links clicked - feature coming soon');
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Error message */}
        {uploadError && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </div>
        )}
        
        {/* Main buttons */}
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
            className="flex-1 gap-2 relative"
            size="icon"
            onClick={handleUploadImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : cachedImageId ? (
              <div className="relative">
                <Image className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ) : (
              <Upload className="w-4 h-4" />
            )}
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
          if (!newOpen) {
            // Clear image states when dialog closes
            setUploadedImage(null);
            setCachedImageId(null);
          }
        }}
        uploadedImage={uploadedImage}
        cachedImageId={cachedImageId}
        textareaValue={textareaValue}
      />
    </>
  );
};

export default InputCard;