import { AfterViewChecked, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Message } from '../../../Core/models/message.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-list',
 standalone: true,
  imports: [
    CommonModule,
    FormsModule   // ✅ add this — fixes [(ngModel)]
  ],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})

export class MessageList implements AfterViewChecked, OnChanges {
  @Input() messages: Message[] = [];
  @Input() currentUserId = 0;
  
  @ViewChild('messageContainer') private container!: ElementRef;
  
  private shouldScroll = false;

  ngOnChanges() {
    this.shouldScroll = true;
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    try {
      this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
    } catch {}
  }

  isOwnMessage(msg: Message): boolean {
    return msg.senderId === this.currentUserId;
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  }

  showDateDivider(index: number): boolean {
    if (index === 0) return true;
    const curr = new Date(this.messages[index].sentAt);
    const prev = new Date(this.messages[index - 1].sentAt);
    return curr.toDateString() !== prev.toDateString();
  }
}