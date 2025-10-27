import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Comparison, ComparisonSchema } from './schemas/comparison.schema';
import { Export, ExportSchema } from './schemas/export.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Comparison.name, schema: ComparisonSchema },
      { name: Export.name, schema: ExportSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
