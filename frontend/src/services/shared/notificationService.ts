import { axiosInstance } from "@/config/axios.config";
import type { INotification } from "@/types/dtos/notification.dto";

const API_BASE = "/api/notifications";

export const notificationService = {
  getNotifications: async (limit: number = 50): Promise<INotification[]> => {
    try {
      const response = await axiosInstance.get(`${API_BASE}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get(`${API_BASE}/unread-count`);
      return response.data.data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  },

  markAsRead: async (notificationId: string): Promise<INotification> => {
    try {
      const response = await axiosInstance.patch(
        `${API_BASE}/${notificationId}/read`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await axiosInstance.patch(`${API_BASE}/mark-all-read`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE}/${notificationId}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};