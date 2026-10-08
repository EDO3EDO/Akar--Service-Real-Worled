export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  mediaUrl?: string;
  createdAt: any;
}

export interface ChatSession {
  userUid: string;
  userName: string;
  lastMessage: string;
  updatedAt: any;
  unreadByAdminCount: number;
}

export interface SystemConfig {
  chatRoomId: string;
  autoScroll: boolean;
  soundEnabled: boolean;
}

export interface System {
  currentUser: {
    uid: string;
    displayName: string;
  };
  config: SystemConfig;
  activeChat?: ChatSession;
}
