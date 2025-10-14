import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Car, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { WEST_AFRICAN_COUNTRIES } from "@/contexts/CountryContext";
import CitySelector from "@/components/CitySelector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    country: WEST_AFRICAN_COUNTRIES[0].code,
    city: "",
    userType: "buyer" as "buyer" | "seller" | "agent" | "dealer",
    companyName: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast.success("Connexion réussie !");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success("Email de réinitialisation envoyé ! Vérifiez votre boîte mail.");
      setResetMode(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = "";

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Get the selected country name
      const selectedCountry = WEST_AFRICAN_COUNTRIES.find(c => c.code === signupData.country);

      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            phone: signupData.phone,
            country: selectedCountry?.name || signupData.country,
            city: signupData.city,
            user_type: signupData.userType,
            company_name: signupData.companyName,
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) throw error;

      toast.success("Inscription réussie ! Vous êtes maintenant connecté.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Car className="h-6 w-6 text-primary" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">CarFlex</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Bienvenue sur CarFlex</CardTitle>
            <CardDescription>Connectez-vous ou créez un compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {resetMode ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Entrez votre email pour recevoir un lien de réinitialisation
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setResetMode(false);
                          setResetEmail("");
                        }}
                        disabled={loading}
                      >
                        Retour
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? "Envoi..." : "Envoyer"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Mot de passe</Label>
                        <button
                          type="button"
                          onClick={() => setResetMode(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Photo de profil <span className="text-destructive">*</span></Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt="Avatar preview" />
                        ) : (
                          <AvatarFallback className="bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          required
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG ou WEBP (max. 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">Prénom <span className="text-destructive">*</span></Label>
                      <Input
                        id="signup-firstname"
                        placeholder="Jean"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Nom <span className="text-destructive">*</span></Label>
                      <Input
                        id="signup-lastname"
                        placeholder="Dupont"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-country">Pays <span className="text-destructive">*</span></Label>
                      <Select
                        value={signupData.country}
                        onValueChange={(value) => setSignupData({ ...signupData, country: value, city: "" })}
                        required
                      >
                        <SelectTrigger id="signup-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEST_AFRICAN_COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-2">
                                <span className="text-lg">{country.flag}</span>
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <CitySelector
                      country={signupData.country}
                      value={signupData.city}
                      onChange={(city) => setSignupData({ ...signupData, city })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Téléphone <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+225 01 23 45 67 89"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-usertype">Type d'utilisateur <span className="text-destructive">*</span></Label>
                    <Select
                      value={signupData.userType}
                      onValueChange={(value: any) => setSignupData({ ...signupData, userType: value })}
                      required
                    >
                      <SelectTrigger id="signup-usertype">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Acheteur</SelectItem>
                        <SelectItem value="seller">Vendeur</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="dealer">Concessionnaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(signupData.userType === "seller" || signupData.userType === "dealer") && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-company">Nom de l'entreprise <span className="text-destructive">*</span></Label>
                      <Input
                        id="signup-company"
                        placeholder="Mon Garage SARL"
                        value={signupData.companyName}
                        onChange={(e) => setSignupData({ ...signupData, companyName: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
