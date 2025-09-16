import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Trash2, Image, HardDrive, Clock } from 'lucide-react';
import { imageCacheService, CachedImage } from '../services/imageCache';

interface ImageCacheManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageCacheManager: React.FC<ImageCacheManagerProps> = ({
  open,
  onOpenChange,
}) => {
  const [cachedImages, setCachedImages] = useState<CachedImage[]>([]);
  const [cacheSize, setCacheSize] = useState({ count: 0, totalSize: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCacheData();
    }
  }, [open]);

  const loadCacheData = async () => {
    setIsLoading(true);
    try {
      const [images, size] = await Promise.all([
        imageCacheService.getAllCachedImages(),
        imageCacheService.getCacheSize()
      ]);
      setCachedImages(images);
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to load cache data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      await imageCacheService.removeCachedImage(imageId);
      await loadCacheData(); // Refresh the list
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await imageCacheService.clearAllCache();
      await loadCacheData(); // Refresh the list
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Image Cache Manager
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Cache Statistics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Images:</span>
                <span className="ml-2">{cacheSize.count}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Size:</span>
                <span className="ml-2">{formatFileSize(cacheSize.totalSize)}</span>
              </div>
            </div>
          </div>

          {/* Images List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                Loading cached images...
              </div>
            ) : cachedImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No cached images found</p>
                <p className="text-sm">Upload some images to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cachedImages.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={image.dataUrl}
                        alt={image.fileName}
                        className="w-12 h-12 object-cover rounded border border-gray-300"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {image.fileName}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>{formatFileSize(image.fileSize)}</span>
                          <span>{image.fileType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(image.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(image.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={cachedImages.length === 0}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Cache
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCacheManager;
