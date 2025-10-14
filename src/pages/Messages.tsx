import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import ChatBox from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id: string;
  updated_at: string;
  sale_listings: {
    brand: string;
    model: string;
    images: any;
  };
  messages: Array<{
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  }>;
}

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchConversations();
  }, []);

  const checkAuthAndFetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    setCurrentUserId(user.id);
    fetchConversations(user.id);
  };

  const fetchConversations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          sale_listings (
            brand,
            model,
            images
          ),
          messages (
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erreur lors du chargement des conversations");
      } else {
        setConversations(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Gérez vos conversations avec les acheteurs et vendeurs
          </p>
        </div>

        {conversations.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune conversation pour le moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vos conversations avec les vendeurs apparaîtront ici
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const listing = conv.sale_listings;
              const image = Array.isArray(listing?.images) && listing.images.length > 0 
                ? listing.images[0] 
                : null;
              
              const lastMessage = conv.messages?.[conv.messages.length - 1];
              const hasUnreadMessages = conv.messages?.some(
                msg => !msg.is_read && msg.sender_id !== currentUserId
              );

              return (
                <Card
                  key={conv.id}
                  className={`cursor-pointer hover:bg-accent/50 transition-smooth border-0 ${
                    hasUnreadMessages ? 'bg-accent/20' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          {image ? (
                            <img src={image} alt={`${listing.brand} ${listing.model}`} className="object-cover" />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <UserIcon className="h-7 w-7" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {hasUnreadMessages && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-semibold truncate ${hasUnreadMessages ? 'text-foreground' : ''}`}>
                            {listing?.brand} {listing?.model}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {lastMessage && format(new Date(lastMessage.created_at), "HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          hasUnreadMessages ? 'font-medium text-foreground' : 'text-muted-foreground'
                        }`}>
                          {lastMessage?.content || "Nouvelle conversation"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

      {selectedConversation && (
        <ChatBox 
          conversationId={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
};

export default Messages;
