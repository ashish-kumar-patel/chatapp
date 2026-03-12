import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
 standalone: true,
  imports: [
    CommonModule,
    FormsModule   // ✅ add this — fixes [(ngModel)]
  ],
  templateUrl: './message-input.html',
  styleUrl: './message-input.scss',
})
export class MessageInput {
 @Input() disabled = false;
  @Input() placeholder = 'Type a message...';
  @Output() messageSent = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();

  messageText = '';

  send() {
    if (this.messageText.trim() && !this.disabled) {
      this.messageSent.emit(this.messageText.trim());
      this.messageText = '';
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  onInput() {
    this.typing.emit();
  }
}
