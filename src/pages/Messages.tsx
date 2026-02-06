import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@/hooks/useConversation";
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

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id: string;
  listing_type: string;
  updated_at: string;
  participant1_profile?: Profile;
  participant2_profile?: Profile;
  listing?: {
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
  const [searchParams] = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const urlListingId = searchParams.get("listingId");
  const urlListingType = searchParams.get("listingType") as 'sale' | 'rental' || 'sale';
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Use the conversation hook to get or create conversation from URL params
  const { conversationId: urlConversationId, loading: conversationLoading } = useConversation(
    urlListingId || "",
    urlUserId || "",
    urlListingType
  );

  useEffect(() => {
    checkAuthAndFetchConversations();
  }, []);

  // Auto-select conversation when URL params are present
  useEffect(() => {
    if (urlConversationId && !conversationLoading) {
      setSelectedConversation(urlConversationId);
    }
  }, [urlConversationId, conversationLoading]);

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
          messages!inner (
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order("created_at", { foreignTable: "messages", ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erreur lors du chargement des conversations");
        setLoading(false);
        return;
      }

      // Récupérer les profils des participants et les listings
      const participantIds = new Set<string>();
      const saleListingIds: string[] = [];
      const rentalListingIds: string[] = [];
      
      data?.forEach(conv => {
        participantIds.add(conv.participant1_id);
        participantIds.add(conv.participant2_id);
        if (conv.listing_id) {
          if (conv.listing_type === 'sale') {
            saleListingIds.push(conv.listing_id);
          } else if (conv.listing_type === 'rental') {
            rentalListingIds.push(conv.listing_id);
          }
        }
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", Array.from(participantIds));

      // Fetch sale listings
      const { data: saleListings } = saleListingIds.length > 0 ? await supabase
        .from("sale_listings")
        .select("id, brand, model, images")
        .in("id", saleListingIds) : { data: [] };

      // Fetch rental listings
      const { data: rentalListings } = rentalListingIds.length > 0 ? await supabase
        .from("rental_listings")
        .select("id, brand, model, images")
        .in("id", rentalListingIds) : { data: [] };

      // Créer des maps
      const profilesMap = new Map(profiles?.map(p => [p.id, p] as const) || []);
      const saleListingsMap = new Map(saleListings?.map(l => [l.id, l] as const) || []);
      const rentalListingsMap = new Map(rentalListings?.map(l => [l.id, l] as const) || []);

      // Ajouter les profils et listings aux conversations
      const conversationsWithProfiles = data?.map(conv => {
        let listing = null;
        if (conv.listing_id) {
          if (conv.listing_type === 'sale') {
            listing = saleListingsMap.get(conv.listing_id);
          } else if (conv.listing_type === 'rental') {
            listing = rentalListingsMap.get(conv.listing_id);
          }
        }
        
        return {
          ...conv,
          participant1_profile: profilesMap.get(conv.participant1_id),
          participant2_profile: profilesMap.get(conv.participant2_id),
          listing,
        };
      }) || [];

      // Trier les conversations par date du dernier message (plus récent en premier)
      const sortedConversations = conversationsWithProfiles.sort((a, b) => {
        const aLastMessage = a.messages?.[0]; // Le premier car les messages sont triés DESC
        const bLastMessage = b.messages?.[0];
        
        if (!aLastMessage) return 1;
        if (!bLastMessage) return -1;
        
        return new Date(bLastMessage.created_at).getTime() - new Date(aLastMessage.created_at).getTime();
      });

      setConversations(sortedConversations as Conversation[]);
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
    <div className="flex flex-col h-screen bg-background">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Liste des conversations - Colonne gauche */}
        <div className={`
          ${selectedConversation ? 'hidden md:flex' : 'flex'} 
          flex-col w-full md:w-[380px] border-r border-border bg-card
        `}>
          {/* Header */}
          <div className="pt-20 px-4 pb-4 border-b border-border">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">
                  Aucune conversation
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vos messages apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {conversations.map((conv) => {
                  const otherParticipant = conv.participant1_id === currentUserId 
                    ? conv.participant2_profile 
                    : conv.participant1_profile;
                  
                  const lastMessage = conv.messages?.[0]; // Les messages sont triés DESC, le plus récent est en premier
                  const hasUnreadMessages = conv.messages?.some(
                    msg => !msg.is_read && msg.sender_id !== currentUserId
                  );

                  const participantName = otherParticipant 
                    ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                    : "Utilisateur";

                  const isSelected = selectedConversation === conv.id;

                  const listingImage = conv.listing?.images?.[0] || null;
                  const vehicleInfo = conv.listing 
                    ? `${conv.listing.brand} ${conv.listing.model}`
                    : "Annonce";

                  return (
                    <div
                      key={conv.id}
                      className={`
                        p-4 rounded-xl cursor-pointer transition-all
                        border bg-card shadow-sm
                        ${isSelected 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-border/50 hover:border-primary/30 hover:bg-accent/30 hover:shadow-md'}
                        ${hasUnreadMessages ? 'border-primary/50 bg-primary/5' : ''}
                      `}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipant?.avatar_url} alt={participantName} className="object-cover" />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <UserIcon className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          {hasUnreadMessages && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full border-2 border-card flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">
                                {conv.messages.filter(m => !m.is_read && m.sender_id !== currentUserId).length}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <h3 className={`font-semibold truncate ${hasUnreadMessages ? 'text-foreground' : ''}`}>
                              {participantName}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {lastMessage && format(new Date(lastMessage.created_at), "HH:mm", { locale: fr })}
                            </span>
                          </div>
                          
                          {/* Vehicle info */}
                          <div className="flex items-center gap-2 mb-1">
                            {listingImage && (
                              <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img 
                                  src={listingImage} 
                                  alt={vehicleInfo}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <p className="text-xs font-medium text-accent truncate">
                              {vehicleInfo}
                            </p>
                          </div>
                          
                          <p className={`text-sm truncate ${
                            hasUnreadMessages ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}>
                            {lastMessage?.sender_id === currentUserId && "Vous: "}
                            {lastMessage?.content || "Nouvelle conversation"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ChatBox - Colonne droite */}
        <div className={`flex-1 flex flex-col bg-background ${selectedConversation ? 'md:relative fixed inset-0 z-50 md:z-auto' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            (() => {
              const conv = conversations.find(c => c.id === selectedConversation);
              const otherParticipant = conv?.participant1_id === currentUserId 
                ? conv?.participant2_profile 
                : conv?.participant1_profile;
              const participantName = otherParticipant 
                ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                : "Utilisateur";
              
              return (
                <ChatBox 
                  conversationId={selectedConversation}
                  onClose={() => setSelectedConversation(null)}
                  otherParticipantName={participantName}
                  otherParticipantAvatar={otherParticipant?.avatar_url}
                  listingId={conv?.listing_id}
                  listingType={conv?.listing_type as 'sale' | 'rental'}
                  listingInfo={conv?.listing ? `${conv.listing.brand} ${conv.listing.model}` : undefined}
                />
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="h-20 w-20 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h2>
              <p className="text-muted-foreground max-w-md">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BottomNav uniquement sur mobile quand pas de conversation sélectionnée */}
      {!selectedConversation && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default Messages;
