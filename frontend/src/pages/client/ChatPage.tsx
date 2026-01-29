import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { chatService } from "@/services/shared/chatService";
import type { ChatMessage, MediaAttachment } from "@/services/shared/chatService";
import { getSocket } from "@/config/socket.config";
import { useAuth } from "@/contexts/auth.context";
import { Smile, Send, Check, CheckCheck, ArrowLeft, Paperclip, X, Download } from "lucide-react";
import { clientTherapistService } from "@/services/client/clientTherapistService";
import { S3BucketUtil } from "@/utils/S3Bucket.util";
import profile_avatar from "@/assets/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_5247852-removebg-preview.png";
import NotificationDropdown from "@/components/shared/NotificationDropdown";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

const ClientChatPage: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [therapistName, setTherapistName] = useState<string>("Therapist");
  const [therapistAvatar, setTherapistAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!therapistId) return;
      const data = await chatService.getClientMessages(therapistId);
      setMessages(data);
    };
    loadMessages();
  }, [therapistId]);

  // Load therapist details and client profile for avatars/names
  useEffect(() => {
    const loadParticipants = async () => {
      if (!therapistId) return;
      try {
        const therapistRes = await clientTherapistService.getTherapistDetails(therapistId);
        const therapist = therapistRes?.data;
        if (therapist) {
          // Support both shapes: { firstName, lastName } and { name }
          const fullNameFromFields = `${therapist.firstName || ""} ${therapist.lastName || ""}`.trim();
          const fullName: string = fullNameFromFields || therapist.name || "Therapist";
          setTherapistName(fullName);

          // Support both { profileImg } and { image } as the stored key
          const imageKey: string | undefined = therapist.profileImg || therapist.image;
          if (imageKey) {
            const url = await S3BucketUtil.getPreSignedURL(imageKey);
            if (url) {
              setTherapistAvatar(url);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load chat participants", error);
      }
    };

    loadParticipants();
  }, [therapistId]);

  useEffect(() => {
    if (!therapistId || !user) return;
    const socket = getSocket();

    const clientId = user.id;
    
    socket.emit("join_room", { clientId, therapistId });

    const handleNewMessage = (message: ChatMessage) => {
      console.log('Client received new message:', message);
      if (
        message.clientId === clientId &&
        message.therapistId === therapistId
      ) {
        setMessages((prev) => [...prev, message]);

        // Client is currently viewing this chat; immediately mark therapist messages as read
        if (message.senderRole === 'therapist') {
          socket.emit('mark_messages_read', { clientId, therapistId });
        }
      }
    };

    const handleError = (error: { message: string }) => {
      console.error('Socket error:', error);
      alert(error.message);
    };

    const handleRoomJoined = (data: { room: string }) => {
      console.log('Client joined room:', data.room);
    };

    const handleMessagesRead = (payload: { clientId: string; therapistId: string; readerRole: 'client' | 'therapist' }) => {
      if (payload.clientId !== clientId || payload.therapistId !== therapistId) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (payload.readerRole === 'therapist' && m.senderRole === 'client') {
            return { ...m, readByTherapist: true };
          }
          if (payload.readerRole === 'client' && m.senderRole === 'therapist') {
            return { ...m, readByClient: true };
          }
          return m;
        })
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("error", handleError);
    socket.on("room_joined", handleRoomJoined);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("error", handleError);
      socket.off("room_joined", handleRoomJoined);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [therapistId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((!newMessage.trim() && attachments.length === 0) || !therapistId || !user) return;
    const socket = getSocket();
    const clientId = user.id;

    socket.emit("send_message", {
      clientId,
      therapistId,
      content: newMessage.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setNewMessage("");
    setAttachments([]);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Check file size (limit to 25MB for videos, 10MB for images, 5MB for other files)
      let maxSize = 5 * 1024 * 1024; // 5MB default
      let type: "image" | "video" | "file" = "file";
      
      if (file.type.startsWith("image/")) {
        type = "image";
        maxSize = 10 * 1024 * 1024; // 10MB for images
      } else if (file.type.startsWith("video/")) {
        type = "video";
        maxSize = 25 * 1024 * 1024; // 25MB for videos
      }

      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      console.log(`Loading file: ${file.name}, Size: ${file.size} bytes, Type: ${type}`);

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        console.log(`File loaded successfully: ${file.name}, URL length: ${url.length}`);

        const attachment: MediaAttachment = {
          type,
          url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        };

        setAttachments((prev) => [...prev, attachment]);
      };
      
      reader.onerror = () => {
        console.error(`Failed to read file: ${file.name}`);
        alert(`Failed to read file "${file.name}"`);
      };
      
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const formatMessageDate = (date: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const shouldShowDateSeparator = (currentMsg: ChatMessage, prevMsg: ChatMessage | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (!therapistId) {
    return <div className="p-4">Invalid therapist</div>;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with therapist info */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={therapistAvatar || profile_avatar}
              alt={therapistName}
              className="w-10 h-10 rounded-full object-cover border border-white/40 shadow-md"
            />
            <div className="flex">
              <h1 className="font-semibold text-lg">{therapistName}</h1>
            </div>
          </div>
          <div className="flex items-center">
            <NotificationDropdown />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-1">
          {messages.map((msg, index) => {
            const isClient = msg.senderRole === "client";
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDate = shouldShowDateSeparator(msg, prevMsg);

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm text-xs font-medium text-gray-600">
                      {formatMessageDate(msg.createdAt)}
                    </div>
                  </div>
                )}
                <div
                  className={`flex items-end mb-1 ${
                    isClient ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Therapist message: avatar on left */}
                  {!isClient && (
                    <img
                      src={therapistAvatar || profile_avatar}
                      alt={therapistName}
                      className="w-8 h-8 rounded-full object-cover mr-2 shadow"
                    />
                  )}

                  <div className="flex flex-col max-w-[75%] sm:max-w-md lg:max-w-lg">
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm shadow-md transition-all hover:shadow-lg ${
                        isClient
                          ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-md self-end"
                          : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                      }`}
                    >
                      {msg.content && <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                      
                      {/* Multimedia Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((attachment, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {attachment.type === "image" && (
                                <img
                                  src={attachment.url}
                                  alt={attachment.fileName || "Image"}
                                  className="max-w-xs max-h-64 rounded-lg"
                                />
                              )}
                              {attachment.type === "video" && (
                                <video
                                  src={attachment.url}
                                  controls
                                  className="max-w-xs max-h-64 rounded-lg"
                                />
                              )}
                              {attachment.type === "file" && (
                                <a
                                  href={attachment.url}
                                  download={attachment.fileName}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                    isClient
                                      ? "bg-blue-500/30 hover:bg-blue-500/50"
                                      : "bg-gray-200 hover:bg-gray-300"
                                  } transition-colors`}
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="text-xs truncate max-w-[150px]">
                                    {attachment.fileName || "Download"}
                                  </span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isClient ? 'text-blue-100' : 'text-gray-400'}`}>
                        <span className="text-[10px] font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        {isClient && (
                          <span className="flex items-center">
                            {msg.readByTherapist ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-blue-200" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto relative">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                autoFocusSearch={false}
              />
            </div>
          )}

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="relative bg-gray-100 rounded-lg p-2 flex items-center gap-2 group"
                >
                  {attachment.type === "image" && (
                    <img
                      src={attachment.url}
                      alt="preview"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  {attachment.type === "video" && (
                    <div className="w-12 h-12 rounded bg-gray-300 flex items-center justify-center text-xs font-semibold">
                      VID
                    </div>
                  )}
                  {attachment.type === "file" && (
                    <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                      FILE
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {attachment.fileName || "File"}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all flex-shrink-0"
            >
              <Smile className="w-6 h-6" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all flex-shrink-0"
            >
              <Paperclip className="w-6 h-6" />
            </button>
            
            <div className="flex-1 bg-gray-50 rounded-3xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <textarea
                className="w-full bg-transparent px-5 py-3 text-sm focus:outline-none resize-none max-h-32 min-h-[44px]"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '44px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!newMessage.trim() && attachments.length === 0}
              className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientChatPage;