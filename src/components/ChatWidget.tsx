"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAlert } from "@/components/AlertProvider";
import { decryptMessage } from "@/lib/encryption";
import {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
} from "@/actions/messages";
import type { MessageWithSender } from "@/types/messages";
import { MessageCircle, X, Send, Minimize2, User, Loader2 } from "lucide-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Load conversation and messages when chat opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      loadConversation();
    }
  }, [isOpen]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    console.log(
      "Setting up real-time subscription for conversation:",
      conversationId
    );

    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log("Real-time message received:", payload);
          // Fetch the complete message with sender info
          const { data: newMessage } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles!messages_sender_id_fkey(id, full_name, role, avatar_url)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newMessage) {
            console.log("Adding message to state:", newMessage);
            setMessages((prev) => [...prev, newMessage]);

            // Mark as read if chat is open and message is from someone else
            if (
              isOpen &&
              !isMinimized &&
              newMessage.sender_id !== currentUserId
            ) {
              await markMessagesAsRead(conversationId);
            } else if (newMessage.sender_id !== currentUserId) {
              // Update unread count
              loadUnreadCount();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [conversationId, isOpen, isMinimized, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load unread count periodically
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const result = await getUnreadCount();
    if (result.success && result.data !== undefined) {
      setUnreadCount(result.data);
    }
  };

  const loadConversation = async () => {
    setLoading(true);
    try {
      const result = await getOrCreateConversation();
      if (result.success && result.data) {
        setConversationId(result.data.id);
        await loadMessages(result.data.id);
      } else {
        showAlert({
          type: "error",
          message: result.error || "Failed to load conversation",
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    const result = await getMessages(convId);
    if (result.success && result.data) {
      setMessages(result.data);
      // Mark messages as read
      await markMessagesAsRead(convId);
      setUnreadCount(0);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      const result = await sendMessage(conversationId, messageContent);
      if (!result.success) {
        // If failed, restore the message
        setNewMessage(messageContent);
        showAlert({
          type: "error",
          message: result.error || "Failed to send message",
          duration: 3000,
        });
      }
      // Don't need to manually add to messages array - real-time subscription will handle it
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (conversationId) {
      await markMessagesAsRead(conversationId);
      setUnreadCount(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_6px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),0_3px_8px_rgba(0,0,0,0.2)] transition-all z-50"
          style={{ background: "var(--primary)" }}
        >
          <MessageCircle
            className="w-6 h-6"
            style={{ color: "var(--bg-dark)" }}
          />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--error)", color: "#ffffff" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.4),0_2px_10px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden z-50 transition-all ${
            isMinimized ? "h-14" : "h-[32rem]"
          }`}
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{
              background: "var(--primary)",
              borderColor: "var(--border-muted)",
            }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle
                className="w-5 h-5"
                style={{ color: "var(--bg-dark)" }}
              />
              <h3
                className="font-semibold text-base"
                style={{ color: "var(--bg-dark)" }}
              >
                Support Chat
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="p-1 rounded hover:opacity-70 transition"
                style={{ color: "var(--bg-dark)" }}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 rounded hover:opacity-70 transition"
                style={{ color: "var(--bg-dark)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ background: "var(--bg)" }}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle
                      className="w-12 h-12 mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Start a conversation with our support team
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${
                          isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isOwn
                              ? "var(--primary-20)"
                              : "var(--bg-secondary)",
                          }}
                        >
                          <User
                            className="w-4 h-4"
                            style={{
                              color: isOwn
                                ? "var(--primary)"
                                : "var(--text-muted)",
                            }}
                          />
                        </div>
                        <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
                          <p
                            className="text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {isOwn
                              ? message.sender?.full_name || "You"
                              : "PSG Member"}
                          </p>
                          <div
                            className={`inline-block p-3 rounded-lg max-w-[80%] shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
                              isOwn ? "rounded-tr-none" : "rounded-tl-none"
                            }`}
                            style={{
                              background: isOwn
                                ? "var(--primary)"
                                : "var(--bg-light)",
                              color: isOwn ? "var(--bg-dark)" : "var(--text)",
                            }}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {conversationId
                                ? decryptMessage(
                                    message.content,
                                    conversationId
                                  )
                                : message.content}
                            </p>
                          </div>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                className="p-4 border-t"
                style={{
                  background: "var(--bg-light)",
                  borderColor: "var(--border-muted)",
                }}
              >
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-lg border resize-none focus:ring-2 focus:border-transparent outline-none text-sm"
                    style={{
                      background: "var(--bg)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    disabled={sending || loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending || loading}
                    className="px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.15)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    style={{
                      background: "var(--primary)",
                      color: "var(--bg-dark)",
                    }}
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
