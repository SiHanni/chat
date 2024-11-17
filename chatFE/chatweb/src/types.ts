export interface User {
  id: number;
  username: string;
  email: string;
  profileImageUrl?: string;
}

export interface FriendRequest {
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
}
