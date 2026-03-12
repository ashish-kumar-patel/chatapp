import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Message } from '../../Core/models/message.model';
import { Room } from '../../Core/models/room.model';
import { OnlineUser } from '../../Core/models/user.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Core/servics/auth.service';
import { SignalRService } from '../../Core/servics/signalr.service';
import { ChatService } from '../../Core/servics/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



import { RoomList } from './room-list/room-list'; 
import { MessageList } from './message-list/message-list';
import { MessageInput } from './message-input/message-input';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule  ,
    RoomList,      // ✅ fixes app-room-list unknown element
    MessageList,   // ✅ fixes app-message-list unknown element
    MessageInput   // ✅ add this — fixes [(ngModel)]
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})


export class Chat implements OnInit, OnDestroy {
  rooms = signal<Room[]>([]);
  messages = signal<Message[]>([]);
  onlineUsers = signal<OnlineUser[]>([]);
  selectedRoom = signal<Room | null>(null);
  typingUsers = signal<string[]>([]);
  sidebarOpen = signal(true);

  private subs: Subscription[] = [];
  private typingTimer?: ReturnType<typeof setTimeout>;

  constructor(
    public auth: AuthService,
    public signalR: SignalRService,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    const token = this.auth.getToken()!;

    // Start SignalR connection
    await this.signalR.startConnection(token);

    // Load rooms
    this.loadRooms();

    // Subscribe to real-time events
    this.setupEventListeners();
  }

  loadRooms() {
    this.chatService.getRooms().subscribe(rooms => {
      this.rooms.set(rooms);
      // Auto-join first room
      if (rooms.length > 0 && !this.selectedRoom()) {
        this.selectRoom(rooms[0]);
      }
    });
  }

  async selectRoom(room: Room) {
    this.selectedRoom.set(room);
    this.messages.set([]);
    this.typingUsers.set([]);

    // Join the SignalR group
    await this.signalR.joinRoom(room.id);

    // Load message history from API
    this.chatService.getRoomMessages(room.id).subscribe(msgs => {
      this.messages.set(msgs);
    });
  }

  private setupEventListeners() {
    // New message received
    this.subs.push(
      this.signalR.messageReceived$.subscribe(msg => {
        if (msg.roomId === this.selectedRoom()?.id) {
          this.messages.update(msgs => [...msgs, msg]);
        }
      })
    );

    // Online users update
    this.subs.push(
      this.signalR.onlineUsers$.subscribe(users => {
        this.onlineUsers.set(users);
      })
    );

    this.subs.push(
      this.signalR.userOnline$.subscribe(data => {
        this.signalR.getOnlineUsers();
      })
    );

    this.subs.push(
      this.signalR.userOffline$.subscribe(data => {
        this.onlineUsers.update(users =>
          users.filter(u => u.id !== data.userId)
        );
      })
    );

    // Typing indicators
    this.subs.push(
      this.signalR.userTyping$.subscribe(data => {
        if (data.roomId !== this.selectedRoom()?.id) return;
        
        if (data.isTyping) {
          this.typingUsers.update(users =>
            users.includes(data.username) ? users : [...users, data.username]
          );
        } else {
          this.typingUsers.update(users =>
            users.filter(u => u !== data.username)
          );
        }
      })
    );
  }

  sendMessage(content: string) {
    if (!content.trim() || !this.selectedRoom()) return;
    this.signalR.sendMessage(content, this.selectedRoom()!.id);
    this.signalR.sendTyping(this.selectedRoom()!.id, false);
  }

  onTyping() {
    if (!this.selectedRoom()) return;
    this.signalR.sendTyping(this.selectedRoom()!.id, true);
    
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.signalR.sendTyping(this.selectedRoom()!.id, false);
    }, 2000);
  }

  createRoom(name: string) {
    this.chatService.createRoom(name).subscribe(() => this.loadRooms());
  }

  logout() {
    this.signalR.stopConnection();
    this.auth.logout();
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.signalR.stopConnection();
    clearTimeout(this.typingTimer);
  }
}
