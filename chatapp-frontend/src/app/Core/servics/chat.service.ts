import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message.model';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'https://localhost:7243/api';

  constructor(private http: HttpClient) {}

  getRooms() {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`);
  }

  createRoom(name: string, description?: string) {
    return this.http.post<Room>(`${this.apiUrl}/rooms`, { name, description });
  }

  getRoomMessages(roomId: number, page = 1) {
    return this.http.get<Message[]>(
      `${this.apiUrl}/messages/room/${roomId}?page=${page}&size=50`
    );
  }
}