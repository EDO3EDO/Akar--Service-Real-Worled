import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemService } from '../../services/System.service';
import { Auth } from '@angular/fire/auth';
import { AuthanticationService } from '../../services/Authantication.service';
import { UserData } from '../../interface/UserData';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-system-chat',
  standalone: true,
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './system-chat.component.html',
  styleUrls: ['./system-chat.component.css']
})
export class SystemChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Input() isEmeded:boolean = true;

  systemService = inject(SystemService);
  private Auth = inject(Auth)
  private Authantication = inject(AuthanticationService)

  isOpen = signal<boolean>(false);
  newMessage = signal<string>('');
  selectedFile = signal<File | null>(null);
  isUploading = signal<boolean>(false);
  userData = signal<any>(null)

  currentUserId = this.Auth.currentUser!.uid;


  private unsubscribeListener?: () => void;

  constructor() {
    effect(() => {
      const msgs = this.systemService.messages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnInit() {


    if(this.isEmeded){
      this.isOpen.set(true)
    }



    this.unsubscribeListener = this.systemService.listenToMessages(this.currentUserId);
    this.Authantication.getUserData().subscribe({
      next: (data) => {
        if(data){
          this.userData.set(data)
        }
      }
    })
  }

  toggleChat() {
    if(this.isEmeded)return ;
    this.isOpen.update(val => !val);
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
    const senderName = this.userData()?.name

    if (!text && !file) return;

    let mediaUrl = '';

    if (file) {
      this.isUploading.set(true);
      try {
        mediaUrl = await this.systemService.uploadMedia(file);
      } catch (err) {
        console.error('Error uploading media:', err);
      } finally {
        this.selectedFile.set(null);
        this.isUploading.set(false);
      }
    }

    await this.systemService.sendMessage(
      this.currentUserId,
      senderName,
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
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
    }
  }
}
