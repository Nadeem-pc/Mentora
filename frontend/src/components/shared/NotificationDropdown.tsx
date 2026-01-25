import React, { useEffect, useRef, useState } from "react";
import { Bell, BellDot, Trash2 } from "lucide-react";
import { notificationService } from "@/services/shared/notificationService";
import { getSocket } from "@/config/socket.config";
import type { INotification } from "@/types/dtos/notification.dto";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NotificationDropdownProps {
  // userRole?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const socket = getSocket();
  const { user } = useAuth();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on("new_notification", (data: { notification: INotification; senderName: string }) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification with the content built by the backend
      toast.info(data.notification.content);
    });

    return () => {
      socket.off("new_notification");
    };
  }, [socket]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleNotificationClick = async (notification: INotification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      if (notification.type === "message") {
        // For messages, open the conversation with the specific user
        if (user?.role === "client") {
          // Client chatting with a therapist: therapistId is the sender of the notification
          navigate(`/client/chat/${notification.senderId}`);
        } else if (user?.role === "therapist") {
          // Therapist chatting with a client: open dashboard and preselect client via location state
          navigate("/therapist/chat", { state: { clientId: notification.senderId } });
        }
      } else if (notification.type === "appointment" && notification.relatedId) {
        if (user?.role === "therapist") {
          navigate(`/therapist/appointments/${notification.relatedId}`);
        } else if (user?.role === "client") {
          navigate(`/client/appointments/${notification.relatedId}`);
        }
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
      toast.error("Failed to process notification");
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellDot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      notification.isRead
                        ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        : "bg-blue-50 dark:bg-gray-700/50 hover:bg-blue-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.type === "message" 
                            ? "New Message" 
                            : notification.type === "appointment"
                            ? "Appointment"
                            : notification.type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(e, notification._id)
                          }
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {/* {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => navigate("/notifications")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View all notifications
              </button>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
