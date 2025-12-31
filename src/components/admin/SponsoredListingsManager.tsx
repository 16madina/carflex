import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Trash2, Calendar, Car, Key } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCountry } from "@/contexts/CountryContext";
import { Badge } from "@/components/ui/badge";

interface Listing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  seller_id?: string;
  owner_id?: string;
  listing_type: 'sale' | 'rental';
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
  };
}

export const SponsoredListingsManager = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [sponsoredListings, setSponsoredListings] = useState<SponsoredListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    listing_id: "",
    listing_type: "sale" as 'sale' | 'rental',
    duration_days: 30,
  });
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
    // Récupérer les annonces de vente
    const { data: saleData } = await supabase
      .from("sale_listings")
      .select("id, brand, model, year, price, seller_id")
      .order("created_at", { ascending: false })
      .limit(50);

    // Récupérer les annonces de location
    const { data: rentalData } = await supabase
      .from("rental_listings")
      .select("id, brand, model, year, price_per_day, owner_id")
      .order("created_at", { ascending: false })
      .limit(50);

    const saleListings = (saleData || []).map(listing => ({
      ...listing,
      price: listing.price,
      listing_type: 'sale' as const,
      seller_id: listing.seller_id
    }));

    const rentalListings = (rentalData || []).map(listing => ({
      ...listing,
      price: listing.price_per_day,
      listing_type: 'rental' as const,
      owner_id: listing.owner_id
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
          .select("brand, model, year, price")
          .eq("id", sponsored.listing_id)
          .single();
        listingDetails = saleData;
      } else {
        const { data: rentalData } = await supabase
          .from("rental_listings")
          .select("brand, model, year, price_per_day")
          .eq("id", sponsored.listing_id)
          .single();
        if (rentalData) {
          listingDetails = {
            ...rentalData,
            price: rentalData.price_per_day
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.listing_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une annonce",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Trouver l'annonce sélectionnée
    const selectedListing = listings.find(l => l.id === formData.listing_id);
    if (!selectedListing) {
      toast({
        title: "Erreur",
        description: "Annonce non trouvée",
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

    // Vérifier si l'annonce n'est pas déjà sponsorisée
    const alreadySponsored = sponsoredListings.find(
      s => s.listing_id === formData.listing_id && s.is_active
    );
    
    if (alreadySponsored) {
      toast({
        title: "Erreur",
        description: "Cette annonce est déjà sponsorisée",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Créer un package temporaire gratuit ou utiliser un existant
    let packageId: string;
    
    // Chercher un package gratuit existant
    const { data: freePackage } = await supabase
      .from("premium_packages")
      .select("id")
      .eq("name", "Sponsorisé Gratuit")
      .single();

    if (freePackage) {
      packageId = freePackage.id;
    } else {
      // Créer un package gratuit
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
    endDate.setDate(endDate.getDate() + formData.duration_days);

    const { error } = await supabase
      .from("premium_listings")
      .insert([{
        listing_id: formData.listing_id,
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
      description: `L'annonce est maintenant sponsorisée pour ${formData.duration_days} jours`
    });

    setFormData({ listing_id: "", listing_type: "sale", duration_days: 30 });
    await fetchSponsoredListings();
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
    await fetchSponsoredListings();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
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
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Sponsoriser une annonce
          </CardTitle>
          <CardDescription>
            Ajoutez gratuitement une annonce aux annonces sponsorisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Type d'annonce</Label>
              <Select
                value={formData.listing_type}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  listing_type: value as 'sale' | 'rental', 
                  listing_id: "" 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type" />
                </SelectTrigger>
                <SelectContent>
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

            <div>
              <Label>Sélectionner une annonce</Label>
              <Select
                value={formData.listing_id}
                onValueChange={(value) => setFormData({ ...formData, listing_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une annonce" />
                </SelectTrigger>
                <SelectContent>
                  {listings
                    .filter((listing) => listing.listing_type === formData.listing_type)
                    .map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.year} {listing.brand} {listing.model} - {formatPrice(listing.price)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Durée (jours)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              <Megaphone className="mr-2 h-4 w-4" />
              {submitting ? "Sponsorisation..." : "Sponsoriser gratuitement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Annonces sponsorisées actives
        </h2>
        
        {sponsoredListings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune annonce sponsorisée pour le moment
            </CardContent>
          </Card>
        ) : (
          sponsoredListings.map((sponsored) => (
            <Card key={sponsored.id} className={isExpired(sponsored.end_date) ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {sponsored.listing 
                        ? `${sponsored.listing.year} ${sponsored.listing.brand} ${sponsored.listing.model}`
                        : "Annonce supprimée"
                      }
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {sponsored.listing_type === 'sale' ? (
                        <Badge variant="secondary" className="text-xs">
                          <Car className="h-3 w-3 mr-1" />
                          Vente
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          Location
                        </Badge>
                      )}
                      {sponsored.listing && (
                        <span className="text-sm font-medium text-primary">
                          {formatPrice(sponsored.listing.price)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleRemoveSponsorship(sponsored.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(sponsored.start_date)} → {formatDate(sponsored.end_date)}
                  </span>
                  {isExpired(sponsored.end_date) && (
                    <Badge variant="destructive" className="text-xs">Expiré</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
