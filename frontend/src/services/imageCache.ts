// Image caching service using browser's Cache API and IndexedDB fallback

interface CachedImage {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl: string;
  timestamp: number;
}

class ImageCacheService {
  private readonly CACHE_NAME = 'vibe-mind-images';
  private readonly DB_NAME = 'VibeMindDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'images';
  private readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private async fileToBase64(file: File): Promise<string> {
    const dataUrl = await this.fileToDataUrl(file);
    // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
    return dataUrl.split(',')[1];
  }

  async cacheImage(file: File): Promise<string> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    try {
      await this.initDB();
      
      const imageId = this.generateImageId();
      const dataUrl = await this.fileToDataUrl(file);

      const cachedImage: CachedImage = {
        id: imageId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dataUrl,
        timestamp: Date.now()
      };

      // Store in IndexedDB
      if (this.db) {
        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        await new Promise<void>((resolve, reject) => {
          const request = store.add(cachedImage);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      // Clean up old images
      this.cleanupOldImages();

      return imageId;
    } catch (error) {
      console.error('Failed to cache image:', error);
      throw error;
    }
  }

  async getCachedImage(imageId: string): Promise<CachedImage | null> {
    try {
      await this.initDB();
      
      if (!this.db) return null;

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise<CachedImage | null>((resolve, reject) => {
        const request = store.get(imageId);
        request.onsuccess = () => {
          const result = request.result;
          if (result && (Date.now() - result.timestamp) < this.MAX_CACHE_AGE) {
            resolve(result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cached image:', error);
      return null;
    }
  }

  async getImageAsBase64(imageId: string): Promise<string | null> {
    const cachedImage = await this.getCachedImage(imageId);
    if (!cachedImage) return null;

    // Convert data URL to base64
    return cachedImage.dataUrl.split(',')[1];
  }

  async getImageAsBlob(imageId: string): Promise<Blob | null> {
    const cachedImage = await this.getCachedImage(imageId);
    if (!cachedImage) return null;

    try {
      const response = await fetch(cachedImage.dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Failed to convert to blob:', error);
      return null;
    }
  }

  async removeCachedImage(imageId: string): Promise<void> {
    try {
      await this.initDB();
      
      if (!this.db) return;

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(imageId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to remove cached image:', error);
    }
  }

  async getAllCachedImages(): Promise<CachedImage[]> {
    try {
      await this.initDB();
      
      if (!this.db) return [];

      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise<CachedImage[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result || [];
          // Filter out expired images
          const validImages = results.filter(
            (img: CachedImage) => (Date.now() - img.timestamp) < this.MAX_CACHE_AGE
          );
          resolve(validImages);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get all cached images:', error);
      return [];
    }
  }

  private async cleanupOldImages(): Promise<void> {
    try {
      const allImages = await this.getAllCachedImages();
      const expiredImages = allImages.filter(
        img => (Date.now() - img.timestamp) >= this.MAX_CACHE_AGE
      );

      for (const img of expiredImages) {
        await this.removeCachedImage(img.id);
      }
    } catch (error) {
      console.error('Failed to cleanup old images:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      await this.initDB();
      
      if (!this.db) return;

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<{ count: number; totalSize: number }> {
    try {
      const allImages = await this.getAllCachedImages();
      const totalSize = allImages.reduce((sum, img) => sum + img.fileSize, 0);
      return { count: allImages.length, totalSize };
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return { count: 0, totalSize: 0 };
    }
  }
}

export const imageCacheService = new ImageCacheService();
export type { CachedImage };
