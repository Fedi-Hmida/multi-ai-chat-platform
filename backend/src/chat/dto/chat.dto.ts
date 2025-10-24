import { IsString, IsOptional, IsArray, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  model: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  conversationHistory?: any[];

  @IsOptional()
  config?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

export class ChatResponseDto {
  message: string;
  model: string;
  timestamp: string;
  tokensUsed?: number;
}

// New DTOs for chat history management
export class CreateChatDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class AddMessageDto {
  @IsEnum(['user', 'assistant'])
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  model?: string;
}

export class UpdateChatTitleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
