import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ComparisonDocument = Comparison & Document;

@Schema({ timestamps: true })
export class Comparison {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  prompt: string;

  @Prop({ type: [String], required: true })
  models: string[];

  @Prop({
    type: [
      {
        model: String,
        text: String,
        responseTime: Number,
        error: String,
      },
    ],
    required: true,
  })
  responses: {
    model: string;
    text: string;
    responseTime?: number;
    error?: string;
  }[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ComparisonSchema = SchemaFactory.createForClass(Comparison);
