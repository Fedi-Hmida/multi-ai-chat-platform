export type ModelProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'cohere';

export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  maxTokens: number;
  icon: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ChatRequest {
  model: string;
  message: string;
  config?: Partial<ChatConfig>;
  conversationHistory?: Message[];
}

export interface ChatResponse {
  message: string;
  model: string;
  timestamp: string;
  tokensUsed?: number;
}

export interface ModelConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}
