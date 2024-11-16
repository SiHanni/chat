import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ChatMessage extends Document {
  @Prop({ required: true })
  client_id: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  sender_id: number;

  @Prop({ required: true })
  room_id: string;

  @Prop({ default: Date.now })
  timestamp?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
