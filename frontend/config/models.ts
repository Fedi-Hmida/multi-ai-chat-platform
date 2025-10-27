import { AIModel } from '@/types';

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and cost-effective GPT-4 model',
    maxTokens: 128000,
    icon: '⚡',
    color: 'from-blue-400 to-cyan-600',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Most intelligent Claude model with vision',
    maxTokens: 200000,
    icon: '🧠',
    color: 'from-purple-400 to-pink-600',
  },
  {
    id: 'gemma-2-9b-it',
    name: 'Google Gemma 2 9B',
    provider: 'gemini',
    description: 'Google\'s efficient and powerful open model',
    maxTokens: 8192,
    icon: '💎',
    color: 'from-emerald-400 to-teal-600',
  },
];

export const DEFAULT_CHAT_CONFIG = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export const getModelById = (id: string): AIModel | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): AIModel[] => {
  return AVAILABLE_MODELS.filter(model => model.provider === provider);
};
