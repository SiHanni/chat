export interface UserChatRoom {
  id: number;
  is_active: boolean;
  joined_at: Date | null; // 참가 일시
  unreadMessageCount: number;
  chatting: {
    id: number;
    created_at: Date;
    name: string;
    mongoRoom_id: string | null;
    room_type: 'open' | 'private';
    owner: {
      id: number;
      created_at: Date;
      updated_at: Date | null;
      username: string;
      email: string;
      profile_img: string;
      status_msg: string;
      is_active: boolean;
      phone_number: string | null;
      is_verified: boolean;
      gender: 'male' | 'female';
      last_login: Date;
    };
  };
  user: {
    id: number;
    created_at: Date;
    updated_at: Date | null;
    username: string;
    email: string;
    profile_img: string;
    status_msg: string;
    is_active: boolean;
    phone_number: string | null;
    is_verified: boolean;
    gender: 'male' | 'female';
    last_login: Date;
  };
}

export interface ChatRoom {
  id: number;
  created_at: string;
  name: string;
  mongoRoom_id: string;
  room_type: string;
  owner?: any;
}
