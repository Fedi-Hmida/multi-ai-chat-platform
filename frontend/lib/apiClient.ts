import { ChatRequest, ChatResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Client Error:', error);
    
    // For development: return mock response if backend is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock response - backend not available');
      return {
        message: `This is a mock response from ${request.model}. Connect the backend API to get real AI responses.`,
        model: request.model,
        timestamp: new Date().toISOString(),
      };
    }
    
    throw error;
  }
}

export async function getAvailableModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw error;
  }
}

// Stream response (for future implementation)
export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}

// Model Comparison
export interface ComparisonRequest {
  prompt: string;
  models: string[];
}

export interface ComparisonResponse {
  model: string;
  text: string;
  responseTime?: number;
  error?: string;
}

export async function compareModels(request: ComparisonRequest, token: string): Promise<{ responses: ComparisonResponse[] }> {
  try {
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Comparison failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Model Comparison Error:', error);
    throw error;
  }
}

export async function getComparisonHistory(token: string): Promise<any[]> {
  try {
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/comparisons`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch comparison history:', error);
    throw error;
  }
}
