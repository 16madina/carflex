import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, MessageSquare, TrendingUp, Car, DollarSign, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCountry } from "@/contexts/CountryContext";

interface DashboardStats {
  totalListings: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  saleListings: number;
  rentalListings: number;
  premiumListings: number;
}

interface RecentListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: 'sale' | 'rental';
  price?: number;
  price_per_day?: number;
  created_at: string;
  images?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0,
    totalFavorites: 0,
    saleListings: 0,
    rentalListings: 0,
    premiumListings: 0,
  });
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      setUser(user);
      await fetchDashboardData(user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    // Fetch sale listings
    const { data: saleData, count: saleCount } = await supabase
      .from("sale_listings")
      .select("*", { count: 'exact' })
      .eq("seller_id", userId);

    // Fetch rental listings
    const { data: rentalData, count: rentalCount } = await supabase
      .from("rental_listings")
      .select("*", { count: 'exact' })
      .eq("owner_id", userId);

    // Fetch premium listings
    const { count: premiumCount } = await supabase
      .from("premium_listings")
      .select("*", { count: 'exact' })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Fetch favorites on user's listings
    const userListingIds = [
      ...(saleData || []).map(l => l.id),
      ...(rentalData || []).map(l => l.id)
    ];

    const { count: favoritesCount } = await supabase
      .from("favorites")
      .select("*", { count: 'exact' })
      .in("listing_id", userListingIds);

    // Fetch messages
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    const conversationIds = (conversations || []).map(c => c.id);
    const { count: messagesCount } = await supabase
      .from("messages")
      .select("*", { count: 'exact' })
      .in("conversation_id", conversationIds)
      .neq("sender_id", userId);

    // Prepare recent listings
    const sales = (saleData || []).map(item => ({ 
      ...item, 
      type: 'sale' as const,
      created_at: item.created_at 
    }));
    const rentals = (rentalData || []).map(item => ({ 
      ...item, 
      type: 'rental' as const,
      created_at: item.created_at 
    }));

    const allListings = [...sales, ...rentals]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setRecentListings(allListings);

    setStats({
      totalListings: (saleCount || 0) + (rentalCount || 0),
      totalViews: 0, // Would need a views tracking system
      totalMessages: messagesCount || 0,
      totalFavorites: favoritesCount || 0,
      saleListings: saleCount || 0,
      rentalListings: rentalCount || 0,
      premiumListings: premiumCount || 0,
    });
  };

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Suivez vos performances et gérez vos annonces</p>
            </div>
            <Button onClick={() => navigate("/sell")}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une annonce
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annonces totales</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.saleListings} ventes • {stats.rentalListings} locations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">Messages non lus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favoris</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFavorites}</div>
                <p className="text-xs text-muted-foreground">Sur vos annonces</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.premiumListings}</div>
                <p className="text-xs text-muted-foreground">Annonces actives</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Listings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Annonces récentes</CardTitle>
                <CardDescription>Vos 5 dernières annonces publiées</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                Voir toutes mes annonces
              </Button>
            </CardHeader>
            <CardContent>
              {recentListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore d'annonces
                  </p>
                  <Button onClick={() => navigate("/sell")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une annonce
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(listing.type === 'sale' ? `/listing/${listing.id}` : `/rental/${listing.id}`)}
                    >
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {listing.images?.[0] && (
                          <img 
                            src={listing.images[0]} 
                            alt={`${listing.brand} ${listing.model}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {listing.brand} {listing.model}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {listing.year}
                              </Badge>
                              <Badge variant={listing.type === 'sale' ? 'default' : 'outline'} className="text-xs">
                                {listing.type === 'sale' ? 'Vente' : 'Location'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {listing.type === 'sale' 
                                ? formatPrice(listing.price || 0)
                                : `${formatPrice(listing.price_per_day || 0)}/jour`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
