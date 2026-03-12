import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Message } from '../models/message.model';
import { OnlineUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private hubUrl = 'https://localhost:7243/hubs/chat';

  // Subjects for different events
  messageReceived$ = new Subject<Message>();
  userOnline$ = new Subject<{ userId: number; username: string }>();
  userOffline$ = new Subject<{ userId: number; username: string }>();
  userTyping$ = new Subject<{ userId: number; username: string; isTyping: boolean; roomId: number }>();
  userJoinedRoom$ = new Subject<{ userId: number; roomId: number }>();
  onlineUsers$ = new Subject<OnlineUser[]>();

  // Connection state signal
  isConnected = signal(false);

  // Build and start SignalR connection
  startConnection(token: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        // Pass JWT token as query param (handled in Program.cs)
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()  // Auto reconnect on disconnection
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register event handlers
    this.registerEvents();

    return this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
        console.log('✅ SignalR Connected!');
        // Request online users list after connection
        this.getOnlineUsers();
      })
      .catch(err => {
        console.error('❌ SignalR Error:', err);
        this.isConnected.set(false);
      });
  }

  // Register all server → client event listeners
  private registerEvents() {
    this.hubConnection.on('ReceiveMessage', (msg: Message) => {
      this.messageReceived$.next(msg);
    });

    this.hubConnection.on('UserOnline', (data: any) => {
      this.userOnline$.next(data);
    });

    this.hubConnection.on('UserOffline', (data: any) => {
      this.userOffline$.next(data);
    });

    this.hubConnection.on('UserTyping', (data: any) => {
      this.userTyping$.next(data);
    });

    this.hubConnection.on('UserJoinedRoom', (data: any) => {
      this.userJoinedRoom$.next(data);
    });

    this.hubConnection.on('OnlineUsers', (users: OnlineUser[]) => {
      this.onlineUsers$.next(users);
    });

    // Handle reconnection
    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      console.log('🔄 SignalR Reconnected');
    });

    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
      console.log('🔴 SignalR Disconnected');
    });
  }

  // ── Client → Server Hub Invocations ──────────────────────

  joinRoom(roomId: number) {
    return this.hubConnection.invoke('JoinRoom', roomId);
  }

  leaveRoom(roomId: number) {
    return this.hubConnection.invoke('LeaveRoom', roomId);
  }

  sendMessage(content: string, roomId: number) {
    return this.hubConnection.invoke('SendMessage', { content, roomId });
  }

  sendTyping(roomId: number, isTyping: boolean) {
    return this.hubConnection.invoke('Typing', roomId, isTyping);
  }

  getOnlineUsers() {
    return this.hubConnection.invoke('GetOnlineUsers');
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.isConnected.set(false);
    }
  }
}