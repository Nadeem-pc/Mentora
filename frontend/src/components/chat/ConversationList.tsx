import { useEffect, useState } from "react";
import { chatService, Conversation } from "@/services/shared/chatService";
import { MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
    onSelectConversation: (conversation: Conversation) => void;
    selectedConversationId?: string;
}

export function ConversationList({
    onSelectConversation,
    selectedConversationId
}: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConversations = async () => {
            try {
                setLoading(true);
                const data = await chatService.getConversations();
                setConversations(data);
                setError(null);
            } catch (err) {
                setError("Failed to load conversations");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
        // Poll for new conversations every 5 seconds
        const interval = setInterval(loadConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 text-sm">
                {error}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>No conversations yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 overflow-y-auto">
            {conversations.map((conversation) => {
                const otherUser = conversation.clientId._id === localStorage.getItem("userId")
                    ? conversation.therapistId
                    : conversation.clientId;
                const unreadCount = conversation.clientId._id === localStorage.getItem("userId")
                    ? conversation.clientUnreadCount
                    : conversation.therapistUnreadCount;

                return (
                    <button
                        key={conversation._id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`w-full p-3 text-left rounded-lg transition-colors ${
                            selectedConversationId === conversation._id
                                ? "bg-blue-100 border-l-4 border-blue-500"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {otherUser.firstName} {otherUser.lastName}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">
                                    {conversation.lastMessage || "No messages yet"}
                                </p>
                            </div>
                            <div className="ml-2 flex flex-col items-end">
                                {conversation.lastMessageAt && (
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                            addSuffix: true
                                        })}
                                    </span>
                                )}
                                {unreadCount > 0 && (
                                    <span className="mt-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
