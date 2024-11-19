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
}
