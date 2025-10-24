import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto, ChatResponseDto, CreateChatDto, AddMessageDto, UpdateChatTitleDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() chatDto: ChatMessageDto): Promise<ChatResponseDto> {
    return this.chatService.sendMessage(chatDto);
  }

  @Get('models')
  getAvailableModels() {
    return this.chatService.getAvailableModels();
  }

  // ==================== CHAT HISTORY ENDPOINTS ====================

  /**
   * Create a new chat session
   * POST /api/chats
   */
  @UseGuards(JwtAuthGuard)
  @Post('chats')
  async createChat(@Request() req, @Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(req.user.userId, createChatDto);
  }

  /**
   * Get all user's chats
   * GET /api/chats
   */
  @UseGuards(JwtAuthGuard)
  @Get('chats')
  async getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.userId);
  }

  /**
   * Get a specific chat with all messages
   * GET /api/chats/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get('chats/:id')
  async getChatById(@Request() req, @Param('id') chatId: string) {
    return this.chatService.getChatById(req.user.userId, chatId);
  }

  /**
   * Add a message to a chat
   * POST /api/chats/:id/messages
   */
  @UseGuards(JwtAuthGuard)
  @Post('chats/:id/messages')
  async addMessage(
    @Request() req,
    @Param('id') chatId: string,
    @Body() addMessageDto: AddMessageDto,
  ) {
    return this.chatService.addMessage(req.user.userId, chatId, addMessageDto);
  }

  /**
   * Update chat title
   * PUT /api/chats/:id/title
   */
  @UseGuards(JwtAuthGuard)
  @Put('chats/:id/title')
  async updateChatTitle(
    @Request() req,
    @Param('id') chatId: string,
    @Body() updateTitleDto: UpdateChatTitleDto,
  ) {
    return this.chatService.updateChatTitle(req.user.userId, chatId, updateTitleDto);
  }

  /**
   * Delete a chat
   * DELETE /api/chats/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete('chats/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChat(@Request() req, @Param('id') chatId: string) {
    await this.chatService.deleteChat(req.user.userId, chatId);
  }
}
