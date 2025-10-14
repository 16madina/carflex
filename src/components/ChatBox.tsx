import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatBoxProps {
  conversationId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const ChatBox = ({ conversationId, onClose }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, [conversationId]);

  useEffect(() => {
    if (!currentUserId) return;
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = async () => {
    setLoading(true);
    try {
      if (!conversationId) {
        console.error("No conversation ID provided");
        toast.error("ID de conversation invalide");
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
      console.log("Fetching messages for conversation:", conversationId);
      await fetchMessages();
      console.log("Marking messages as read for user:", user.id);
      await markMessagesAsRead(user.id);
      console.log("Chat initialized successfully");
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Erreur lors du chargement du chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Erreur lors du chargement des messages");
        return;
      }
      
      console.log("Messages fetched:", data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error("Unexpected error in fetchMessages:", error);
    }
  };

  const markMessagesAsRead = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);
      
      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Unexpected error in markMessagesAsRead:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          
          // Mark as read if not sent by current user
          if (currentUserId && payload.new.sender_id !== currentUserId) {
            markMessagesAsRead(currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex items-center justify-center shadow-elevated">
        <p className="text-muted-foreground">Chargement...</p>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] h-[650px] flex flex-col shadow-2xl rounded-3xl border-0 bg-black/95 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-yellow-500/20">
            <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black">
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white text-base">Messagerie</h3>
            <p className="text-xs text-gray-400">En ligne</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-black">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500 text-sm">
              Aucun message pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar = index === messages.length - 1 || 
                messages[index + 1]?.sender_id !== message.sender_id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isOwn && (
                    <Avatar className={`h-8 w-8 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                      <AvatarFallback className="bg-gray-800 text-gray-400 border border-gray-700">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div
                      className={`rounded-3xl px-5 py-3 ${
                        isOwn
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-br-lg shadow-lg shadow-yellow-500/20"
                          : "bg-gray-900 text-white rounded-bl-lg border border-gray-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    {showAvatar && (
                      <div className={`flex items-center gap-1 mt-1.5 px-2 ${isOwn ? 'flex-row' : 'flex-row'}`}>
                        <span className="text-xs text-gray-500">
                          il y a {format(new Date(message.created_at), "HH:mm", { locale: fr })}
                        </span>
                        {isOwn && (
                          <span className="text-gray-500 text-xs">✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex items-end gap-3 bg-black/80 rounded-b-3xl">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          placeholder="Écrivez un message..."
          disabled={sending}
          className="min-h-[50px] max-h-[120px] resize-none rounded-3xl bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={sending || !newMessage.trim()}
          className="rounded-full h-12 w-12 flex-shrink-0 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatBox;
