import React, { useEffect, useRef, useState } from "react";
import { chatService } from "@/services/shared/chatService";
import type { ChatMessage, TherapistConversation, MediaAttachment } from "@/services/shared/chatService";
import { getSocket } from "@/config/socket.config";
import { useAuth } from "@/contexts/auth.context";
import { Check, CheckCheck, Smile, Send, Search, Menu, X, Paperclip, Download } from "lucide-react";
import { S3BucketUtil } from "@/utils/S3Bucket.util";
import { useLocation } from "react-router-dom";

const TherapistChatDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<TherapistConversation[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const emojis = ["😊", "😂", "❤️", "👍", "🙏", "😢", "😅", "🎉", "💪", "🌟", "✨", "🔥", "💯", "👏", "🤗", "😍", "🥰", "😎", "🤔", "😌"];

  // If navigated from a notification with a preselected client, initialize that conversation
  useEffect(() => {
    const state = location.state as { clientId?: string } | null;
    if (state?.clientId) {
      setSelectedClientId(state.clientId);
    }
  }, [location.state]);

  useEffect(() => {
    const loadConversations = async () => {
      const data = await chatService.getTherapistConversations();

      const withResolvedAvatars: TherapistConversation[] = await Promise.all(
        data.map(async (conv) => {
          if (!conv.profileImg) return conv;
          try {
            const url = await S3BucketUtil.getPreSignedURL(conv.profileImg);
            return { ...conv, profileImg: url || conv.profileImg };
          } catch {
            return conv;
          }
        })
      );

      setConversations(withResolvedAvatars);
    };
    loadConversations();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedClientId) return;
      try {
        const data = await chatService.getTherapistMessages(selectedClientId);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    loadMessages();
  }, [selectedClientId]);

  useEffect(() => {
    if (!user || !selectedClientId) return;
    
    const socket = getSocket();
    const therapistId = user.id;

    socket.emit("join_room", {
      clientId: selectedClientId,
      therapistId: therapistId,
    });

    const handleNewMessage = (message: ChatMessage) => {
      console.log('New message received:', message);
      if (
        message.clientId === selectedClientId &&
        message.therapistId === therapistId
      ) {
        setMessages((prev) => [...prev, message]);

        if (message.senderRole === 'client') {
          socket.emit('mark_messages_read', { clientId: selectedClientId, therapistId });
        }
      }

      if (message.senderRole === "client") {
        setConversations(prev => prev.map(conv => {
          if (conv.clientId !== message.clientId) return conv;

          if (selectedClientId === message.clientId) {
            return { ...conv, unreadCount: conv.unreadCount || 0 };
          }
          const current = conv.unreadCount || 0;
          return { ...conv, unreadCount: current + 1 };
        }));
      }
    };

    const handleError = (error: { message: string }) => {
      console.error('Socket error:', error);
    };

    const handleRoomJoined = (data: { room: string }) => {
      console.log('Therapist joined room:', data.room);
    };

    const handleMessagesRead = (payload: { clientId: string; therapistId: string; readerRole: 'client' | 'therapist' }) => {
      if (!selectedClientId) return;
      if (payload.clientId !== selectedClientId || payload.therapistId !== therapistId) return;

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

      if (payload.readerRole === 'therapist') {
        setConversations(prev => prev.map(conv =>
          conv.clientId === payload.clientId
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
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
  }, [selectedClientId, user]);

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
    if ((!newMessage.trim() && attachments.length === 0) || !selectedClientId || !user) return;
    const socket = getSocket();

    socket.emit("send_message", {
      clientId: selectedClientId,
      therapistId: user.id,
      content: newMessage.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setNewMessage("");
    setAttachments([]);
    setShowEmojiPicker(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
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

  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.clientId === selectedClientId);

  const getClientInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex h-[90vh]  bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
      {/* Sidebar/Conversations List */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-30 w-80 h-full border-r bg-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}>
        
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Chats</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-200" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-emerald-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.clientId}
                onClick={() => {
                  setSelectedClientId(conv.clientId);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all ${
                  selectedClientId === conv.clientId 
                    ? "bg-gradient-to-r from-emerald-100 to-emerald-50 border-l-4 border-l-emerald-600" 
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden">
                    {conv.profileImg ? (
                      <img
                        src={conv.profileImg}
                        alt={conv.clientName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getClientInitials(conv.clientName)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {conv.clientName}
                      </div>
                      <div className="text-sm text-gray-600 truncate mt-0.5">
                        {conv.lastMessage}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                    {(conv.unreadCount ?? 0) > 0 ? (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold">
                          {conv.unreadCount && conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Messages Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedClientId ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/20">
                  {selectedConversation?.profileImg ? (
                    <img
                      src={selectedConversation.profileImg}
                      alt={selectedConversation.clientName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center font-semibold text-sm">
                      {selectedConversation ? getClientInitials(selectedConversation.clientName) : ""}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-semibold text-lg">{selectedConversation?.clientName}</h1>
                  <p className="text-xs text-emerald-100">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-emerald-50/30 to-white">
              <div className="max-w-4xl mx-auto space-y-1">
                {messages.map((msg, index) => {
                  const isTherapist = msg.senderRole === "therapist";
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
                          isTherapist ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isTherapist && (
                          <div className="mr-2 w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            {selectedConversation?.profileImg ? (
                              <img
                                src={selectedConversation.profileImg}
                                alt={selectedConversation.clientName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-[10px]">
                                {selectedConversation ? getClientInitials(selectedConversation.clientName) : ""}
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] sm:max-w-md lg:max-w-lg px-3 py-2 rounded-2xl text-sm shadow-md transition-all hover:shadow-lg ${
                            isTherapist
                              ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-md"
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
                                        isTherapist
                                          ? "bg-emerald-500/30 hover:bg-emerald-500/50"
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
                          
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isTherapist ? 'text-emerald-100' : 'text-gray-400'}`}>
                            <span className="text-[10px] font-medium">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                            {isTherapist && (
                              <span className="flex items-center">
                                {msg.readByClient ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                                )}
                              </span>
                            )}
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
                    className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 w-64 sm:w-80 z-10"
                  >
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
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
                          <div className="w-12 h-12 rounded bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-600">
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
                    className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all flex-shrink-0"
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
                    className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all flex-shrink-0"
                  >
                    <Paperclip className="w-6 h-6" />
                  </button>
                  
                  <div className="flex-1 bg-gray-50 rounded-3xl border-2 border-gray-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-transparent px-5 py-3 text-sm focus:outline-none resize-none max-h-32"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleTextareaChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={1}
                      style={{
                        minHeight: '44px'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() && attachments.length === 0}
                    className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-full hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-emerald-50/30 to-white">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mb-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Menu className="w-5 h-5 inline mr-2" />
              View Conversations
            </button>
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Conversation Selected</h3>
            <p className="text-gray-500 max-w-sm">
              Select a conversation from the sidebar to start chatting with your clients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistChatDashboard;