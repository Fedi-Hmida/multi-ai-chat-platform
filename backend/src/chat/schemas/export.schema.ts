import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExportDocument = Export & Document;

@Schema({ timestamps: true })
export class Export {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: false })
  chatId?: Types.ObjectId;

  @Prop({ required: true, enum: ['pdf', 'markdown', 'json', 'text'] })
  format: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: false })
  model?: string;

  @Prop({ required: false })
  responsePreview?: string; // First 200 chars for reference

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ExportSchema = SchemaFactory.createForClass(Export);
