import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminChatService } from '../../services/adminChat.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminChat.component.html',
  styleUrls: ['./adminChat.component.css']
})
export class AdminChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  adminChatService = inject(AdminChatService);
  private auth = inject(Auth);

  newMessage = signal<string>('');
  selectedFile = signal<File | null>(null);
  isUploading = signal<boolean>(false);

  adminId = this.auth.currentUser?.uid || '';
  adminName = 'Admin';

  private chatsUnsubscribe?: () => void;
  private messagesUnsubscribe?: () => void;

  constructor() {
    effect(() => {
      const msgs = this.adminChatService.activeMessages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnInit() {
    this.chatsUnsubscribe = this.adminChatService.listenToAllChats();
  }

  selectUserChat(userUid: string) {
    if (this.messagesUnsubscribe) {
      this.messagesUnsubscribe();
    }
    this.messagesUnsubscribe = this.adminChatService.listenToUserMessages(userUid);
    this.adminChatService.markAsRead(userUid);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  async send() {
    const text = this.newMessage().trim();
    const file = this.selectedFile();

    if (!text && !file) return;

    let mediaUrl = '';

    if (file) {
      this.isUploading.set(true);
      try {
        mediaUrl = await this.adminChatService.uploadMedia(file);
      } catch (err) {
        console.error('Error uploading admin media:', err);
      } finally {
        this.selectedFile.set(null);
        this.isUploading.set(false);
      }
    }

    await this.adminChatService.sendAdminMessage(
      this.adminId,
      this.adminName,
      text,
      mediaUrl
    );

    this.newMessage.set('');
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy() {
    if (this.chatsUnsubscribe) this.chatsUnsubscribe();
    if (this.messagesUnsubscribe) this.messagesUnsubscribe();
  }
}
