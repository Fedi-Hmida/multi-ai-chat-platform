import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import { ChatMessageDto, ChatResponseDto, CreateChatDto, AddMessageDto, UpdateChatTitleDto } from './dto/chat.dto';
import { CompareModelsDto, ComparisonResponseDto } from './dto/comparison.dto';
import { ExportRequestDto, ExportFormat, BatchExportRequestDto } from './dto/export.dto';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Comparison, ComparisonDocument } from './schemas/comparison.schema';
import { Export, ExportDocument } from './schemas/export.schema';

@Injectable()
export class ChatService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Comparison.name) private comparisonModel: Model<ComparisonDocument>,
    @InjectModel(Export.name) private exportModel: Model<ExportDocument>,
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
    } else if (model.startsWith('gemma-')) {
      return this.callGemma(model, message, conversationHistory, config);
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

      // Check API key format
      const usesProxy = apiKey.startsWith('sk-or-v1');
      const apiUrl = usesProxy 
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      
      // Format model name based on API type
      const apiModel = usesProxy ? `openai/${model}` : model;

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
              ...(usesProxy && { 'HTTP-Referer': 'http://localhost:3000' }),
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

      // Check API key format
      const usesProxy = apiKey.startsWith('sk-or-v1');
      
      if (usesProxy) {
        // Use proxy for Claude
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
      // Check API key format
      const usesProxy = apiKey.startsWith('sk-or-v1');
      
      if (usesProxy) {
        // Use proxy for Gemini
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

  private async callGemma(
    model: string,
    message: string,
    conversationHistory: any[] = [],
    config: any,
  ): Promise<ChatResponseDto> {
    const apiKey = this.configService.get<string>('GOOGLE_GEMMA_API_KEY');
    
    if (!apiKey) {
      throw new HttpException(
        'Google Gemma API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Build messages in standard chat format
      const messages = [
        ...(conversationHistory || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const apiModel = `google/${model}`;
      
      // Call API with standard chat completions format
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
    } catch (error) {
      console.error('Gemma API Error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.error?.message || 'Google Gemma API error',
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
        {
          id: 'gemma-2-9b-it',
          name: 'Google Gemma 2 9B',
          provider: 'gemini',
          enabled: !!this.configService.get<string>('GOOGLE_GEMMA_API_KEY'),
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

  // Model Comparison Feature
  async compareModels(
    userId: string,
    compareDto: CompareModelsDto,
  ): Promise<{ responses: ComparisonResponseDto[] }> {
    const { prompt, models } = compareDto;

    // Execute all model calls in parallel
    const promises = models.map(async (model) => {
      const startTime = Date.now();
      try {
        const response = await this.sendMessage({
          model,
          message: prompt,
          conversationHistory: [],
          config: {},
        });
        
        const responseTime = Date.now() - startTime;
        
        return {
          model,
          text: response.message,
          responseTime,
        } as ComparisonResponseDto;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
          model,
          text: '',
          responseTime,
          error: error.message || 'Failed to get response',
        } as ComparisonResponseDto;
      }
    });

    const responses = await Promise.all(promises);

    // Save comparison to database
    try {
      await this.comparisonModel.create({
        userId: new Types.ObjectId(userId),
        prompt,
        models,
        responses,
      });
    } catch (error) {
      console.error('Failed to save comparison:', error);
    }

    return { responses };
  }

  // Get user's comparison history
  async getComparisonHistory(userId: string, limit: number = 10) {
    return this.comparisonModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // ==================== EXPORT FUNCTIONALITY ====================

  /**
   * Generate export file based on format
   */
  async exportResponse(
    userId: string,
    exportDto: ExportRequestDto,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const { format, response, chatId, model, prompt, fileName } = exportDto;

    // Sanitize text to prevent injection
    const sanitizedResponse = this.sanitizeText(response);
    const sanitizedPrompt = prompt ? this.sanitizeText(prompt) : null;

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = `ai_response_${timestamp}`;
    const finalFileName = fileName || defaultFileName;

    let buffer: Buffer;
    let mimeType: string;
    let fullFileName: string;

    switch (format) {
      case ExportFormat.PDF:
        buffer = await this.generatePDF(sanitizedResponse, sanitizedPrompt, model);
        mimeType = 'application/pdf';
        fullFileName = `${finalFileName}.pdf`;
        break;

      case ExportFormat.MARKDOWN:
        buffer = this.generateMarkdown(sanitizedResponse, sanitizedPrompt, model);
        mimeType = 'text/markdown';
        fullFileName = `${finalFileName}.md`;
        break;

      case ExportFormat.JSON:
        buffer = this.generateJSON(sanitizedResponse, sanitizedPrompt, model, chatId);
        mimeType = 'application/json';
        fullFileName = `${finalFileName}.json`;
        break;

      case ExportFormat.TEXT:
        buffer = this.generateText(sanitizedResponse, sanitizedPrompt);
        mimeType = 'text/plain';
        fullFileName = `${finalFileName}.txt`;
        break;

      default:
        throw new HttpException('Invalid export format', HttpStatus.BAD_REQUEST);
    }

    // Log export to database
    try {
      await this.exportModel.create({
        userId: new Types.ObjectId(userId),
        chatId: chatId ? new Types.ObjectId(chatId) : undefined,
        format,
        fileName: fullFileName,
        model,
        responsePreview: sanitizedResponse.substring(0, 200),
      });
    } catch (error) {
      console.error('Failed to log export:', error);
    }

    return { buffer, fileName: fullFileName, mimeType };
  }

  /**
   * Export entire chat conversation
   */
  async exportChat(
    userId: string,
    batchExportDto: BatchExportRequestDto,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const { chatId, format, fileName } = batchExportDto;

    // Fetch chat from database
    const chat = await this.chatModel
      .findOne({ _id: new Types.ObjectId(chatId), userId: new Types.ObjectId(userId) })
      .exec();

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    // Build full conversation text
    let conversationText = `# ${chat.title}\n\n`;
    conversationText += `Chat ID: ${chatId}\n`;
    conversationText += `Created: ${new Date(chat.createdAt).toLocaleString()}\n\n`;
    conversationText += `---\n\n`;

    chat.messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
      conversationText += `## Message ${index + 1} - ${role}\n`;
      if (msg.model) conversationText += `Model: ${msg.model}\n`;
      conversationText += `\n${msg.content}\n\n`;
      conversationText += `---\n\n`;
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = `chat_${chat.title.substring(0, 20).replace(/\s+/g, '_')}_${timestamp}`;
    const finalFileName = fileName || defaultFileName;

    let buffer: Buffer;
    let mimeType: string;
    let fullFileName: string;

    switch (format) {
      case ExportFormat.PDF:
        buffer = await this.generateConversationPDF(chat);
        mimeType = 'application/pdf';
        fullFileName = `${finalFileName}.pdf`;
        break;

      case ExportFormat.MARKDOWN:
        buffer = Buffer.from(conversationText, 'utf-8');
        mimeType = 'text/markdown';
        fullFileName = `${finalFileName}.md`;
        break;

      case ExportFormat.JSON:
        buffer = Buffer.from(JSON.stringify(chat, null, 2), 'utf-8');
        mimeType = 'application/json';
        fullFileName = `${finalFileName}.json`;
        break;

      case ExportFormat.TEXT:
        buffer = Buffer.from(conversationText.replace(/#+\s/g, '').replace(/---/g, ''), 'utf-8');
        mimeType = 'text/plain';
        fullFileName = `${finalFileName}.txt`;
        break;

      default:
        throw new HttpException('Invalid export format', HttpStatus.BAD_REQUEST);
    }

    // Log export
    try {
      await this.exportModel.create({
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
        format,
        fileName: fullFileName,
        responsePreview: `Full conversation: ${chat.messages.length} messages`,
      });
    } catch (error) {
      console.error('Failed to log batch export:', error);
    }

    return { buffer, fileName: fullFileName, mimeType };
  }

  /**
   * Generate PDF from response
   */
  private async generatePDF(response: string, prompt: string | null, model?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('AI Response Export', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      if (model) {
        doc.text(`Model: ${model}`, { align: 'center' });
      }
      doc.moveDown(2);

      // Prompt section
      if (prompt) {
        doc.fontSize(14).font('Helvetica-Bold').text('Original Prompt:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(prompt, {
          align: 'left',
          width: 500,
        });
        doc.moveDown(2);
      }

      // Response section
      doc.fontSize(14).font('Helvetica-Bold').text('AI Response:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(response, {
        align: 'left',
        width: 500,
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text('---', { align: 'center' });
      doc.text('Generated by Multi-AI Chat Platform', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Generate PDF from full conversation
   */
  private async generateConversationPDF(chat: ChatDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text(chat.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Created: ${new Date(chat.createdAt).toLocaleString()}`, { align: 'center' });
      doc.text(`Exported: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Messages
      chat.messages.forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
        
        doc.fontSize(12).font('Helvetica-Bold').text(`${role}`, { continued: true });
        if (msg.model) {
          doc.font('Helvetica').fontSize(10).text(` (${msg.model})`, { continued: false });
        } else {
          doc.text('');
        }
        
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(msg.content, {
          align: 'left',
          width: 500,
        });
        doc.moveDown(1.5);

        // Add page break if needed
        if (doc.y > 700 && index < chat.messages.length - 1) {
          doc.addPage();
        }
      });

      // Footer
      doc.fontSize(8).text('---', { align: 'center' });
      doc.text('Generated by Multi-AI Chat Platform', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Generate Markdown format
   */
  private generateMarkdown(response: string, prompt: string | null, model?: string): Buffer {
    let markdown = '# AI Response Export\n\n';
    markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
    if (model) markdown += `**Model:** ${model}\n`;
    markdown += '\n---\n\n';

    if (prompt) {
      markdown += '## Original Prompt\n\n';
      markdown += `${prompt}\n\n`;
      markdown += '---\n\n';
    }

    markdown += '## AI Response\n\n';
    markdown += `${response}\n`;

    return Buffer.from(markdown, 'utf-8');
  }

  /**
   * Generate JSON format
   */
  private generateJSON(response: string, prompt: string | null, model?: string, chatId?: string): Buffer {
    const data = {
      exportedAt: new Date().toISOString(),
      model: model || 'unknown',
      chatId: chatId || null,
      prompt: prompt || null,
      response,
      metadata: {
        format: 'json',
        version: '1.0',
      },
    };

    return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Generate plain text format
   */
  private generateText(response: string, prompt: string | null): Buffer {
    let text = 'AI RESPONSE EXPORT\n';
    text += '='.repeat(50) + '\n\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;

    if (prompt) {
      text += 'ORIGINAL PROMPT:\n';
      text += '-'.repeat(50) + '\n';
      text += `${prompt}\n\n`;
    }

    text += 'AI RESPONSE:\n';
    text += '-'.repeat(50) + '\n';
    text += `${response}\n`;

    return Buffer.from(text, 'utf-8');
  }

  /**
   * Sanitize text to prevent injection attacks
   */
  private sanitizeText(text: string): string {
    // Remove null bytes and control characters
    return text
      .replace(/\0/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
  }

  /**
   * Get user's export history
   */
  async getExportHistory(userId: string, limit: number = 20) {
    return this.exportModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v')
      .exec();
  }
}

