import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ChatMessage extends Document {
  @Prop({ required: true })
  client_id: string;

  @Prop({ required: false })
  message?: string;

  @Prop({ required: true })
  sender_id: number;

  @Prop({ required: true })
  sender_email: string;

  @Prop({ required: true })
  sender_username: string;

  @Prop({ required: true })
  sender_profile_img: string;

  @Prop({ required: true })
  room_id: string;

  @Prop({ default: Date.now })
  timestamp?: Date;

  @Prop({ required: false })
  file_name?: string;

  @Prop({ required: false })
  file_path?: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
