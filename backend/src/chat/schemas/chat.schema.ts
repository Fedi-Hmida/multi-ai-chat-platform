import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  model?: string; // Which AI model was used

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: 'New Chat' })
  title: string;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
