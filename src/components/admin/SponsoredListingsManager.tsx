import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Trash2, Calendar, Car, Key, Search, CheckCircle, Image as ImageIcon, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCountry } from "@/contexts/CountryContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Listing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  seller_id?: string;
  owner_id?: string;
  listing_type: 'sale' | 'rental';
  images?: string[];
  city?: string;
  country?: string;
  is_sponsored?: boolean;
}

interface SponsoredListing {
  id: string;
  listing_id: string;
  listing_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  listing?: {
    brand: string;
    model: string;
    year: number;
    price: number;
    images?: string[];
    city?: string;
  };
}

export const SponsoredListingsManager = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [sponsoredListings, setSponsoredListings] = useState<SponsoredListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'sale' | 'rental'>('all');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState(30);
  const { toast } = useToast();
  const { formatPrice } = useCountry();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchListings(), fetchSponsoredListings()]);
    setLoading(false);
  };

  const fetchListings = async () => {
    // Récupérer les annonces sponsorisées actives
    const { data: sponsoredData } = await supabase
      .from("premium_listings")
      .select("listing_id")
      .eq("is_active", true);

    const sponsoredIds = new Set((sponsoredData || []).map(s => s.listing_id));

    // Récupérer les annonces de vente
    const { data: saleData } = await supabase
      .from("sale_listings")
      .select("id, brand, model, year, price, seller_id, images, city, country")
      .order("created_at", { ascending: false });

    // Récupérer les annonces de location
    const { data: rentalData } = await supabase
      .from("rental_listings")
      .select("id, brand, model, year, price_per_day, owner_id, images, city, country")
      .order("created_at", { ascending: false });

    const saleListings = (saleData || []).map(listing => ({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      listing_type: 'sale' as const,
      seller_id: listing.seller_id,
      images: listing.images as string[] || [],
      city: listing.city,
      country: listing.country,
      is_sponsored: sponsoredIds.has(listing.id),
    }));

    const rentalListings = (rentalData || []).map(listing => ({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      price: listing.price_per_day,
      listing_type: 'rental' as const,
      owner_id: listing.owner_id,
      images: listing.images as string[] || [],
      city: listing.city,
      country: listing.country,
      is_sponsored: sponsoredIds.has(listing.id),
    }));

    setListings([...saleListings, ...rentalListings]);
  };

  const fetchSponsoredListings = async () => {
    const { data, error } = await supabase
      .from("premium_listings")
      .select("id, listing_id, listing_type, start_date, end_date, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sponsored listings:", error);
      return;
    }

    // Récupérer les détails des annonces
    const sponsoredWithDetails: SponsoredListing[] = [];
    
    for (const sponsored of data || []) {
      let listingDetails = null;
      
      if (sponsored.listing_type === 'sale') {
        const { data: saleData } = await supabase
          .from("sale_listings")
          .select("brand, model, year, price, images, city")
          .eq("id", sponsored.listing_id)
          .maybeSingle();
        listingDetails = saleData;
      } else {
        const { data: rentalData } = await supabase
          .from("rental_listings")
          .select("brand, model, year, price_per_day, images, city")
          .eq("id", sponsored.listing_id)
          .maybeSingle();
        if (rentalData) {
          listingDetails = {
            brand: rentalData.brand,
            model: rentalData.model,
            year: rentalData.year,
            price: rentalData.price_per_day,
            images: rentalData.images as string[] || [],
            city: rentalData.city,
          };
        }
      }
      
      sponsoredWithDetails.push({
        ...sponsored,
        listing: listingDetails || undefined
      });
    }

    setSponsoredListings(sponsoredWithDetails);
  };

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      // Filtre par type
      if (listingTypeFilter !== 'all' && listing.listing_type !== listingTypeFilter) {
        return false;
      }
      
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesBrand = listing.brand.toLowerCase().includes(query);
        const matchesModel = listing.model.toLowerCase().includes(query);
        const matchesYear = listing.year.toString().includes(query);
        const matchesCity = listing.city?.toLowerCase().includes(query);
        return matchesBrand || matchesModel || matchesYear || matchesCity;
      }
      
      return true;
    });
  }, [listings, listingTypeFilter, searchQuery]);

  const handleSponsor = async () => {
    if (!selectedListingId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une annonce",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const selectedListing = listings.find(l => l.id === selectedListingId);
    if (!selectedListing) {
      toast({
        title: "Erreur",
        description: "Annonce non trouvée",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (selectedListing.is_sponsored) {
      toast({
        title: "Erreur",
        description: "Cette annonce est déjà sponsorisée",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const listingOwnerId = selectedListing.listing_type === 'sale' 
      ? selectedListing.seller_id 
      : selectedListing.owner_id;

    if (!listingOwnerId) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver le propriétaire de l'annonce",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Créer ou récupérer le package gratuit
    let packageId: string;
    
    const { data: freePackage } = await supabase
      .from("premium_packages")
      .select("id")
      .eq("name", "Sponsorisé Gratuit")
      .maybeSingle();

    if (freePackage) {
      packageId = freePackage.id;
    } else {
      const { data: newPackage, error: packageError } = await supabase
        .from("premium_packages")
        .insert([{
          name: "Sponsorisé Gratuit",
          description: "Package pour les annonces sponsorisées manuellement par l'admin",
          duration_days: 365,
          price: 0,
          features: ["Mise en avant gratuite", "Sponsorisé par l'admin"],
          is_active: true,
        }])
        .select()
        .single();

      if (packageError || !newPackage) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le package sponsorisé",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      packageId = newPackage.id;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const { error } = await supabase
      .from("premium_listings")
      .insert([{
        listing_id: selectedListingId,
        listing_type: selectedListing.listing_type,
        package_id: packageId,
        user_id: listingOwnerId,
        end_date: endDate.toISOString(),
        is_active: true,
      }]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sponsoriser l'annonce: " + error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({ 
      title: "Annonce sponsorisée !",
      description: `${selectedListing.brand} ${selectedListing.model} est maintenant sponsorisée pour ${durationDays} jours`
    });

    setSelectedListingId(null);
    await fetchData();
    setSubmitting(false);
  };

  const handleRemoveSponsorship = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer le sponsoring de cette annonce ?")) return;

    const { error } = await supabase
      .from("premium_listings")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le sponsoring",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Sponsoring retiré avec succès" });
    await fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getFirstImage = (images?: string[]) => {
    if (!images || images.length === 0) return null;
    return images[0];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Chargement des annonces...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section sponsorisées actives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Annonces sponsorisées actives ({sponsoredListings.length})
          </CardTitle>
          <CardDescription>
            Ces annonces apparaissent dans la section Hero de la page d'accueil
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sponsoredListings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucune annonce sponsorisée pour le moment</p>
              <p className="text-sm">Sélectionnez une annonce ci-dessous pour la sponsoriser</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <ScrollArea className="max-h-[300px]">
                <div className="divide-y">
                  {sponsoredListings.map((sponsored) => (
                    <div 
                      key={sponsored.id} 
                      className={`flex items-center gap-2 p-2 ${
                        isExpired(sponsored.end_date) ? "bg-destructive/5" : "bg-orange-50 dark:bg-orange-950/20"
                      }`}
                    >
                      {/* Image */}
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {sponsored.listing && getFirstImage(sponsored.listing.images as string[]) ? (
                          <img 
                            src={getFirstImage(sponsored.listing.images as string[])!} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-medium text-sm truncate">
                            {sponsored.listing 
                              ? `${sponsored.listing.year} ${sponsored.listing.brand} ${sponsored.listing.model}`
                              : "Annonce supprimée"
                            }
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${sponsored.listing_type === 'sale' ? "text-blue-600 border-blue-200" : "text-green-600 border-green-200"}`}
                          >
                            {sponsored.listing_type === 'sale' ? 'Vente' : 'Location'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {sponsored.listing && (
                            <span className="font-semibold text-primary">
                              {formatPrice(sponsored.listing.price)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expire: {formatDate(sponsored.end_date)}
                          </span>
                          {isExpired(sponsored.end_date) && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Expiré</Badge>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => handleRemoveSponsorship(sponsored.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section nouvelle sponsorisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Sponsoriser une nouvelle annonce
          </CardTitle>
          <CardDescription>
            Choisissez parmi {listings.length} annonces disponibles sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par marque, modèle, année, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={listingTypeFilter}
              onValueChange={(value) => setListingTypeFilter(value as 'all' | 'sale' | 'rental')}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="sale">
                  <span className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vente
                  </span>
                </SelectItem>
                <SelectItem value="rental">
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Location
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des annonces */}
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {filteredListings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune annonce trouvée</p>
                  </div>
                ) : (
                  filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => !listing.is_sponsored && setSelectedListingId(
                        selectedListingId === listing.id ? null : listing.id
                      )}
                      className={`flex items-center gap-2 p-2 cursor-pointer transition-all ${
                        listing.is_sponsored
                          ? "bg-orange-50 dark:bg-orange-950/20 cursor-not-allowed opacity-60"
                          : selectedListingId === listing.id
                          ? "bg-primary/10 ring-1 ring-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {/* Image compacte */}
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {getFirstImage(listing.images) ? (
                          <img 
                            src={getFirstImage(listing.images)!} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info compacte */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {listing.year} {listing.brand} {listing.model}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${listing.listing_type === 'sale' ? "text-blue-600 border-blue-200" : "text-green-600 border-green-200"}`}
                          >
                            {listing.listing_type === 'sale' ? 'Vente' : 'Location'}
                          </Badge>
                          <span className="truncate">{listing.city}</span>
                        </div>
                      </div>

                      {/* Prix et statut */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-semibold text-primary text-sm">
                          {formatPrice(listing.price)}
                        </span>
                        {listing.is_sponsored ? (
                          <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0">
                            <Zap className="h-2.5 w-2.5" />
                          </Badge>
                        ) : selectedListingId === listing.id ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          {selectedListingId && (
            <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-muted/50 rounded-lg border">
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-sm">Durée du sponsoring</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
              </div>
              <Button 
                onClick={handleSponsor} 
                disabled={submitting}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
              >
                <Zap className="mr-2 h-4 w-4" />
                {submitting ? "Sponsorisation..." : "Sponsoriser maintenant"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
