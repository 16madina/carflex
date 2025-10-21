import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Crown, ShoppingCart, Store, UserCheck, Building2, CheckCircle2, Camera, Calendar, Car, Check, X, Clock, MessageSquare, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCountry } from "@/contexts/CountryContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";

interface PremiumPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

interface UserListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: 'sale' | 'rental';
  price?: number;
  price_per_day?: number;
  images?: any;
  profiles?: {
    first_name: string;
    last_name: string;
    user_type: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [receivedBookings, setReceivedBookings] = useState<any[]>([]);
  const [verifyEmailDialogOpen, setVerifyEmailDialogOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<PremiumPackage | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (roles && roles.length > 0) {
        setIsAdmin(true);
      }

      await fetchUserListings(user.id);
      await fetchPackages();
      await fetchBookings(user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchUserListings = async (userId: string) => {
    const { data: saleData } = await supabase
      .from("sale_listings")
      .select(`
        id, 
        brand, 
        model, 
        year, 
        price, 
        images,
        seller_id,
        profiles!sale_listings_seller_id_fkey (
          first_name,
          last_name,
          user_type
        )
      `)
      .eq("seller_id", userId);

    const { data: rentalData } = await supabase
      .from("rental_listings")
      .select(`
        id, 
        brand, 
        model, 
        year, 
        price_per_day, 
        images,
        owner_id,
        profiles!rental_listings_owner_id_fkey (
          first_name,
          last_name,
          user_type
        )
      `)
      .eq("owner_id", userId);

    const sales = (saleData || []).map(item => ({ ...item, type: 'sale' as const }));
    const rentals = (rentalData || []).map(item => ({ ...item, type: 'rental' as const }));

    setUserListings([...sales, ...rentals]);
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("premium_packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (!error) {
      setPackages(data as PremiumPackage[] || []);
    }
  };

  const fetchBookings = async (userId: string) => {
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
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("rental_bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Impossible de mettre à jour le statut");
      return;
    }

    toast.success(`La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}`);
    if (user) {
      fetchBookings(user.id);
    }
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

  const handleSendMessage = (otherUserId: string, listingId: string) => {
    navigate(`/messages?userId=${otherUserId}&listingId=${listingId}&listingType=rental`);
  };

  const handlePromote = async (listingId: string, listingType: 'sale' | 'rental') => {
    setSelectedListing(listingId);
    setDialogOpen(true);
  };

  const confirmPromote = async () => {
    if (!selectedListing || !selectedPackage) {
      toast.error("Veuillez sélectionner un pack");
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setSelectedPackageData(pkg);
    setDialogOpen(false);
    setShowPaymentSelector(true);
  };

  const handlePaymentMethod = async (method: 'stripe' | 'wave' | 'paypal') => {
    const listing = userListings.find(l => l.id === selectedListing);
    if (!listing) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (method === 'stripe') {
        toast.info("Préparation du paiement...");
        
        const response = await supabase.functions.invoke('create-premium-payment', {
          body: {
            package_id: selectedPackage,
            listing_id: selectedListing,
            listing_type: listing.type
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`
          }
        });

        console.log('Response complète:', response);

        if (response.error) {
          console.error('Erreur:', response.error);
          throw response.error;
        }

        if (response.data?.url) {
          console.log('Redirection vers:', response.data.url);
          // Redirection immédiate
          window.location.href = response.data.url;
        } else {
          console.error('Pas d\'URL dans la réponse:', response.data);
          throw new Error("URL de paiement non reçue");
        }
      } else if (method === 'wave') {
        toast.info("Bientôt disponible", {
          description: "Le paiement Wave sera disponible prochainement",
        });
      } else if (method === 'paypal') {
        toast.info("Bientôt disponible", {
          description: "Le paiement PayPal sera disponible prochainement",
        });
      }

    } catch (error) {
      console.error('Erreur complète:', error);
      toast.error("Impossible d'initier le paiement");
      setShowPaymentSelector(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Supprimer l'ancien avatar s'il existe
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload le nouveau fichier
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Photo de profil mise à jour");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Erreur lors du téléchargement de la photo");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user || !profile) return;
    
    setSendingVerification(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          userId: user.id,
          email: profile.email,
          firstName: profile.first_name
        }
      });

      if (error) throw error;

      setVerifyEmailDialogOpen(true);
      toast.success("Email de vérification envoyé !");
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setSendingVerification(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
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

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <div className="sticky top-0 z-10 bg-background pb-4 border-b border-border mb-6">
              <TabsList className="grid w-full grid-cols-3 mt-4">
                <TabsTrigger value="profile">Mon Profil</TabsTrigger>
                <TabsTrigger value="listings">Mes Annonces</TabsTrigger>
                <TabsTrigger value="bookings">
                  Réservations
                  {(myBookings.length > 0 || receivedBookings.filter(b => b.status === 'pending').length > 0) && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1">
                      {myBookings.length + receivedBookings.filter(b => b.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          <UserIcon className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">
                          {profile?.first_name} {profile?.last_name}
                        </h2>
                        {profile?.user_type === "buyer" && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            Acheteur
                          </Badge>
                        )}
                        {profile?.user_type === "seller" && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                            <Store className="h-3 w-3" />
                            Vendeur
                          </Badge>
                        )}
                        {profile?.user_type === "agent" && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <UserCheck className="h-3 w-3" />
                            Agent
                          </Badge>
                        )}
                        {profile?.user_type === "dealer" && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200">
                            <Building2 className="h-3 w-3" />
                            Concessionnaire
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-muted-foreground">{profile?.email}</p>
                        {profile?.email_verified ? (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Vérifié
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSendVerificationEmail}
                            disabled={sendingVerification}
                            className="h-7 px-2 text-xs"
                          >
                            {sendingVerification ? (
                              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <Mail className="h-3 w-3 mr-1" />
                            )}
                            Vérifier mon email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{profile?.user_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone:</span>
                        <p className="font-medium">{profile?.phone || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ville:</span>
                        <p className="font-medium">{profile?.city || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pays:</span>
                        <p className="font-medium">{profile?.country || "Non renseigné"}</p>
                      </div>
                    </div>

                    {profile?.company_name && (
                      <div>
                        <span className="text-muted-foreground">Entreprise:</span>
                        <p className="font-medium">{profile.company_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => navigate("/profile/edit")}>
                      Modifier le profil
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" className="w-full bg-amber-50 hover:bg-amber-100 border-amber-200" onClick={() => navigate("/admin")}>
                        <Crown className="mr-2 h-4 w-4 text-amber-500" />
                        Panneau Admin
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => navigate("/favorites")}>
                      Mes favoris
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Mes Annonces</CardTitle>
                  <Button onClick={() => navigate("/sell")} size="sm">
                    Créer une annonce
                  </Button>
                </CardHeader>
                <CardContent>
                  {userListings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Vous n'avez pas encore d'annonces
                      </p>
                      <Button onClick={() => navigate("/sell")}>
                        Créer une annonce
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userListings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden">
                          <div className="flex gap-4 p-4">
                            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {listing.images?.[0] && (
                                <img 
                                  src={listing.images[0]} 
                                  alt={`${listing.brand} ${listing.model}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-base">
                                    {listing.brand} {listing.model}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {listing.year} • {listing.type === 'sale' ? 'Vente' : 'Location'}
                                  </p>
                                  {listing.profiles && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {listing.profiles.user_type === 'buyer' && 'Acheteur'}
                                        {listing.profiles.user_type === 'seller' && 'Vendeur'}
                                        {listing.profiles.user_type === 'agent' && 'Agent'}
                                        {listing.profiles.user_type === 'dealer' && 'Concessionnaire'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {listing.profiles.first_name} {listing.profiles.last_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-sm">
                                  {listing.type === 'sale' 
                                    ? formatPrice(listing.price || 0)
                                    : `${formatPrice(listing.price_per_day || 0)}/jour`}
                                </Badge>
                              </div>
                              <Button 
                                onClick={() => handlePromote(listing.id, listing.type)}
                                size="sm"
                                className="bg-gradient-to-r from-primary to-primary/80"
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Promouvoir
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
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
                  {myBookings.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Aucune réservation pour le moment</p>
                        <Button onClick={() => navigate("/listings")}>
                          Parcourir les locations
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    myBookings.map((booking) => {
                      const listing = booking.rental_listings;
                      const profile = booking.profiles;
                      
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
                                      <UserIcon className="h-3 w-3" />
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSendMessage(booking.owner_id, listing.id)}
                                    className="gap-1 h-8 px-2 text-xs"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Message</span>
                                  </Button>
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
                    })
                  )}
                </TabsContent>

                <TabsContent value="received" className="space-y-4 mt-6">
                  {receivedBookings.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Aucune demande reçue</p>
                      </CardContent>
                    </Card>
                  ) : (
                    receivedBookings.map((booking) => {
                      const listing = booking.rental_listings;
                      const profile = booking.profiles;
                      
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
                                      <UserIcon className="h-3 w-3" />
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
                                  <div className="flex gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSendMessage(booking.renter_id, listing.id)}
                                      className="gap-1 h-8 px-2 text-xs"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Message</span>
                                    </Button>
                                    {booking.status === 'pending' && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                          className="gap-1 h-8 px-2 text-xs"
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                          <span className="hidden sm:inline">Accepter</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')}
                                          className="gap-1 h-8 px-2 text-xs"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                          <span className="hidden sm:inline">Refuser</span>
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
                    })
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={verifyEmailDialogOpen} onOpenChange={setVerifyEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email de vérification envoyé
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-amber-900">Vérifiez votre dossier spam</p>
                <p className="text-sm text-amber-700">
                  L'email de vérification peut parfois arriver dans vos courriers indésirables ou spam. 
                  Pensez à vérifier ce dossier si vous ne trouvez pas notre email.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✉️ Un email a été envoyé à <strong>{profile?.email}</strong></p>
              <p>🔗 Cliquez sur le lien dans l'email pour vérifier votre adresse</p>
              <p>⏰ Le lien est valide pendant 24 heures</p>
            </div>
          </div>
          <Button onClick={() => setVerifyEmailDialogOpen(false)} className="w-full">
            Compris
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choisir un pack premium</DialogTitle>
            <DialogDescription>
              Sélectionnez le pack qui correspond à vos besoins
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {selectedPackage === pkg.id && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">{formatPrice(pkg.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        pour {pkg.duration_days} jours
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Avantages :</p>
                      <ul className="space-y-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {packages.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Aucun pack disponible pour le moment
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={confirmPromote}
              disabled={!selectedPackage}
            >
              Continuer vers le paiement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentMethodSelector
        open={showPaymentSelector}
        onOpenChange={setShowPaymentSelector}
        onSelectMethod={handlePaymentMethod}
        amount={selectedPackageData?.price || 0}
        formatPrice={formatPrice}
      />

      <BottomNav />
    </div>
  );
};

export default Profile;
