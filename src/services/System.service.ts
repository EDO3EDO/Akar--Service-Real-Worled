import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, doc, setDoc, query, orderBy, serverTimestamp, increment, collectionData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Subscription } from 'rxjs';
import imageCompression from 'browser-image-compression';
import { ChatMessage } from '../interface/system';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  messages = signal<ChatMessage[]>([]);
  private messagesSub?: Subscription;

  listenToMessages(userUid: string) {
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = undefined;
    }

    const messagesRef = collection(this.firestore, `chats/${userUid}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    this.messagesSub = collectionData(q, { idField: 'id' }).subscribe({
      next: (msgs) => this.messages.set(msgs as ChatMessage[]),
      error: (err) => console.error('Error fetching messages:', err)
    });

    return () => {
      if (this.messagesSub) {
        this.messagesSub.unsubscribe();
        this.messagesSub = undefined;
      }
    };
  }

  async sendMessage(userUid: string, userName: string | null , text: string, mediaUrl?: string) {
    if (!text.trim() && !mediaUrl) return;

    const chatDocRef = doc(this.firestore, `chats/${userUid}`);
    const messagesRef = collection(this.firestore, `chats/${userUid}/messages`);

    await setDoc(chatDocRef, {
      userUid,
      userName,
      lastMessage: text || 'ملف مرفق',
      updatedAt: serverTimestamp(),
      unreadByAdminCount: increment(1)
    }, { merge: true });

    await addDoc(messagesRef, {
      senderId: userUid,
      userName,
      text,
      mediaUrl: mediaUrl || null,
      createdAt: serverTimestamp()
    });
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

    const filePath = `chat_media/${Date.now()}_${fileToUpload.name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadResult = await uploadBytes(storageRef, fileToUpload);
    return await getDownloadURL(uploadResult.ref);
  }
}
