import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search } from "lucide-react";
import { toast } from "sonner";

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour accéder aux messages");
        navigate("/auth");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Mock conversations for now
  const conversations = [
    {
      id: "1",
      name: "Jean Dupont",
      avatar: "",
      lastMessage: "Bonjour, est-ce que le véhicule est toujours disponible ?",
      time: "Il y a 5 min",
      unread: 2,
    },
    {
      id: "2",
      name: "Marie Martin",
      avatar: "",
      lastMessage: "Merci pour les informations !",
      time: "Il y a 1h",
      unread: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communiquez avec les acheteurs et vendeurs
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Aucune conversation pour le moment
                </p>
                <Button variant="outline" onClick={() => navigate("/listings")}>
                  Découvrir des véhicules
                </Button>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conv) => (
              <Card
                key={conv.id}
                className="cursor-pointer hover:shadow-card transition-shadow"
                onClick={() => toast.info("Fonctionnalité de messagerie en développement")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback>
                        {conv.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold truncate">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conv.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Messages;
