import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { RadioGroup, RadioGroupItemWithLabel } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import Lottie from 'lottie-react';
import { ArrowRight, Image } from 'lucide-react';

interface PromptEnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadedImage?: File | null;
  textareaValue: string;
}

const PromptEnhancementDialog: React.FC<PromptEnhancementDialogProps> = ({
  open,
  onOpenChange,
  uploadedImage,
  textareaValue,
}) => {
  const [selectedRole, setSelectedRole] = useState('saas-product-designer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  // Log when image is received
  useEffect(() => {
    if (uploadedImage) {
      console.log('Image received in dialog:', uploadedImage.name);
    }
  }, [uploadedImage]);

  // Log when textarea value is received
  useEffect(() => {
    if (textareaValue) {
      console.log('Textarea value received in dialog:', textareaValue);
    }
  }, [textareaValue]);

  useEffect(() => {
    fetch('/generating.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  const handleStart = () => {
    setIsGenerating(true);
    // Simulate 5 seconds of generation time
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 5000);
  };

  const handleBack = () => {
    setIsGenerating(false);
    setIsGenerated(false);
  };

  const handleApply = () => {
    console.log('Selected role:', selectedRole);
    onOpenChange(false);
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
              <div className="flex flex-row gap-4">
                {uploadedImage && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <Image className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Image</span>
                  </div>
                )}
              </div>
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
                    <RadioGroupItemWithLabel
                      value="saas-product-designer"
                      id="saas-product-designer"
                      label="SaaS Product Designer"
                    />
                    
                    <RadioGroupItemWithLabel
                      value="dating-app-designer"
                      id="dating-app-designer"
                      label="Dating App Designer"
                    />
                    
                    <RadioGroupItemWithLabel
                      value="healthcare-designer"
                      id="healthcare-designer"
                      label="Healthcare Designer"
                    />
                    
                    <RadioGroupItemWithLabel
                      value="ecommerce-designer"
                      id="ecommerce-designer"
                      label="E-commerce Designer"
                    />
                    
                    <RadioGroupItemWithLabel
                      value="gaming-designer"
                      id="gaming-designer"
                      label="Gaming Designer"
                    />
                    
                    <RadioGroupItemWithLabel
                      value="fitness-app-designer"
                      id="fitness-app-designer"
                      label="Fitness App Designer"
                    />
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
                                  <Textarea
                    className="min-h-[300px] resize-none"
                    value={`As a ${selectedRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}, 
I need to create a modern, user-friendly interface that follows current design trends and best practices.

Vibe & Atmosphere:
Think "mission control meets luxury yacht" - sleek, professional, but approachable
Dark elegance with subtle neon accents that suggest growth and profitability
Should feel empowering, like you're commanding a retail empire from the future
Calm confidence - serious business tool that doesn't stress you out

Visual Aesthetics:
Deep charcoal/navy base (#1a1a2e, #16213e) with rich depth
Electric accent colors: electric blue (#0066ff) for actions, emerald green (#00d4aa) for profits/positive metrics
Soft amber/gold (#ffa726) for warnings, muted red (#ff5252) for alerts
Glassmorphism cards floating over the dark canvas
Typography: Clean, modern sans-serif that screams "I mean business"

Emotional Experience:
Users should feel like skilled captains navigating their business ship
Every data point should feel valuable and actionable, not overwhelming
Smooth transitions that make managing inventory feel almost meditative
"This makes me look like a pro" confidence boost

Interactive Elements:
Hover states that reveal hidden insights with subtle glow effects
Cards that gently lift and reveal depth on interaction
Progress bars and charts that animate in smoothly, showing growth momentum
Buttons that feel substantial - like pressing actual premium switches

Specific Features to Include:
Sales analytics dashboard with glowing metric cards
Inventory management grid with search and filters
Quick action buttons for common tasks (Add Product, Process Order, View Reports)
Notification bell with subtle pulse animation
User avatar with dropdown menu

Overall Feeling: Users should think "Wow, this makes managing my store feel like I'm running a tech company" - professional, cutting-edge, but never intimidating. Dark theme that reduces eye strain during long work sessions while making every piece of data feel important and actionable.`}
                    onChange={(e) => {
                      // You can add state management here if needed
                      console.log('Prompt updated:', e.target.value);
                    }}
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
