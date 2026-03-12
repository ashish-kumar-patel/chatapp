export interface User {
  userId: number;
  username: string;
  email: string;
  avatarColor: string;
  token: string;
}

export interface OnlineUser {
  id: number;
  username: string;
  avatarColor: string;
}