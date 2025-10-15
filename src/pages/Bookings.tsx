import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Car, User, Check, X, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCountry } from "@/contexts/CountryContext";

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCountry();
  const [user, setUser] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [receivedBookings, setReceivedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    fetchBookings(user.id);
  };

  const fetchBookings = async (userId: string) => {
    setLoading(true);
    
    // Récupérer les réservations faites par l'utilisateur
    const { data: myData } = await supabase
      .from("rental_bookings")
      .select(`
        *,
        rental_listings:rental_listing_id (
          id,
          brand,
          model,
          images,
          price_per_day
        ),
        profiles:owner_id (
          first_name,
          last_name,
          phone
        )
      `)
      .eq("renter_id", userId)
      .order("created_at", { ascending: false });

    // Récupérer les demandes de réservation reçues
    const { data: receivedData } = await supabase
      .from("rental_bookings")
      .select(`
        *,
        rental_listings:rental_listing_id (
          id,
          brand,
          model,
          images,
          price_per_day
        ),
        profiles:renter_id (
          first_name,
          last_name,
          phone
        )
      `)
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    setMyBookings(myData || []);
    setReceivedBookings(receivedData || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("rental_bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
      });
      return;
    }

    toast({
      title: "Statut mis à jour",
      description: `La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}.`,
    });

    fetchBookings(user.id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
      pending: { label: "En attente", variant: "secondary" },
      confirmed: { label: "Confirmée", variant: "default" },
      rejected: { label: "Refusée", variant: "destructive" },
      cancelled: { label: "Annulée", variant: "outline" },
      completed: { label: "Terminée", variant: "secondary" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSendMessage = (renterId: string, listingId: string) => {
    navigate(`/messages?userId=${renterId}&listingId=${listingId}&listingType=rental`);
  };

  const BookingCard = ({ booking, isOwner = false }: { booking: any; isOwner?: boolean }) => {
    const listing = booking.rental_listings;
    const profile = isOwner ? booking.profiles : booking.profiles;
    const otherUserId = isOwner ? booking.renter_id : booking.owner_id;
    
    return (
      <Card key={booking.id}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img
              src={listing.images?.[0] || "/placeholder.svg"}
              alt={`${listing.brand} ${listing.model}`}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    {listing.brand} {listing.model}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.start_date), "dd MMM", { locale: fr })} - {format(new Date(booking.end_date), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.total_days} jour{booking.total_days > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold text-primary">
                  {formatPrice(parseFloat(booking.total_price))}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendMessage(otherUserId, listing.id)}
                    className="gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  {isOwner && booking.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {booking.notes && (
                <p className="text-sm text-muted-foreground border-t pt-2">
                  Note: {booking.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold mb-6">Mes réservations</h1>

        <Tabs defaultValue={receivedBookings.filter(b => b.status === 'pending').length > 0 ? "received" : "my-bookings"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-bookings">
              Mes locations
              {myBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">{myBookings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="received">
              Demandes reçues
              {receivedBookings.filter(b => b.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {receivedBookings.filter(b => b.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-bookings" className="space-y-4 mt-6">
            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : myBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune réservation pour le moment</p>
                  <Button className="mt-4" onClick={() => navigate("/listings")}>
                    Parcourir les locations
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-4 mt-6">
            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : receivedBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune demande reçue</p>
                </CardContent>
              </Card>
            ) : (
              receivedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isOwner={true} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Bookings;
