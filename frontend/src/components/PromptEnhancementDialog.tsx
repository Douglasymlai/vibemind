import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { RadioGroup, RadioGroupItemWithLabel } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import Lottie from 'lottie-react';
import { ArrowRight, Image, AlertCircle, Copy, CheckCircle, X, Trash2 } from 'lucide-react';
import { apiService, Profile } from '../services/api';
import { imageCacheService, CachedImage } from '../services/imageCache';

interface PromptEnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadedImage?: File | null;
  cachedImageId?: string | null;
  textareaValue: string;
}

const PromptEnhancementDialog: React.FC<PromptEnhancementDialogProps> = ({
  open,
  onOpenChange,
  uploadedImage,
  cachedImageId,
  textareaValue,
}) => {
  const [selectedRole, setSelectedRole] = useState('product_designer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [cachedImage, setCachedImage] = useState<CachedImage | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Load cached image data when cachedImageId changes
  useEffect(() => {
    const loadCachedImage = async () => {
      if (cachedImageId) {
        try {
          const image = await imageCacheService.getCachedImage(cachedImageId);
          if (image) {
            setCachedImage(image);
            setImagePreviewUrl(image.dataUrl);
            console.log('Cached image loaded:', image.fileName);
          }
        } catch (error) {
          console.error('Failed to load cached image:', error);
        }
      } else {
        setCachedImage(null);
        setImagePreviewUrl(null);
      }
    };

    loadCachedImage();
  }, [cachedImageId]);

  // Handle uploaded image file preview
  useEffect(() => {
    if (uploadedImage && !cachedImageId) {
      const url = URL.createObjectURL(uploadedImage);
      setImagePreviewUrl(url);
      console.log('Image preview URL created for:', uploadedImage.name);

      // Cleanup URL when component unmounts or image changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [uploadedImage, cachedImageId]);

  useEffect(() => {
    fetch('/generating.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  // Load profiles when dialog opens
  useEffect(() => {
    if (open) {
      loadProfiles();
    }
  }, [open]);

  const loadProfiles = async () => {
    try {
      const profilesData = await apiService.getProfiles();
      setProfiles(profilesData);
      
      // Set default profile if available
      const profileKeys = Object.keys(profilesData);
      if (profileKeys.length > 0 && !profileKeys.includes(selectedRole)) {
        setSelectedRole(profileKeys[0]);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
      setError('Failed to load profiles. Please check your connection.');
    }
  };

  const handleStart = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        throw new Error('Please set your OpenAI API key first');
      }

      let result;
      if (cachedImageId && cachedImage) {
        // Analyze cached image using base64 data
        const imageBase64 = await imageCacheService.getImageAsBase64(cachedImageId);
        if (imageBase64) {
          result = await apiService.analyzeCachedImage(
            imageBase64,
            cachedImage.fileName,
            textareaValue || 'Analyze this image and create a detailed prompt',
            selectedRole
          );
        } else {
          throw new Error('Failed to retrieve cached image data');
        }
      } else if (uploadedImage) {
        // Analyze uploaded image (fallback)
        result = await apiService.analyzeUploadedImage(
          uploadedImage,
          textareaValue || 'Analyze this image and create a detailed prompt',
          selectedRole
        );
      } else {
        // Text-only analysis with profile
        result = await apiService.analyzeImage({
          message: textareaValue || 'Create a detailed prompt for this design',
          profile_key: selectedRole,
          api_key: apiKey
        });
      }

      if (result.summarized_report) {
        setGeneratedPrompt(result.summarized_report);
      } else if (result.structured_result?.analysis_result) {
        setGeneratedPrompt(result.structured_result.analysis_result);
      } else {
        setGeneratedPrompt('Analysis completed successfully, but no detailed result was generated.');
      }
      
      setIsGenerated(true);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setIsGenerating(false);
    setIsGenerated(false);
    setError('');
    setGeneratedPrompt('');
  };

  const handleApply = async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    console.log('Selected role:', selectedRole);
    onOpenChange(false);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleRemoveImage = async () => {
    if (cachedImageId) {
      try {
        await imageCacheService.removeCachedImage(cachedImageId);
      } catch (error) {
        console.error('Failed to remove cached image:', error);
      }
    }
    
    // Clear image states
    setCachedImage(null);
    setImagePreviewUrl(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Prompt enhancement</DialogTitle>
        </DialogHeader>
        
        {/*Content*/}
        <div className="max-h-50vh py-6 px-4 border border-gray-200 rounded-xl">
          {!isGenerating && !isGenerated ? (
            <div className="flex flex-col gap-4">
              {/* Image Preview Section */}
              {(imagePreviewUrl || cachedImage) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {/* Image Preview */}
                    {imagePreviewUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={imagePreviewUrl} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    
                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Image className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {cachedImage?.fileName || uploadedImage?.name || 'Uploaded Image'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {cachedImage ? formatFileSize(cachedImage.fileSize) : 
                           uploadedImage ? formatFileSize(uploadedImage.size) : ''}
                        </span>
                        <span>
                          {cachedImage?.fileType || uploadedImage?.type || ''}
                        </span>
                        {cachedImageId && (
                          <span className="text-green-600">Cached</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            <Tabs defaultValue="ai-role" className="flex flex-col w-full gap-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-role">AI Role selection</TabsTrigger>
                <TabsTrigger value="vibe-extractor" disabled className="opacity-50">
                  Vibe Extractor (Coming Soon)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai-role" className="flex flex-col">
                <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
                  <div className="flex flex-col gap-4 p-[20px] border border-gray-200 rounded-xl">
                    {Object.entries(profiles).map(([key, profile]) => (
                      <RadioGroupItemWithLabel
                        key={key}
                        value={key}
                        id={key}
                        label={profile.name}
                      />
                    ))}
                    {Object.keys(profiles).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>No profiles available</p>
                        <p className="text-xs">Please check your connection and try again</p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </TabsContent>
              
              <TabsContent value="vibe-extractor" className="mt-4">
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Coming Soon</p>
                    <p className="text-sm">This feature is currently under development</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center w-full rounded-xl overflow-hidden aspect-video">
                {animationData && (
                  <Lottie 
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                    className="w-full h-full"
                  />
                )}
            </div>
                      ) : (
              <div className="flex flex-col gap-4 w-full max-h-[50vh]">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Generated Prompt</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="h-8"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  className="min-h-[300px] resize-none"
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  placeholder="Generated prompt will appear here..."
                />
              </div>
            )}
        </div>
        
        <DialogFooter>
          {!isGenerating && !isGenerated ? (
            <Button 
              onClick={handleStart}
              size="sm"
              variant="default"
            >
              Start
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : isGenerating ? (
            <div className="flex gap-2">
              <Button 
                onClick={handleBack}
                size="sm"
                variant="outline"
                disabled
              >
                Back
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleBack}
                size="sm"
                variant="outline"
              >
                Back
              </Button>
              <Button 
                onClick={handleApply}
                size="sm"
                variant="default"
              >
                Apply
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptEnhancementDialog;
