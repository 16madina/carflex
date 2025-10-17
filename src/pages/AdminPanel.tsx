import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Crown, Zap, Image as ImageIcon, ExternalLink, Users, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountry } from "@/contexts/CountryContext";
import { UserManagement } from "@/components/admin/UserManagement";

interface PremiumPackage {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  features: any;
  is_active: boolean | null;
}

interface Listing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  seller_id: string;
}

interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [adBanners, setAdBanners] = useState<AdBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [appSettings, setAppSettings] = useState<Record<string, boolean>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PremiumPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_days: 30,
    price: 0,
    features: "",
  });
  const [promotionData, setPromotionData] = useState({
    listing_id: "",
    package_id: "",
    listing_type: "sale",
  });
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    is_active: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice, convertPrice, selectedCountry } = useCountry();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions d'administrateur",
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      setIsAdmin(true);
      fetchPackages();
      fetchListings();
      fetchAdBanners();
      fetchAppSettings();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("premium_packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les packages",
        variant: "destructive",
      });
      return;
    }

    setPackages(data as PremiumPackage[] || []);
  };

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("sale_listings")
      .select("id, brand, model, year, price, seller_id")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
      return;
    }

    setListings(data || []);
  };

  const fetchAdBanners = async () => {
    const { data, error } = await supabase
      .from("ad_banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les bannières",
        variant: "destructive",
      });
      return;
    }

    setAdBanners(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ad-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-banners')
        .getPublicUrl(filePath);

      setBannerFormData({ ...bannerFormData, image_url: publicUrl });

      toast({ title: "Image uploadée avec succès" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerFormData.title || !bannerFormData.image_url || !bannerFormData.link_url) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (editingBanner) {
      const { error } = await supabase
        .from("ad_banners")
        .update({
          title: bannerFormData.title,
          image_url: bannerFormData.image_url,
          link_url: bannerFormData.link_url,
          is_active: bannerFormData.is_active,
        })
        .eq("id", editingBanner.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la bannière",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Bannière mise à jour avec succès" });
    } else {
      const { error } = await supabase
        .from("ad_banners")
        .insert([{
          title: bannerFormData.title,
          image_url: bannerFormData.image_url,
          link_url: bannerFormData.link_url,
          is_active: bannerFormData.is_active,
        }]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la bannière",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Bannière créée avec succès" });
    }

    setBannerFormData({ title: "", image_url: "", link_url: "", is_active: true });
    setEditingBanner(null);
    fetchAdBanners();
  };

  const handleEditBanner = (banner: AdBanner) => {
    setEditingBanner(banner);
    setBannerFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url,
      is_active: banner.is_active,
    });
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette bannière ?")) return;

    const { error } = await supabase
      .from("ad_banners")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la bannière",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Bannière supprimée avec succès" });
    fetchAdBanners();
  };

  const handleToggleBannerStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("ad_banners")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
      return;
    }

    toast({ title: `Bannière ${!currentStatus ? "activée" : "désactivée"}` });
    fetchAdBanners();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert price from user's currency to XOF (base currency)
    const priceInXOF = formData.price / selectedCountry.exchangeRate;

    const packageData = {
      name: formData.name,
      description: formData.description,
      duration_days: formData.duration_days,
      price: priceInXOF,
      features: formData.features.split("\n").filter(f => f.trim()),
      is_active: true,
    };

    if (editingPackage) {
      const { error } = await supabase
        .from("premium_packages")
        .update(packageData)
        .eq("id", editingPackage.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le package",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Package mis à jour avec succès" });
    } else {
      const { error } = await supabase
        .from("premium_packages")
        .insert([packageData]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le package",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Package créé avec succès" });
    }

    setFormData({ name: "", description: "", duration_days: 30, price: 0, features: "" });
    setEditingPackage(null);
    fetchPackages();
  };

  const handlePromoteToTrending = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promotionData.listing_id || !promotionData.package_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une annonce et un package",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get package details
    const pkg = packages.find(p => p.id === promotionData.package_id);
    if (!pkg) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.duration_days);

    const { error } = await supabase
      .from("premium_listings")
      .insert([{
        listing_id: promotionData.listing_id,
        listing_type: promotionData.listing_type,
        package_id: promotionData.package_id,
        user_id: user.id,
        end_date: endDate.toISOString(),
        is_active: true,
      }]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de promouvoir l'annonce: " + error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ 
      title: "Annonce promue !",
      description: "L'annonce apparaît maintenant dans les annonces premium"
    });

    setPromotionData({ listing_id: "", package_id: "", listing_type: "sale" });
  };

  const handleEdit = (pkg: PremiumPackage) => {
    setEditingPackage(pkg);
    const featuresArray = Array.isArray(pkg.features) ? pkg.features : [];
    // Convert price from XOF to user's currency for editing
    const priceInUserCurrency = pkg.price * selectedCountry.exchangeRate;
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      duration_days: pkg.duration_days,
      price: priceInUserCurrency,
      features: featuresArray.join("\n"),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce package ?")) return;

    const { error } = await supabase
      .from("premium_packages")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le package",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Package supprimé avec succès" });
    fetchPackages();
  };

  const fetchAppSettings = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*");

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
      return;
    }

    const settingsMap: Record<string, boolean> = {};
    data?.forEach((setting) => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });
    setAppSettings(settingsMap);
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    setSavingSettings(true);
    
    const { error } = await supabase
      .from("app_settings")
      .update({ setting_value: value })
      .eq("setting_key", key);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre",
        variant: "destructive",
      });
      setSavingSettings(false);
      return;
    }

    toast({ title: "Paramètre mis à jour avec succès" });
    setAppSettings({ ...appSettings, [key]: value });
    setSavingSettings(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Chargement...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
        </div>

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="packages">Packages Premium</TabsTrigger>
            <TabsTrigger value="promote">Promouvoir une annonce</TabsTrigger>
            <TabsTrigger value="banners">Bannières Publicitaires</TabsTrigger>
            <TabsTrigger value="users">Gestion des Utilisateurs</TabsTrigger>
            <TabsTrigger value="pro-plan">Plan Pro</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{editingPackage ? "Modifier" : "Créer"} un Package Premium</CardTitle>
                  <CardDescription>
                    Gérez les offres premium pour les annonces sponsorisées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom du package</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Durée (jours)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration_days}
                          onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="price">Prix ({selectedCountry.currencySymbol})</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="features">Fonctionnalités (une par ligne)</Label>
                      <Textarea
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        placeholder="Mise en avant sur la page d'accueil&#10;Badge Premium&#10;Position prioritaire"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingPackage ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {editingPackage ? "Mettre à jour" : "Créer"}
                      </Button>
                      {editingPackage && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingPackage(null);
                            setFormData({ name: "", description: "", duration_days: 30, price: 0, features: "" });
                          }}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Packages Existants</h2>
                {packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{pkg.name}</CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(pkg)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Durée:</strong> {pkg.duration_days} jours</p>
                        <p><strong>Prix:</strong> {formatPrice(pkg.price)}</p>
                        {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                          <div>
                            <strong>Fonctionnalités:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {pkg.features.map((feature: string, idx: number) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="promote">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Promouvoir une annonce en Premium
                </CardTitle>
                <CardDescription>
                  Sélectionnez une annonce et un package pour la mettre en avant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePromoteToTrending} className="space-y-4">
                  <div>
                    <Label htmlFor="listing">Sélectionner une annonce</Label>
                    <Select
                      value={promotionData.listing_id}
                      onValueChange={(value) => setPromotionData({ ...promotionData, listing_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une annonce" />
                      </SelectTrigger>
                      <SelectContent>
                        {listings.map((listing) => (
                          <SelectItem key={listing.id} value={listing.id}>
                            {listing.year} {listing.brand} {listing.model} - {formatPrice(listing.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="package">Package Premium</Label>
                    <Select
                      value={promotionData.package_id}
                      onValueChange={(value) => setPromotionData({ ...promotionData, package_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.filter(p => p.is_active).map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.duration_days} jours - {formatPrice(pkg.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Promouvoir cette annonce
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                    {editingBanner ? "Modifier" : "Créer"} une Bannière Publicitaire
                  </CardTitle>
                  <CardDescription>
                    Gérez les bannières publicitaires affichées entre les annonces
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBannerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="banner-title">Titre de la bannière</Label>
                      <Input
                        id="banner-title"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        placeholder="Ex: Assurance Auto Afrique"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner-link">Lien URL</Label>
                      <Input
                        id="banner-link"
                        type="url"
                        value={bannerFormData.link_url}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, link_url: e.target.value })}
                        placeholder="https://example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner-image">Image de la bannière</Label>
                      <Input
                        id="banner-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage && <p className="text-sm text-muted-foreground mt-2">Upload en cours...</p>}
                      {bannerFormData.image_url && (
                        <div className="mt-4 relative w-full h-40 rounded-lg overflow-hidden">
                          <img 
                            src={bannerFormData.image_url} 
                            alt="Aperçu" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="banner-active">Bannière active</Label>
                      <Switch
                        id="banner-active"
                        checked={bannerFormData.is_active}
                        onCheckedChange={(checked) => setBannerFormData({ ...bannerFormData, is_active: checked })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={uploadingImage}>
                        {editingBanner ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {editingBanner ? "Mettre à jour" : "Créer"}
                      </Button>
                      {editingBanner && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingBanner(null);
                            setBannerFormData({ title: "", image_url: "", link_url: "", is_active: true });
                          }}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Bannières Existantes</h2>
                {adBanners.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Aucune bannière créée pour le moment
                    </CardContent>
                  </Card>
                ) : (
                  adBanners.map((banner) => (
                    <Card key={banner.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {banner.title}
                              {banner.is_active ? (
                                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Actif</span>
                              ) : (
                                <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">Inactif</span>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" />
                              {banner.link_url}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditBanner(banner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="relative w-full h-32 rounded-lg overflow-hidden">
                            <img 
                              src={banner.image_url} 
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {banner.click_count} clics
                            </span>
                            <Button
                              size="sm"
                              variant={banner.is_active ? "outline" : "default"}
                              onClick={() => handleToggleBannerStatus(banner.id, banner.is_active)}
                            >
                              {banner.is_active ? "Désactiver" : "Activer"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="pro-plan">
            <ProPlanSettings />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Paramètres de l'application
                </CardTitle>
                <CardDescription>
                  Configurez les restrictions et fonctionnalités de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="restrict-evaluation">
                      Restreindre l'évaluation aux utilisateurs Pro
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Seuls les utilisateurs avec un abonnement Pro pourront accéder à l'évaluation de véhicule
                    </p>
                  </div>
                  <Switch
                    id="restrict-evaluation"
                    checked={appSettings.restrict_vehicle_evaluation_to_pro || false}
                    onCheckedChange={(checked) => 
                      handleSettingChange('restrict_vehicle_evaluation_to_pro', checked)
                    }
                    disabled={savingSettings}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

const ProPlanSettings = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [proPlanData, setProPlanData] = useState({
    productId: "prod_TF9Qwq8CkwzIUw",
    priceId: "",
    currentPrice: 0,
    newPrice: 0,
  });
  const { toast } = useToast();
  const { formatPrice, selectedCountry } = useCountry();

  useEffect(() => {
    fetchProPlanPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProPlanPrice = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-product-price', {
        body: { productId: proPlanData.productId }
      });

      if (error) throw error;

      if (data) {
        const priceInUserCurrency = (data.amount / 100) * selectedCountry.exchangeRate;
        setProPlanData({
          ...proPlanData,
          priceId: data.priceId,
          currentPrice: data.amount / 100,
          newPrice: priceInUserCurrency,
        });
      }
    } catch (error) {
      console.error("Error fetching pro plan price:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le prix du plan pro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Convert from user's currency to XOF
      const priceInXOF = proPlanData.newPrice / selectedCountry.exchangeRate;
      const amountInCents = Math.round(priceInXOF * 100);

      const { data, error } = await supabase.functions.invoke('update-stripe-price', {
        body: {
          productId: proPlanData.productId,
          oldPriceId: proPlanData.priceId,
          newAmount: amountInCents,
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le prix du plan pro a été mis à jour avec succès",
      });

      // Refresh the price data
      await fetchProPlanPrice();
    } catch (error) {
      console.error("Error updating pro plan price:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le prix du plan pro",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Gestion du Plan Pro
        </CardTitle>
        <CardDescription>
          Modifiez le prix mensuel du plan d'abonnement Pro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePrice} className="space-y-4">
          <div>
            <Label>Prix actuel</Label>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(proPlanData.currentPrice)}/mois
            </div>
          </div>

          <div>
            <Label htmlFor="newPrice">Nouveau prix ({selectedCountry.currencySymbol})</Label>
            <Input
              id="newPrice"
              type="number"
              step="0.01"
              value={proPlanData.newPrice}
              onChange={(e) => setProPlanData({ ...proPlanData, newPrice: parseFloat(e.target.value) })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Équivalent: {formatPrice(proPlanData.newPrice / selectedCountry.exchangeRate)} XOF
            </p>
          </div>

          <Button type="submit" disabled={updating} className="w-full">
            {updating ? (
              <>
                <Edit className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Mettre à jour le prix
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
