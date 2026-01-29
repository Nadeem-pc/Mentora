import React, { useEffect, useRef, useState } from "react";
import { Bell, BellDot, Trash2, Check, Mail, Calendar, Sparkles, X } from "lucide-react";
import { notificationService } from "@/services/shared/notificationService";
import { getSocket } from "@/config/socket.config";
import type { INotification } from "@/types/dtos/notification.dto";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";

interface NotificationDropdownProps {
  // userRole?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
      const { notification, senderName } = data;

      // For client message notifications, personalize content with therapist name
      let content = notification.content;
      if (notification.type === "message" && senderName && user?.role === "client") {
        if (content.includes("Therapist")) {
          content = content.replace("Therapist", senderName);
        } else {
          content = `New message from ${senderName}: ${content}`;
        }
      }

      const enrichedNotification: INotification = {
        ...notification,
        content,
      };

      setNotifications((prev) => [enrichedNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification with personalized content when available
      toast.info(content);
    });

    return () => {
      socket.off("new_notification");
    };
  }, [socket, user]);

  // Lock page scroll when dropdown is open so only the dropdown content scrolls
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

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
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <Mail className="w-4 h-4" />;
      case "appointment":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "message":
        return "from-blue-500 to-teal-500";
      case "appointment":
        return "from-blue-600 to-teal-600";
      default:
        return "from-blue-400 to-teal-400";
    }
  };

  return (
    <>
      {/* Full-screen overlay to capture scroll and pointer events while dropdown is open */}
      {isOpen && (
        <div className="fixed inset-0 z-40" />
      )}

      <div ref={dropdownRef} className="relative z-50">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-teal-50 dark:hover:from-blue-950/30 dark:hover:to-teal-950/30 transition-all duration-300 group"
        title="Notifications"
      >
        <div className="relative">
          {unreadCount > 0 ? (
            <BellDot className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          )}
          
          {/* Unread Badge with Blue to Teal Gradient */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-full shadow-lg animate-bounce">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {/* Ripple Effect */}
        <span className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
      </button>

      {/* Dropdown Panel with Blue to Teal Gradient Theme */}
      {isOpen && (
        <div className="absolute -right-25 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Blue to Teal Gradient Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    Notifications
                  </h3>
                  <p className="text-blue-100 text-left text-xs">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors duration-200"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 rounded-2xl mb-3">
                  <Bell className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No notifications yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">We'll notify you when something arrives</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification, index) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={() => setHoveredId(notification._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`
                      relative mb-2 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group
                      ${notification.isRead
                        ? "bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        : "bg-gradient-to-r from-blue-50/50 to-teal-50/50 dark:from-blue-950/20 dark:to-teal-950/20 hover:from-blue-50 hover:to-teal-50 dark:hover:from-blue-950/30 dark:hover:to-teal-950/30"
                      }
                      ${hoveredId === notification._id ? "shadow-lg scale-[1.02] -translate-y-0.5" : "shadow-sm"}
                    `}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {/* Blue to Teal Gradient Border for Unread */}
                    {!notification.isRead && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{ padding: '1px' }}>
                        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl"></div>
                      </div>
                    )}

                    <div className="relative p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon with Blue to Teal Gradient */}
                        <div className={`
                          flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${getNotificationColor(notification.type)}
                          flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300
                        `}>
                          <div className="text-white">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                              {notification.type === "message" 
                                ? "New Message" 
                                : notification.type === "appointment"
                                ? "Appointment"
                                : notification.type}
                            </p>
                            {!notification.isRead && (
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full shadow-lg animate-pulse"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-left text-gray-700 dark:text-gray-300 leading-relaxed mb-2 line-clamp-2">
                            {notification.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {formatTime(notification.timestamp)}
                            </p>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              className={`
                                p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500 
                                transition-all duration-200 opacity-0 group-hover:opacity-100
                                ${hoveredId === notification._id ? "scale-100" : "scale-90"}
                              `}
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-950/20">
              <button 
                onClick={() => navigate("/notifications")}
                className="w-full py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center justify-center gap-2 group"
              >
                View all notifications
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )} */}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 100px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #2563eb, #14b8a6);
          border-radius: 100px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1d4ed8, #0d9488);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #1e40af, #0f766e);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #14b8a6);
        }

        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
      </div>
    </>
  );
};

export default NotificationDropdown;