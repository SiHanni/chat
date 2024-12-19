export class ChatMessageDto {
  room_id: number;
  sender_id: number;
  sender_email: string;
  sender_username: string;
  sender_profile_img: string;
  message: string;
}

export class ChatFileDto {
  room_id: number;
  sender_id: number;
  sender_email: string;
  sender_username: string;
  sender_profile_img: string;
  file_name: string;
  file_data: string;
  content_type: string;
}
/** 추후 위 두개는 아래 것으로 통합 */
export class MessageDto {
  room_id: number;
  sender_id: number;
  sender_email: string;
  sender_username: string;
  sender_profile_img: string;
  message?: string;
  file_name?: string;
  file_data?: string;
}
