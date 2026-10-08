export interface AdminChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  mediaUrl?: string;
  createdAt: any;
  isAdminResponse?: boolean;
}

export interface UserChatSummary {
  userUid: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  lastMessage: string;
  updatedAt: any;
  unreadByAdminCount: number;
  status?: 'active' | 'closed' | 'pending';
}

export interface SystemAdmin {
  adminId: string;
  adminName: string;
  activeChatUid?: string;
  allChats: UserChatSummary[];
  currentChatMessages: AdminChatMessage[];
}



