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

  if (loading) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex items-center justify-center shadow-elevated">
        <p className="text-muted-foreground">Chargement...</p>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] flex flex-col shadow-elevated rounded-2xl border-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">Messagerie</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground text-sm">
              Aucun message pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2">
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
                    <Avatar className={`h-7 w-7 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    {showAvatar && (
                      <span className="text-xs text-muted-foreground mt-1 px-1">
                        {format(new Date(message.created_at), "HH:mm", { locale: fr })}
                      </span>
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
      <form onSubmit={sendMessage} className="p-3 border-t flex items-end gap-2 bg-card rounded-b-2xl">
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
          className="min-h-[44px] max-h-[120px] resize-none rounded-3xl"
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={sending || !newMessage.trim()}
          className="rounded-full h-10 w-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatBox;
