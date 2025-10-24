import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { ChatMessageDto, ChatResponseDto, CreateChatDto, AddMessageDto, UpdateChatTitleDto } from './dto/chat.dto';
import { Chat, ChatDocument } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

  async sendMessage(chatDto: ChatMessageDto): Promise<ChatResponseDto> {
    const { model, message, conversationHistory, config } = chatDto;

    // Route to appropriate AI provider
    if (model.startsWith('gpt-')) {
      return this.callOpenAI(model, message, conversationHistory, config);
    } else if (model.startsWith('claude-')) {
      return this.callAnthropic(model, message, conversationHistory, config);
    } else if (model.startsWith('gemini-')) {
      return this.callGemini(model, message, conversationHistory, config);
    } else if (model.startsWith('mistral-')) {
      return this.callMistral(model, message, conversationHistory, config);
    } else if (model.startsWith('command-')) {
      return this.callCohere(model, message, conversationHistory, config);
    } else {
      throw new HttpException(
        `Unsupported model: ${model}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async callOpenAI(
    model: string,
    message: string,
    conversationHistory: any[] = [],
    config: any,
  ): Promise<ChatResponseDto> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new HttpException(
        'OpenAI API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const messages = [
        ...(conversationHistory || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Check if using OpenRouter API key (starts with sk-or-v1)
      const isOpenRouter = apiKey.startsWith('sk-or-v1');
      const apiUrl = isOpenRouter 
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      
      // OpenRouter requires model in format: openai/gpt-4o-mini
      const apiModel = isOpenRouter ? `openai/${model}` : model;

      const response = await firstValueFrom(
        this.httpService.post(
          apiUrl,
          {
            model: apiModel,
            messages,
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens || 2048,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              ...(isOpenRouter && { 'HTTP-Referer': 'http://localhost:3000' }),
            },
          },
        ),
      );

      return {
        message: response.data.choices[0].message.content,
        model,
        timestamp: new Date().toISOString(),
        tokensUsed: response.data.usage?.total_tokens,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'OpenAI API error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callAnthropic(
    model: string,
    message: string,
    conversationHistory: any[] = [],
    config: any,
  ): Promise<ChatResponseDto> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      throw new HttpException(
        'Anthropic API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const messages = [
        ...(conversationHistory || []).map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Check if using OpenRouter API key
      const isOpenRouter = apiKey.startsWith('sk-or-v1');
      
      if (isOpenRouter) {
        // Use OpenRouter for Claude
        const apiModel = `anthropic/${model}`;
        const response = await firstValueFrom(
          this.httpService.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: apiModel,
              messages,
              max_tokens: config?.maxTokens || 2048,
              temperature: config?.temperature || 0.7,
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
              },
            },
          ),
        );

        return {
          message: response.data.choices[0].message.content,
          model,
          timestamp: new Date().toISOString(),
          tokensUsed: response.data.usage?.total_tokens,
        };
      } else {
        // Use direct Anthropic API
        const response = await firstValueFrom(
          this.httpService.post(
            'https://api.anthropic.com/v1/messages',
            {
              model,
              messages,
              max_tokens: config?.maxTokens || 2048,
              temperature: config?.temperature || 0.7,
            },
            {
              headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        return {
          message: response.data.content[0].text,
          model,
          timestamp: new Date().toISOString(),
          tokensUsed: response.data.usage?.total_tokens,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Anthropic API error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callGemini(
    model: string,
    message: string,
    conversationHistory: any[] = [],
    config: any,
  ): Promise<ChatResponseDto> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new HttpException(
        'Gemini API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Check if using OpenRouter API key
      const isOpenRouter = apiKey.startsWith('sk-or-v1');
      
      if (isOpenRouter) {
        // Use OpenRouter for Gemini
        const messages = [
          ...(conversationHistory || []).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

        const apiModel = `google/${model}`;
        const response = await firstValueFrom(
          this.httpService.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: apiModel,
              messages,
              temperature: config?.temperature || 0.7,
              max_tokens: config?.maxTokens || 2048,
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
              },
            },
          ),
        );

        return {
          message: response.data.choices[0].message.content,
          model,
          timestamp: new Date().toISOString(),
          tokensUsed: response.data.usage?.total_tokens,
        };
      } else {
        // Use direct Gemini API
        const contents = [
          ...(conversationHistory || []).map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const response = await firstValueFrom(
          this.httpService.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              contents,
              generationConfig: {
                temperature: config?.temperature || 0.7,
                maxOutputTokens: config?.maxTokens || 2048,
              },
            },
          ),
        );

        return {
          message: response.data.candidates[0].content.parts[0].text,
          model,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Gemini API error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callMistral(
    model: string,
    message: string,
    conversationHistory: any[] = [],
    config: any,
  ): Promise<ChatResponseDto> {
    const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
    
    if (!apiKey) {
      throw new HttpException(
        'Mistral API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const messages = [
        ...(conversationHistory || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.mistral.ai/v1/chat/completions',
          {
            model,
            messages,
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens || 2048,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        message: response.data.choices[0].message.content,
        model,
        timestamp: new Date().toISOString(),
        tokensUsed: response.data.usage?.total_tokens,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error?.message || 'Mistral API error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callCohere(
    model: string,
    message: string,
    conversationHistory: any[] = [],
    config: any,
  ): Promise<ChatResponseDto> {
    const apiKey = this.configService.get<string>('COHERE_API_KEY');
    
    if (!apiKey) {
      throw new HttpException(
        'Cohere API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const chatHistory = (conversationHistory || []).map((msg) => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.content,
      }));

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.cohere.ai/v1/chat',
          {
            model,
            message,
            chat_history: chatHistory,
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens || 2048,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        message: response.data.text,
        model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error || 'Cohere API error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getAvailableModels() {
    return {
      models: [
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          provider: 'openai',
          enabled: !!this.configService.get<string>('OPENAI_API_KEY'),
        },
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          enabled: !!this.configService.get<string>('ANTHROPIC_API_KEY'),
        },
      ],
    };
  }

  // ==================== CHAT HISTORY MANAGEMENT ====================

  /**
   * Create a new chat session for a user
   */
  async createChat(userId: string, createChatDto: CreateChatDto): Promise<Chat> {
    const newChat = new this.chatModel({
      userId: new Types.ObjectId(userId),
      title: createChatDto.title || `New Chat - ${new Date().toLocaleDateString()}`,
      messages: [],
    });
    return newChat.save();
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .select('-messages') // Don't load all messages, just metadata
      .exec();
  }

  /**
   * Get a single chat with all messages
   */
  async getChatById(userId: string, chatId: string): Promise<Chat> {
    const chat = await this.chatModel
      .findOne({
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    return chat;
  }

  /**
   * Add a message to a chat
   */
  async addMessage(
    userId: string,
    chatId: string,
    addMessageDto: AddMessageDto,
  ): Promise<Chat> {
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    chat.messages.push({
      role: addMessageDto.role,
      content: addMessageDto.content,
      model: addMessageDto.model,
      createdAt: new Date(),
    });

    // Auto-generate title from first user message
    if (chat.messages.length === 1 && addMessageDto.role === 'user') {
      chat.title = this.generateChatTitle(addMessageDto.content);
    }

    chat.updatedAt = new Date();
    return chat.save();
  }

  /**
   * Update chat title
   */
  async updateChatTitle(
    userId: string,
    chatId: string,
    updateTitleDto: UpdateChatTitleDto,
  ): Promise<Chat> {
    const chat = await this.chatModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
      },
      { title: updateTitleDto.title, updatedAt: new Date() },
      { new: true },
    );

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    return chat;
  }

  /**
   * Delete a chat
   */
  async deleteChat(userId: string, chatId: string): Promise<void> {
    const result = await this.chatModel.deleteOne({
      _id: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Generate a smart chat title from the first message
   */
  private generateChatTitle(firstMessage: string): string {
    // Take first 50 characters and clean up
    let title = firstMessage.substring(0, 50).trim();
    
    // Remove trailing incomplete words
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.substring(0, lastSpace);
    }
    
    // Add ellipsis if truncated
    if (firstMessage.length > 50) {
      title += '...';
    }
    
    return title || 'New Chat';
  }
}
