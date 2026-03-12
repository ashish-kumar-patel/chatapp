export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  avatarColor: string;
  roomId: number;
  roomName: string;
  sentAt: string;
  isEdited: boolean;
}

export interface SendMessageDTO {
  content: string;
  roomId: number;
}