import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, User, ArrowLeft, ExternalLink, Flag, HandCoins, Check, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReportContentDialog from "@/components/ReportContentDialog";
import OfferDialog from "@/components/OfferDialog";
import { useCountry } from "@/contexts/CountryContext";

interface ChatBoxProps {
  conversationId: string;
  onClose: () => void;
  otherParticipantName?: string;
  otherParticipantAvatar?: string;
  listingId?: string;
  listingType?: 'sale' | 'rental';
  listingInfo?: string;
  listingPrice?: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type?: string | null;
  offer_amount?: number | null;
  offer_status?: string | null;
}

const ChatBox = ({ conversationId, onClose, otherParticipantName = "Conversation", otherParticipantAvatar, listingId, listingType, listingInfo, listingPrice }: ChatBoxProps) => {
  const { formatPrice } = useCountry();
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializingRef = useRef(false);
  const navigate = useNavigate();
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    if (!initializingRef.current) {
      initializingRef.current = true;
      initChat();
    }
  }, [conversationId]);

  useEffect(() => {
    if (!currentUserId) return;
    const cleanup = setupRealtimeSubscription();
    const presenceCleanup = setupPresenceTracking();
    return () => {
      cleanup();
      presenceCleanup();
    };
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

  const setupPresenceTracking = () => {
    // Get other participant ID from conversation
    const getOtherParticipantId = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single();
      
      if (data) {
        return data.participant1_id === currentUserId 
          ? data.participant2_id 
          : data.participant1_id;
      }
      return null;
    };

    getOtherParticipantId().then(otherUserId => {
      if (!otherUserId) return;

      const presenceChannel = supabase.channel(`presence-${conversationId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const isUserOnline = Object.values(state).some((presences: any) => 
            presences.some((presence: any) => presence.user_id === otherUserId)
          );
          setIsOnline(isUserOnline);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          const joined = newPresences.some((p: any) => p.user_id === otherUserId);
          if (joined) setIsOnline(true);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          const left = leftPresences.some((p: any) => p.user_id === otherUserId);
          if (left) setIsOnline(false);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && currentUserId) {
            await presenceChannel.track({
              user_id: currentUserId,
              online_at: new Date().toISOString(),
            });
          }
        });

      presenceChannelRef.current = presenceChannel;
    });

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
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

  const sendOffer = async (amount: number) => {
    if (!currentUserId) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: `Offre : ${formatPrice(amount)}`,
      message_type: "offer",
      offer_amount: amount,
      offer_status: "pending",
    });
    if (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de l'offre");
    } else {
      toast.success("Offre envoyée");
    }
  };

  const respondOffer = async (messageId: string, status: "accepted" | "rejected") => {
    const { error } = await supabase
      .from("messages")
      .update({ offer_status: status })
      .eq("id", messageId);
    if (error) {
      toast.error("Erreur");
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, offer_status: status } : m)));
    toast.success(status === "accepted" ? "Offre acceptée" : "Offre refusée");
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
          <div className="bg-card pt-[max(3.5rem,calc(env(safe-area-inset-top)+2rem))] pb-4 px-4 border-b border-border flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipantAvatar} alt={otherParticipantName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{otherParticipantName}</h3>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
              </div>
              <div className="flex items-center gap-1">
                <ReportContentDialog
                  contentType="conversation"
                  contentId={conversationId}
                  triggerVariant="ghost"
                  triggerSize="icon"
                  triggerIcon={<Flag className="h-4 w-4" />}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hidden md:flex"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Listing info link */}
            {listingId && listingType && listingInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const path = listingType === 'sale' ? `/listing/${listingId}` : `/rental/${listingId}`;
                  navigate(path);
                }}
                className="w-full justify-between gap-2 text-sm"
              >
                <span className="truncate font-medium text-accent">{listingInfo}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </Button>
            )}
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
          <div className="px-4 pt-4 pb-safe-or-4 border-t border-border bg-card flex-shrink-0">
            <form onSubmit={sendMessage} className="flex gap-3">
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
                type="submit"
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
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
