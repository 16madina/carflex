import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User as UserIcon, Crown, ShoppingCart, Store, UserCheck, Building2, CheckCircle2, Calendar, Car, Check, X, Clock, MessageSquare, Mail, AlertCircle, Trash2, Heart, Star, Share2, Bell, Settings, UserCircle } from "lucide-react";
import AvatarWithBadge from "@/components/AvatarWithBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCountry } from "@/contexts/CountryContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { ImagePicker } from "@/components/ImagePicker";

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
  isPremium?: boolean;
  premiumEndDate?: string;
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
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [receivedBookings, setReceivedBookings] = useState<any[]>([]);
  const [verifyEmailDialogOpen, setVerifyEmailDialogOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<PremiumPackage | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      setUser(user);

      // Paralléliser toutes les requêtes pour améliorer les performances
      const [profileData, roles] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(res => res.data),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .then(res => res.data)
      ]);

      setProfile(profileData);
      
      if (roles && roles.length > 0) {
        setIsAdmin(true);
      }

      // Paralléliser le chargement des données
      await Promise.all([
        fetchUserListings(user.id),
        fetchPackages(),
        fetchBookings(user.id)
      ]);
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchUserListings = async (userId: string) => {
    // Optimisation : requête unique avec JOIN pour fusionner sale + rental + premium
    const [saleResult, rentalResult, premiumResult] = await Promise.all([
      supabase
        .from("sale_listings")
        .select("id, brand, model, year, price, images")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })
        .limit(10), // Pagination : limiter à 10 initialement
      supabase
        .from("rental_listings")
        .select("id, brand, model, year, price_per_day, images")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(10), // Pagination : limiter à 10 initialement
      supabase
        .from("premium_listings")
        .select("listing_id, end_date")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
    ]);

    const sales = (saleResult.data || []).map(item => ({ ...item, type: 'sale' as const }));
    const rentals = (rentalResult.data || []).map(item => ({ ...item, type: 'rental' as const }));
    const allListings = [...sales, ...rentals];

    // Marquer les annonces premium
    const premiumMap = new Map(
      (premiumResult.data || []).map(p => [p.listing_id, p.end_date])
    );

    const listingsWithPremium = allListings.map(listing => ({
      ...listing,
      isPremium: premiumMap.has(listing.id),
      premiumEndDate: premiumMap.get(listing.id)
    }));

    setUserListings(listingsWithPremium);
  };

  const fetchPackages = async () => {
    // Cache localStorage pour les packages (changent rarement)
    const cacheKey = 'premium_packages_cache';
    const cacheTimeKey = 'premium_packages_cache_time';
    const cacheMaxAge = 60 * 60 * 1000; // 1 heure

    try {
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      
      if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < cacheMaxAge) {
        setPackages(JSON.parse(cachedData));
        return;
      }
    } catch (e) {
      console.error('Cache error:', e);
    }

    // Sélectionner uniquement les colonnes nécessaires
    const { data, error } = await supabase
      .from("premium_packages")
      .select("id, name, description, price, duration_days, features, is_active")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (!error && data) {
      setPackages(data as PremiumPackage[]);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      } catch (e) {
        console.error('Cache save error:', e);
      }
    }
  };

  const fetchBookings = async (userId: string) => {
    // Optimisation : fusion en une seule requête avec OR + colonnes nécessaires
    const { data: allBookings } = await supabase
      .from("rental_bookings")
      .select(`
        id,
        status,
        start_date,
        end_date,
        total_price,
        total_days,
        daily_rate,
        notes,
        payment_status,
        renter_id,
        owner_id,
        created_at,
        rental_listing_id,
        rental_listings:rental_listing_id (
          id,
          brand,
          model,
          images,
          price_per_day,
          city,
          country
        ),
        renter:renter_id (
          first_name,
          last_name,
          phone
        ),
        owner:owner_id (
          first_name,
          last_name,
          phone
        )
      `)
      .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(10); // Pagination : limiter à 10 initialement

    // Séparer les réservations en ajoutant le champ profiles pour compatibilité
    const myData = (allBookings || []).map(b => ({
      ...b,
      profiles: b.owner
    }));
    
    const receivedData = (allBookings || []).map(b => ({
      ...b,
      profiles: b.renter
    }));

    setMyBookings(myData.filter(b => b.renter_id === userId));
    setReceivedBookings(receivedData.filter(b => b.owner_id === userId));
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
    console.log('handlePromote appelé avec:', listingId, listingType);
    setSelectedListing(listingId);
    setDialogOpen(true);
  };

  const confirmPromote = async () => {
    console.log('confirmPromote appelé avec:', selectedListing, selectedPackage);
    
    if (!selectedListing || !selectedPackage) {
      toast.error("Veuillez sélectionner un pack");
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) {
      console.error('Package non trouvé');
      return;
    }

    console.log('Package trouvé:', pkg);
    setSelectedPackageData(pkg);
    setDialogOpen(false);
    setShowPaymentSelector(true);
    console.log('Modal de paiement devrait s\'ouvrir');
  };

  const handlePaymentMethod = async (method: 'stripe' | 'wave' | 'paypal') => {
    console.log('handlePaymentMethod appelé avec:', method);
    console.log('selectedListing:', selectedListing);
    console.log('selectedPackage:', selectedPackage);
    
    const listing = userListings.find(l => l.id === selectedListing);
    if (!listing) {
      console.error('Listing non trouvé');
      toast.error("Annonce non trouvée");
      return;
    }

    console.log('Listing trouvé:', listing);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session obtenue');
      
      if (method === 'stripe') {
        toast.info("Préparation du paiement Stripe...");
        
        console.log('Appel de create-premium-payment avec:', {
          package_id: selectedPackage,
          listing_id: selectedListing,
          listing_type: listing.type
        });

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
          console.log('URL de paiement reçue:', response.data.url);
          toast.success("Redirection vers Stripe...");
          
          setTimeout(() => {
            window.location.href = response.data.url;
          }, 500);
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

  const handleAvatarChange = async (files: File[]) => {
    const file = files[0];
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

  const handleDeleteListing = async (listingId: string, listingType: 'sale' | 'rental') => {
    try {
      const tableName = listingType === 'sale' ? 'sale_listings' : 'rental_listings';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast.success("Annonce supprimée avec succès");
      if (user) {
        fetchUserListings(user.id);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error("Erreur lors de la suppression de l'annonce");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success("Votre compte a été supprimé avec succès");
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || "Erreur lors de la suppression du compte");
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <ProfileSkeleton />
        <BottomNav />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <div className="sticky top-0 z-10 bg-background pb-4 border-b border-border mb-6">
              <TabsList className="grid w-full grid-cols-4 mt-4">
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
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <AvatarWithBadge
                        src={profile?.avatar_url}
                        alt={`${profile?.first_name} ${profile?.last_name}`}
                        fallback={<UserIcon className="h-10 w-10" />}
                        className="h-20 w-20"
                        userId={user?.id}
                      />
                      <ImagePicker
                        onImageSelect={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
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
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer mon compte
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement votre compte,
                            toutes vos annonces, vos messages et vos données personnelles de nos serveurs.
                            <br /><br />
                            Conformément au RGPD, toutes vos données seront effacées, à l'exception des
                            données de transaction qui doivent être conservées pour des raisons légales.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                          <div className="flex gap-3 p-3">
                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {listing.images?.[0] && (
                                <img 
                                  src={listing.images[0]} 
                                  alt={`${listing.brand} ${listing.model}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="space-y-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                    <h3 className="font-semibold text-xs leading-tight">
                                      {listing.brand} {listing.model}
                                    </h3>
                                    {listing.isPremium && (
                                      <Badge variant="default" className="text-[10px] h-4 px-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 border-0">
                                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                                        Pro
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">
                                    {listing.year} • {listing.type === 'sale' ? 'Vente' : 'Location'}
                                  </p>
                                  {listing.profiles && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                        {listing.profiles.user_type === 'buyer' && 'Acheteur'}
                                        {listing.profiles.user_type === 'seller' && 'Vendeur'}
                                        {listing.profiles.user_type === 'agent' && 'Agent'}
                                        {listing.profiles.user_type === 'dealer' && 'Concessionnaire'}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-primary truncate">
                                    {listing.type === 'sale' 
                                      ? formatPrice(listing.price || 0)
                                      : `${formatPrice(listing.price_per_day || 0)}/j`}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                  <Button 
                                    onClick={() => handlePromote(listing.id, listing.type)}
                                    size="sm"
                                    className="bg-gradient-to-r from-primary to-primary/80 h-7 px-2 text-[10px]"
                                    disabled={listing.isPremium}
                                  >
                                    <Crown className="mr-1 h-2.5 w-2.5" />
                                    {listing.isPremium ? 'Sponsorisé' : 'Promouvoir'}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive h-7 px-2 text-[10px]"
                                      >
                                        <Trash2 className="mr-1 h-2.5 w-2.5" />
                                        Supprimer
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Cette action est irréversible. L'annonce "{listing.brand} {listing.model}" sera définitivement supprimée.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteListing(listing.id, listing.type)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
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
                        <Card 
                          key={booking.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setBookingDetailOpen(true);
                          }}
                        >
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
                        <Card 
                          key={booking.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={(e) => {
                            // Empêcher l'ouverture si on clique sur un bouton
                            if ((e.target as HTMLElement).closest('button')) return;
                            setSelectedBooking(booking);
                            setBookingDetailOpen(true);
                          }}
                        >
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

            <TabsContent value="settings" className="space-y-6">
              {/* Liens rapides */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Liens rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate(`/profile/${user?.id}`)}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Ma page publique
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/favorites')}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Favoris
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => toast.info('Fonctionnalité à venir')}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Mes avis
                  </Button>
                </CardContent>
              </Card>

              {/* Détails du profil */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Détails du profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/profile/edit')}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    Détails personnels
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => toast.info('Fonctionnalité à venir')}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Liens vers les médias sociaux
                  </Button>
                </CardContent>
              </Card>

              {/* Paramètres du compte */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Paramètres du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => toast.info('Fonctionnalité à venir')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gérer le compte
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => toast.info('Fonctionnalité à venir')}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Préférences de notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Informations générales */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start flex-col items-start h-auto py-3" 
                    onClick={() => navigate('/privacy-policy')}
                  >
                    <span className="font-semibold">Politique de confidentialité</span>
                    <span className="text-xs text-muted-foreground text-left">
                      Comment nous collectons et utilisons vos données
                    </span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start flex-col items-start h-auto py-3" 
                    onClick={() => navigate('/terms-of-service')}
                  >
                    <span className="font-semibold">Conditions d'utilisation</span>
                    <span className="text-xs text-muted-foreground text-left">
                      Les règles d'utilisation de notre plateforme
                    </span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start flex-col items-start h-auto py-3" 
                    onClick={() => navigate('/data-protection')}
                  >
                    <span className="font-semibold">Protection des données</span>
                    <span className="text-xs text-muted-foreground text-left">
                      Vos droits et notre engagement RGPD
                    </span>
                  </Button>
                </CardContent>
              </Card>
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

      {/* Booking Details Dialog */}
      <Dialog open={bookingDetailOpen} onOpenChange={setBookingDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Détails de la réservation</DialogTitle>
                <DialogDescription>
                  {selectedBooking.rental_listings?.brand} {selectedBooking.rental_listings?.model}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Image du véhicule */}
                {selectedBooking.rental_listings?.images?.[0] && (
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={selectedBooking.rental_listings.images[0]}
                      alt={`${selectedBooking.rental_listings.brand} ${selectedBooking.rental_listings.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Informations du véhicule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Véhicule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marque et modèle</span>
                      <span className="font-medium">
                        {selectedBooking.rental_listings?.brand} {selectedBooking.rental_listings?.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tarif journalier</span>
                      <span className="font-medium">
                        {formatPrice(parseFloat(selectedBooking.daily_rate))}/jour
                      </span>
                    </div>
                    {selectedBooking.rental_listings?.city && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Localisation</span>
                        <span className="font-medium">
                          {selectedBooking.rental_listings.city}, {selectedBooking.rental_listings.country}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Informations de la réservation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Période de location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de début</span>
                      <span className="font-medium">
                        {format(new Date(selectedBooking.start_date), "dd MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de fin</span>
                      <span className="font-medium">
                        {format(new Date(selectedBooking.end_date), "dd MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée totale</span>
                      <span className="font-medium">
                        {selectedBooking.total_days} jour{selectedBooking.total_days > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground font-semibold">Prix total</span>
                      <span className="font-bold text-primary text-lg">
                        {formatPrice(parseFloat(selectedBooking.total_price))}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedBooking.renter_id === user?.id ? 'Propriétaire' : 'Locataire'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom</span>
                      <span className="font-medium">
                        {selectedBooking.profiles?.first_name} {selectedBooking.profiles?.last_name}
                      </span>
                    </div>
                    {selectedBooking.profiles?.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Téléphone</span>
                        <a 
                          href={`tel:${selectedBooking.profiles.phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {selectedBooking.profiles.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statut et notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut et notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Statut</span>
                      {getStatusBadge(selectedBooking.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Paiement</span>
                      <Badge variant={selectedBooking.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {selectedBooking.payment_status === 'paid' ? 'Payé' : 'En attente'}
                      </Badge>
                    </div>
                    {selectedBooking.notes && (
                      <div className="space-y-1 pt-2 border-t">
                        <span className="text-muted-foreground text-sm">Notes</span>
                        <p className="text-sm">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const otherUserId = selectedBooking.renter_id === user?.id 
                        ? selectedBooking.owner_id 
                        : selectedBooking.renter_id;
                      handleSendMessage(otherUserId, selectedBooking.rental_listings?.id);
                      setBookingDetailOpen(false);
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Envoyer un message
                  </Button>
                  
                  {selectedBooking.status === 'pending' && selectedBooking.owner_id === user?.id && (
                    <>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          handleUpdateBookingStatus(selectedBooking.id, 'confirmed');
                          setBookingDetailOpen(false);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accepter
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleUpdateBookingStatus(selectedBooking.id, 'rejected');
                          setBookingDetailOpen(false);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Profile;
