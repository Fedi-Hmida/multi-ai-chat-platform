import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageDto, ChatResponseDto, CreateChatDto, AddMessageDto, UpdateChatTitleDto } from './dto/chat.dto';
import { CompareModelsDto } from './dto/comparison.dto';
import { ExportRequestDto, BatchExportRequestDto } from './dto/export.dto';
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

  // ==================== MODEL COMPARISON ENDPOINTS ====================

  /**
   * Compare multiple models with the same prompt
   * POST /api/chat/compare
   */
  @UseGuards(JwtAuthGuard)
  @Post('chat/compare')
  @HttpCode(HttpStatus.OK)
  async compareModels(@Request() req, @Body() compareDto: CompareModelsDto) {
    return this.chatService.compareModels(req.user.userId, compareDto);
  }

  /**
   * Get comparison history
   * GET /api/chat/comparisons
   */
  @UseGuards(JwtAuthGuard)
  @Get('chat/comparisons')
  async getComparisonHistory(@Request() req) {
    return this.chatService.getComparisonHistory(req.user.userId);
  }

  // ==================== EXPORT ENDPOINTS ====================

  /**
   * Export a single AI response
   * POST /api/chat/export
   */
  @UseGuards(JwtAuthGuard)
  @Post('chat/export')
  async exportResponse(
    @Request() req,
    @Body() exportDto: ExportRequestDto,
    @Res() res: Response,
  ) {
    const { buffer, fileName, mimeType } = await this.chatService.exportResponse(
      req.user.userId,
      exportDto,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  /**
   * Export entire chat conversation
   * POST /api/chat/export-chat
   */
  @UseGuards(JwtAuthGuard)
  @Post('chat/export-chat')
  async exportChat(
    @Request() req,
    @Body() batchExportDto: BatchExportRequestDto,
    @Res() res: Response,
  ) {
    const { buffer, fileName, mimeType } = await this.chatService.exportChat(
      req.user.userId,
      batchExportDto,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  /**
   * Get export history
   * GET /api/chat/exports
   */
  @UseGuards(JwtAuthGuard)
  @Get('chat/exports')
  async getExportHistory(@Request() req) {
    return this.chatService.getExportHistory(req.user.userId);
  }
}
