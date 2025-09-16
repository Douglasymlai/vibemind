// API service for communicating with the FastAPI backend

const API_BASE_URL = 'http://localhost:8000/api';

export interface Profile {
  name: string;
  description: string;
  analysis_steps: string[];
  report_template: string;
  template_mapping: { [key: string]: string };
  summary_text: string;
}

export interface AnalysisRequest {
  image_url?: string;
  image_base64?: string;
  image_filename?: string;
  message: string;
  profile_key?: string;
  api_key: string;
}

export interface AnalysisResult {
  status: string;
  structured_result: any;
  markdown_report?: string;
  summarized_report?: string;
  files?: {
    original_report: string;
    summarized_report: string;
  };
}

class ApiService {
  private getApiKey(): string {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set your API key first.');
    }
    return apiKey;
  }

  async setApiKey(apiKey: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/set-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: apiKey }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to set API key');
    }

    return response.json();
  }

  async getProfiles(): Promise<{ [key: string]: Profile }> {
    const response = await fetch(`${API_BASE_URL}/profiles`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch profiles');
    }

    const data = await response.json();
    return data.profiles;
  }

  async createProfile(profile: Profile): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create profile');
    }

    return response.json();
  }

  async updateProfile(profileKey: string, profile: Profile): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/profiles/${profileKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
  }

  async deleteProfile(profileKey: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/profiles/${profileKey}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete profile');
    }

    return response.json();
  }

  async analyzeImage(request: AnalysisRequest): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  }

  async analyzeUploadedImage(
    file: File,
    message: string,
    profileKey?: string
  ): Promise<AnalysisResult> {
    const apiKey = this.getApiKey();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message);
    formData.append('api_key', apiKey);
    
    if (profileKey) {
      formData.append('profile_key', profileKey);
    }

    const response = await fetch(`${API_BASE_URL}/analyze-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  }

  async analyzeCachedImage(
    imageBase64: string,
    filename: string,
    message: string,
    profileKey?: string
  ): Promise<AnalysisResult> {
    const apiKey = this.getApiKey();

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        image_filename: filename,
        message,
        profile_key: profileKey,
        api_key: apiKey
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
