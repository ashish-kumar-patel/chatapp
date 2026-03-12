import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Room } from '../../../Core/models/room.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule   // ✅ add this — fixes [(ngModel)]
  ],
  templateUrl: './room-list.html',
  styleUrl: './room-list.scss',
})
export class RoomList {

 @Input() rooms: Room[] = [];
  @Input() selectedRoom: Room | null = null;
  @Output() roomSelected = new EventEmitter<Room>();
  @Output() roomCreated = new EventEmitter<string>();

  showCreateForm = false;
  newRoomName = '';

  selectRoom(room: Room) {
    this.roomSelected.emit(room);
  }

  createRoom() {
    if (this.newRoomName.trim()) {
      this.roomCreated.emit(this.newRoomName.trim());
      this.newRoomName = '';
      this.showCreateForm = false;
    }
  }
}
