import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MapPin, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CAR_BRANDS, BODY_TYPES, AVAILABLE_DOCUMENTS, CAR_MODELS } from "@/constants/vehicles";

const SellForm = () => {
  const navigate = useNavigate();
  const { selectedCountry, convertPrice, formatPrice } = useCountry();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: "",
    price: "",
    transmission: "automatic",
    fuel_type: "petrol",
    condition: "used",
    description: "",
    city: "",
    country: selectedCountry.name,
    latitude: null as number | null,
    longitude: null as number | null,
    // Nouveaux champs
    accidents: "0",
    clean_title: true,
    documents_available: [] as string[],
    customs_cleared: false,
    previous_owners: "1",
    exterior_color: "",
    interior_color: "",
    body_type: "",
    features: [] as string[],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour poster une annonce");
        navigate("/auth");
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 10) {
      toast.error("Maximum 10 images autorisées");
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const getLocation = () => {
    setGeoLoading(true);
    
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success("Localisation obtenue avec succès !");
        setGeoLoading(false);
      },
      (error) => {
        toast.error("Impossible d'obtenir votre localisation");
        setGeoLoading(false);
      }
    );
  };

  const uploadImages = async () => {
    const imageUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}_${i}.${file.name.split(".").pop()}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const handleDocumentToggle = (doc: string) => {
    setFormData(prev => ({
      ...prev,
      documents_available: prev.documents_available.includes(doc)
        ? prev.documents_available.filter(d => d !== doc)
        : [...prev.documents_available, doc]
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (images.length === 0) {
      toast.error("Veuillez ajouter au moins une image");
      return;
    }

    setLoading(true);

    try {
      // Upload images
      const imageUrls = await uploadImages();

      // Convert price from selected currency to base XOF
      const priceInXOF = convertPrice(parseFloat(formData.price), selectedCountry.currency);

      // Insert listing
      const { error } = await supabase
        .from("sale_listings")
        .insert({
          seller_id: user.id,
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          mileage: parseInt(formData.mileage),
          price: priceInXOF,
          transmission: formData.transmission as "automatic" | "manual",
          fuel_type: formData.fuel_type as "petrol" | "diesel" | "electric" | "hybrid",
          condition: formData.condition as "new" | "used" | "certified",
          description: formData.description,
          city: formData.city,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
          images: imageUrls,
          accidents: parseInt(formData.accidents),
          clean_title: formData.clean_title,
          previous_owners: parseInt(formData.previous_owners),
          exterior_color: formData.exterior_color,
          interior_color: formData.interior_color,
          body_type: formData.body_type,
          features: formData.features,
        });

      if (error) throw error;

      toast.success("Annonce créée avec succès !");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de l'annonce");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const availableModels = formData.brand ? CAR_MODELS[formData.brand] || [] : [];

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

        <Card className="max-w-2xl mx-auto shadow-elevated">
          <CardHeader>
            <CardTitle className="text-3xl">Vendre mon véhicule</CardTitle>
            <CardDescription>
              Remplissez les informations de votre véhicule à vendre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations du véhicule</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marque *</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData({ ...formData, brand: value, model: "" })}
                      required
                    >
                      <SelectTrigger id="brand">
                        <SelectValue placeholder="Sélectionnez une marque" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {CAR_BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Modèle *</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) => setFormData({ ...formData, model: value })}
                      required
                      disabled={!formData.brand}
                    >
                      <SelectTrigger id="model">
                        <SelectValue placeholder={formData.brand ? "Sélectionnez un modèle" : "Choisissez d'abord une marque"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Année *</Label>
                    <Select
                      value={formData.year.toString()}
                      onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                    >
                      <SelectTrigger id="year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Kilométrage *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="50000"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      required
                      onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Veuillez renseigner le kilométrage')}
                      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix ({selectedCountry.currencySymbol}) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Entrez votre prix"
                    min="1"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Veuillez renseigner le prix')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aucune limite de prix - Les prix sont enregistrés en CFA et convertis automatiquement
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                    >
                      <SelectTrigger id="transmission">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatique</SelectItem>
                        <SelectItem value="manual">Manuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Carburant *</Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                    >
                      <SelectTrigger id="fuel_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Essence</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Électrique</SelectItem>
                        <SelectItem value="hybrid">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">État *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger id="condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neuf</SelectItem>
                      <SelectItem value="used">Occasion</SelectItem>
                      <SelectItem value="certified">Certifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="body_type">Type de carrosserie</Label>
                    <Select
                      value={formData.body_type}
                      onValueChange={(value) => setFormData({ ...formData, body_type: value })}
                    >
                      <SelectTrigger id="body_type">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exterior_color">Couleur extérieure</Label>
                    <Input
                      id="exterior_color"
                      placeholder="Noir"
                      value={formData.exterior_color}
                      onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interior_color">Couleur intérieure</Label>
                  <Input
                    id="interior_color"
                    placeholder="Beige"
                    value={formData.interior_color}
                    onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre véhicule..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Historique et Documents */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Historique et Documents</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accidents">Nombre d'accidents *</Label>
                    <Select
                      value={formData.accidents}
                      onValueChange={(value) => setFormData({ ...formData, accidents: value })}
                    >
                      <SelectTrigger id="accidents">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucun accident</SelectItem>
                        <SelectItem value="1">1 accident</SelectItem>
                        <SelectItem value="2">2 accidents</SelectItem>
                        <SelectItem value="3">3 accidents ou plus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previous_owners">Propriétaires précédents *</Label>
                    <Select
                      value={formData.previous_owners}
                      onValueChange={(value) => setFormData({ ...formData, previous_owners: value })}
                    >
                      <SelectTrigger id="previous_owners">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1er propriétaire</SelectItem>
                        <SelectItem value="2">2 propriétaires</SelectItem>
                        <SelectItem value="3">3 propriétaires</SelectItem>
                        <SelectItem value="4">4 propriétaires ou plus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Documents disponibles</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_DOCUMENTS.map((doc) => (
                      <div key={doc} className="flex items-center space-x-2">
                        <Checkbox
                          id={doc}
                          checked={formData.documents_available.includes(doc)}
                          onCheckedChange={() => handleDocumentToggle(doc)}
                        />
                        <label
                          htmlFor={doc}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {doc}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="customs_cleared"
                    checked={formData.customs_cleared}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, customs_cleared: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="customs_cleared"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Véhicule dédouané
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clean_title"
                    checked={formData.clean_title}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, clean_title: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="clean_title"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Titre de propriété clair
                  </label>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Localisation</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    placeholder="Paris"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Veuillez renseigner la ville')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={getLocation}
                  disabled={geoLoading}
                  className="w-full"
                >
                  {geoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Localisation...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      {formData.latitude ? "Localisation obtenue ✓" : "Obtenir ma position GPS"}
                    </>
                  )}
                </Button>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Photos *</h3>
                
                <div className="space-y-3">
                  <Label
                    htmlFor="images"
                    className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Cliquez pour ajouter des photos (max 10)
                      </p>
                    </div>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publication...
                  </>
                ) : (
                  "Publier l'annonce"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default SellForm;
