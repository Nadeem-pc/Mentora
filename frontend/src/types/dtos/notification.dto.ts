export interface INotification {
  _id: string;
  senderId: string;
  receiverId: string;
  type: "message" | "appointment" | "system";
  content: string;
  relatedId?: string;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: INotification | INotification[] | { unreadCount: number };
  message?: string;
}
