import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  open,
  onOpenChange,
  onApiKeySet,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if API key is already stored
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setValidationStatus('success');
    }
  }, [open]);

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/set-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: key }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Invalid API key');
        return false;
      }
    } catch (error) {
      setErrorMessage('Failed to validate API key. Please check your connection.');
      return false;
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API key');
      setValidationStatus('error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setErrorMessage('OpenAI API keys should start with "sk-"');
      setValidationStatus('error');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setErrorMessage('');

    const isValid = await validateApiKey(apiKey);
    
    setIsValidating(false);

    if (isValid) {
      // Store API key in localStorage
      localStorage.setItem('openai_api_key', apiKey);
      setValidationStatus('success');
      onApiKeySet(apiKey);
      
      // Auto-close dialog after success
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } else {
      setValidationStatus('error');
    }
  };

  const handleClear = () => {
    setApiKey('');
    setValidationStatus('idle');
    setErrorMessage('');
    localStorage.removeItem('openai_api_key');
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Key className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (validationStatus) {
      case 'success':
        return 'border-green-300 focus:border-green-500';
      case 'error':
        return 'border-red-300 focus:border-red-500';
      default:
        return 'border-gray-300 focus:border-blue-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Key Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Enter your OpenAI API Key
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationStatus('idle');
                  setErrorMessage('');
                }}
                placeholder="sk-..."
                className={`pr-20 ${getStatusColor()}`}
                disabled={isValidating}
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                {getStatusIcon()}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={isValidating}
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {validationStatus === 'success' && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                API key validated successfully
              </p>
            )}
            
            {validationStatus === 'error' && errorMessage && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errorMessage}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              How to get your API key:
            </h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Visit <code className="bg-blue-100 px-1 rounded">platform.openai.com</code></li>
              <li>Sign in to your OpenAI account</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new secret key</li>
              <li>Copy and paste it here</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              <strong>Security Note:</strong> Your API key is stored locally in your browser 
              and is only sent to the backend for authentication. It's never stored on our servers.
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClear}
            disabled={isValidating}
            size="sm"
          >
            Clear
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isValidating || !apiKey.trim()}
            size="sm"
          >
            {isValidating ? 'Validating...' : 'Save & Validate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
