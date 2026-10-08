import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, doc, query, orderBy, serverTimestamp, updateDoc, collectionData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Subscription } from 'rxjs';
import imageCompression from 'browser-image-compression';
import { AdminChatMessage, UserChatSummary } from '../interface/SystemAdmin';

@Injectable({ providedIn: 'root' })
export class AdminChatService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  chatsList = signal<UserChatSummary[]>([]);
  activeMessages = signal<AdminChatMessage[]>([]);
  selectedUserUid = signal<string | null>(null);

  private chatsSub?: Subscription;
  private messagesSub?: Subscription;

  listenToAllChats() {
    if (this.chatsSub) {
      this.chatsSub.unsubscribe();
      this.chatsSub = undefined;
    }

    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));

    this.chatsSub = collectionData(q, { idField: 'userUid' }).subscribe({
      next: (chats) => this.chatsList.set(chats as UserChatSummary[]),
      error: (err) => console.error('Error fetching chats:', err)
    });

    return () => {
      if (this.chatsSub) {
        this.chatsSub.unsubscribe();
        this.chatsSub = undefined;
      }
    };
  }

  listenToUserMessages(userUid: string) {
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = undefined;
    }

    this.selectedUserUid.set(userUid);
    const messagesRef = collection(this.firestore, `chats/${userUid}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    this.messagesSub = collectionData(q, { idField: 'id' }).subscribe({
      next: (msgs) => this.activeMessages.set(msgs as AdminChatMessage[]),
      error: (err) => console.error('Error fetching messages:', err)
    });

    return () => {
      if (this.messagesSub) {
        this.messagesSub.unsubscribe();
        this.messagesSub = undefined;
      }
    };
  }

  async sendAdminMessage(adminId: string, adminName: string, text: string, mediaUrl?: string) {
    const userUid = this.selectedUserUid();
    if (!userUid || (!text.trim() && !mediaUrl)) return;

    const chatDocRef = doc(this.firestore, `chats/${userUid}`);
    const messagesRef = collection(this.firestore, `chats/${userUid}/messages`);

    await updateDoc(chatDocRef, {
      lastMessage: text || 'ملف مرفق',
      updatedAt: serverTimestamp()
    });

    await addDoc(messagesRef, {
      senderId: adminId,
      senderName: adminName,
      text,
      mediaUrl: mediaUrl || null,
      createdAt: serverTimestamp(),
      isAdminResponse: true
    });
  }

  async markAsRead(userUid: string) {
    const chatDocRef = doc(this.firestore, `chats/${userUid}`);
    await updateDoc(chatDocRef, { unreadByAdminCount: 0 });
  }

  async uploadMedia(file: File): Promise<string> {
    let fileToUpload = file;

    if (file.type.startsWith('image/')) {
      try {
        fileToUpload = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true });
      } catch (error) {
        console.warn('Compression error:', error);
      }
    }

    const filePath = `chat_media/admin_${Date.now()}_${fileToUpload.name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadResult = await uploadBytes(storageRef, fileToUpload);
    return await getDownloadURL(uploadResult.ref);
  }
}
