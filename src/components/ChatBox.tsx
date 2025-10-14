import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatBoxProps {
  conversationId: string;
  onClose: () => void;
  otherParticipantName?: string;
  otherParticipantAvatar?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const ChatBox = ({ conversationId, onClose, otherParticipantName = "Conversation", otherParticipantAvatar }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (!initializingRef.current) {
      initializingRef.current = true;
      initChat();
    }
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
    console.log("🔵 InitChat démarré pour conversation:", conversationId);
    try {
      if (!conversationId) {
        console.error("❌ No conversation ID provided");
        toast.error("ID de conversation invalide");
        return;
      }

      console.log("🔵 Récupération de l'utilisateur");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ No user found");
        return;
      }

      console.log("✅ Utilisateur trouvé:", user.id);
      setCurrentUserId(user.id);
      
      console.log("🔵 Chargement des messages...");
      await fetchMessages();
      
      console.log("🔵 Marquage des messages comme lus...");
      await markMessagesAsRead(user.id);
      
      console.log("✅ Chat initialisé avec succès");
    } catch (error) {
      console.error("❌ Error initializing chat:", error);
      toast.error("Erreur lors du chargement du chat");
    } finally {
      console.log("🔵 Finally block - setLoading(false)");
      setLoading(false);
      initializingRef.current = false;
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages");
      throw error;
    }
    
    console.log("✅ Messages chargés:", data?.length || 0);
    setMessages(data || []);
  };

  const markMessagesAsRead = async (userId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);
    
    if (error) {
      console.error("⚠️ Error marking messages as read:", error);
      // Ne pas lancer l'erreur pour ne pas bloquer le chargement
    }
    
    console.log("✅ Messages marqués comme lus");
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

  return (
    <div className="flex flex-col h-full bg-background">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground text-sm">Chargement...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-card p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipantAvatar} alt={otherParticipantName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{otherParticipantName}</h3>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hidden md:flex"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-background">
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwnMessage
                          ? "bg-accent text-accent-foreground shadow-card"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-accent-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(message.created_at), "HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t border-border bg-card">
            <div className="flex gap-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Tapez votre message..."
                className="min-h-[44px] max-h-32 resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                disabled={sending}
              />
              <Button
                onClick={(e) => sendMessage(e)}
                disabled={!newMessage.trim() || sending}
                size="icon"
                className="h-[44px] w-[44px] bg-accent hover:bg-accent/90 text-accent-foreground shadow-card disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
