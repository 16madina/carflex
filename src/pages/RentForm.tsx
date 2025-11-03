import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCountry, WEST_AFRICAN_COUNTRIES } from "@/contexts/CountryContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CitySelector from "@/components/CitySelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MapPin, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CAR_BRANDS, BODY_TYPES, CAR_MODELS } from "@/constants/vehicles";
import { validateImageFiles } from "@/lib/fileValidation";

const AVAILABLE_FEATURES = [
  "Climatisation", "GPS", "Bluetooth", "Sièges chauffants",
  "Toit ouvrant", "Caméra de recul", "Système audio premium",
  "Régulateur de vitesse", "Volant réglable", "Vitres électriques"
];

const RentForm = () => {
  const navigate = useNavigate();
  const { selectedCountry, convertPrice } = useCountry();
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
    price_per_day: "",
    transmission: "automatic",
    fuel_type: "petrol",
    description: "",
    city: "",
    country: selectedCountry.name,
    latitude: null as number | null,
    longitude: null as number | null,
    features: [] as string[],
    body_type: "",
    exterior_color: "",
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
    
    // Validate files
    const validation = validateImageFiles(files, images.length);
    if (!validation.valid) {
      toast.error(validation.error || "Fichiers invalides");
      e.target.value = ''; // Reset input
      return;
    }

    setImages([...images, ...files]);
    
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
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Reverse geocoding avec Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`
          );
          
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération de l'adresse");
          }

          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
          const detectedCountry = data.address.country || "";
          const countryCode = data.address.country_code?.toUpperCase() || "";

          // Trouver le pays correspondant dans notre liste
          const matchingCountry = WEST_AFRICAN_COUNTRIES.find(
            c => c.code === countryCode || c.name === detectedCountry
          );

          setFormData({
            ...formData,
            latitude: lat,
            longitude: lon,
            city: city,
            country: matchingCountry?.name || formData.country,
          });

          if (matchingCountry) {
            toast.success(`Localisation détectée : ${city}, ${matchingCountry.name}. Vous pouvez modifier si le véhicule est ailleurs.`);
          } else {
            toast.success(`Position GPS obtenue. Veuillez sélectionner le pays où se trouve le véhicule.`);
          }
        } catch (error) {
          // Si le reverse geocoding échoue, on garde quand même les coordonnées
          setFormData({
            ...formData,
            latitude: lat,
            longitude: lon,
          });
          toast.success("Coordonnées GPS obtenues. Veuillez sélectionner le pays et la ville du véhicule.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        toast.error("Impossible d'obtenir votre localisation. Vérifiez les autorisations.");
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

      // TODO: Migrer vers bucket "vehicle-images" - voir MIGRATION_GUIDE.md
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
      const imageUrls = await uploadImages();
      const priceInXOF = convertPrice(parseFloat(formData.price_per_day), selectedCountry.currency);

      const { error } = await supabase
        .from("rental_listings")
        .insert({
          owner_id: user.id,
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          mileage: parseInt(formData.mileage),
          price_per_day: priceInXOF,
          transmission: formData.transmission as "automatic" | "manual",
          fuel_type: formData.fuel_type as "petrol" | "diesel" | "electric" | "hybrid",
          description: formData.description,
          city: formData.city,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
          images: imageUrls,
          features: formData.features,
          body_type: formData.body_type || null,
        });

      if (error) throw error;

      toast.success("Annonce de location créée avec succès !");
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

      <main className="container mx-auto px-4 pt-24 pb-6">
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
            <CardTitle className="text-3xl">Louer mon véhicule</CardTitle>
            <CardDescription>
              Remplissez les informations de votre véhicule à louer
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
                  <Label htmlFor="price_per_day">Prix par jour ({selectedCountry.currencySymbol}) *</Label>
                  <Input
                    id="price_per_day"
                    type="number"
                    placeholder="Entrez votre prix"
                    min="1"
                    step="1"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Veuillez renseigner le prix par jour')}
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
                    <Label htmlFor="exterior_color">Couleur</Label>
                    <Input
                      id="exterior_color"
                      placeholder="Noir"
                      value={formData.exterior_color}
                      onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Équipements</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={() => handleFeatureToggle(feature)}
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
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

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Localisation du véhicule</h3>
                <p className="text-sm text-muted-foreground">
                  Où se trouve physiquement le véhicule ? (Peut être différent de votre position actuelle)
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value, city: "" })}
                    required
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Sélectionnez le pays du véhicule" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {WEST_AFRICAN_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <CitySelector
                  country={WEST_AFRICAN_COUNTRIES.find(c => c.name === formData.country)?.code || ""}
                  value={formData.city}
                  onChange={(value) => setFormData({ ...formData, city: value })}
                  required
                />

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
                <p className="text-xs text-muted-foreground">
                  Le GPS détecte automatiquement le pays et la ville, mais vous pouvez les modifier manuellement
                </p>
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

export default RentForm;
