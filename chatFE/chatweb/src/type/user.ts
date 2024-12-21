export interface User {
  id: number;
  email: string;
  username: string;
  profile_img: string;
  last_login: string;
}

export interface FindFriend {
  email: string;
  profile_img: string;
  status_msg?: string;
  username: string;
}
