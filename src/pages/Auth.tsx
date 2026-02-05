import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Car, Upload, Eye, EyeOff, ArrowLeft, User, Mail, Lock, MapPin, Phone, Briefcase, Check, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { WEST_AFRICAN_COUNTRIES, Country } from "@/contexts/CountryContext";
import CitySelector from "@/components/CitySelector";
import FlagIcon from "@/components/FlagIcon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { validateImageFile } from "@/lib/fileValidation";
import { validatePassword } from "@/lib/passwordValidation";
import { TermsDialog } from "@/components/TermsDialog";
import { PrivacyDialog } from "@/components/PrivacyDialog";
import { ImagePicker } from "@/components/ImagePicker";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppTracking } from "@/hooks/useAppTracking";
import { motion, AnimatePresence } from "framer-motion";
import heroCarsImage from "@/assets/hero-cars.jpg";

// Régions de pays pour le sélecteur d'inscription
const COUNTRY_REGIONS: { name: string; codes: string[] }[] = [
  {
    name: "Afrique de l'Ouest",
    codes: ['CI', 'SN', 'BJ', 'BF', 'ML', 'NE', 'TG', 'GW', 'GN', 'NG', 'GH', 'SL', 'LR', 'GM', 'CV', 'MR']
  },
  {
    name: "Afrique Centrale",
    codes: ['CM', 'CG', 'GA', 'TD', 'CF', 'GQ', 'CD', 'ST', 'AO']
  },
  {
    name: "Afrique de l'Est",
    codes: ['KE', 'TZ', 'UG', 'RW', 'BI', 'ET', 'ER', 'DJ', 'SO', 'SS', 'SD']
  },
  {
    name: "Afrique Australe",
    codes: ['ZA', 'BW', 'NA', 'ZM', 'ZW', 'MW', 'MZ', 'SZ', 'LS']
  },
  {
    name: "Afrique du Nord",
    codes: ['MA', 'DZ', 'TN', 'LY', 'EG']
  },
  {
    name: "Océan Indien",
    codes: ['MG', 'MU', 'KM', 'SC']
  },
  {
    name: "Europe & Amérique",
    codes: ['FR', 'BE', 'CH', 'CA', 'US', 'GB', 'DE', 'IT', 'ES', 'PT', 'NL']
  }
];

const getCountriesByRegion = (regionCodes: string[]): Country[] => {
  return WEST_AFRICAN_COUNTRIES.filter(country => regionCodes.includes(country.code));
};

// Étapes du formulaire d'inscription
const SIGNUP_STEPS = [
  { id: 1, label: "Photo", icon: Camera },
  { id: 2, label: "Identité", icon: User },
  { id: 3, label: "Contact", icon: Mail },
  { id: 4, label: "Localisation", icon: MapPin },
  { id: 5, label: "Finalisation", icon: Check },
];

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showATTDialog, setShowATTDialog] = useState(false);
  const { requestTrackingPermission } = useAppTracking();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    country: WEST_AFRICAN_COUNTRIES[1].code,
    city: "",
    userType: "buyer" as "buyer" | "seller" | "agent" | "dealer",
    companyName: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  // Calcul de la progression du formulaire
  const signupProgress = useMemo(() => {
    let completed = 0;
    if (avatarFile) completed++;
    if (signupData.firstName && signupData.lastName) completed++;
    if (signupData.email && signupData.password && signupData.confirmPassword) completed++;
    if (signupData.country && signupData.city && signupData.phone) completed++;
    if (acceptedTerms && signupData.userType) completed++;
    return completed;
  }, [avatarFile, signupData, acceptedTerms]);

  const handleAvatarChange = (files: File[]) => {
    const file = files[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Fichier invalide");
        return;
      }
      
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

      try {
        const { data } = await supabase.functions.invoke('cancel-account-deletion');
        if (data?.was_scheduled) {
          toast.success("Votre suppression de compte a été annulée. Bienvenue de retour !", { duration: 5000 });
        } else {
          toast.success("Connexion réussie !");
        }
      } catch (cancelError) {
        console.error("Erreur lors de l'annulation de la suppression:", cancelError);
        toast.success("Connexion réussie !");
      }

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
    
    if (!avatarFile) {
      toast.error("La photo de profil est obligatoire");
      return;
    }
    
    if (!acceptedTerms) {
      toast.error("Vous devez accepter les Conditions Générales d'Utilisation");
      return;
    }
    
    const passwordValidation = validatePassword(signupData.password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setLoading(true);

    try {
      let avatarUrl = "";

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

      try {
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          await supabase.functions.invoke('send-verification-email', {
            body: {
              userId: newUser.id,
              email: signupData.email,
              firstName: signupData.firstName,
            }
          });
          toast.success("Inscription réussie ! Un email de vérification vous a été envoyé.");
        }
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        toast.warning("Compte créé, mais l'email de vérification n'a pas pu être envoyé.");
      }
      
      setShowATTDialog(true);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Image de fond avec overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroCarsImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/75 backdrop-blur-[2px]" />
      </div>

      {/* Header avec glassmorphism */}
      <header className="relative z-10 border-b border-white/10 bg-background/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <ArrowLeft className="h-6 w-6" />
              </motion.div>
            </Link>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Car className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="bg-gradient-hero bg-clip-text text-transparent">CarFlex</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl border-white/20 bg-background/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent">
                  Bienvenue sur CarFlex
                </CardTitle>
                <CardDescription className="mt-2">
                  Connectez-vous ou créez un compte
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Inscription
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <AnimatePresence mode="wait">
                    {resetMode ? (
                      <motion.form 
                        key="reset"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleResetPassword} 
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            Email
                          </Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            className="bg-background/50"
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
                      </motion.form>
                    ) : (
                      <motion.form 
                        key="login"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        onSubmit={handleLogin} 
                        className="space-y-4"
                      >
                        <motion.div variants={itemVariants} className="space-y-2">
                          <Label htmlFor="login-email" className="flex items-center gap-2">
                            <motion.span
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              className="inline-block"
                            >
                              <Mail className="h-4 w-4 text-primary" />
                            </motion.span>
                            Email
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            required
                            className="bg-background/50"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password" className="flex items-center gap-2">
                              <motion.span
                                whileHover={{ scale: 1.2, rotate: -10 }}
                                className="inline-block"
                              >
                                <Lock className="h-4 w-4 text-primary" />
                              </motion.span>
                              Mot de passe
                            </Label>
                            <button
                              type="button"
                              onClick={() => setResetMode(true)}
                              className="text-sm text-primary hover:underline"
                            >
                              Mot de passe oublié ?
                            </button>
                          </div>
                          <div className="relative">
                            <Input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              required
                              className="bg-background/50"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Connexion..." : "Se connecter"}
                          </Button>
                        </motion.div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="signup">
                  {/* Indicateur de progression */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div className="flex justify-between items-center mb-2">
                      {SIGNUP_STEPS.map((step) => {
                        const isCompleted = signupProgress >= step.id;
                        const Icon = step.icon;
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ scale: 0.8 }}
                            animate={{ 
                              scale: isCompleted ? 1 : 0.8,
                              opacity: isCompleted ? 1 : 0.5
                            }}
                            className="flex flex-col items-center gap-1"
                          >
                            <motion.div
                              animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isCompleted 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                            <span className="text-[10px] text-muted-foreground hidden sm:block">
                              {step.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(signupProgress / 5) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      {signupProgress}/5 étapes complétées
                    </p>
                  </motion.div>

                  <motion.form 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSignup} 
                    className="space-y-4"
                  >
                    {/* Photo de profil */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="avatar" className="flex items-center gap-2">
                        <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                          <Camera className="h-4 w-4 text-primary" />
                        </motion.span>
                        Photo de profil <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Avatar className="h-20 w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                            {avatarPreview ? (
                              <AvatarImage src={avatarPreview} alt="Avatar preview" />
                            ) : (
                              <AvatarFallback className="bg-muted">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </motion.div>
                        <div className="flex-1">
                          <ImagePicker
                            onImageSelect={handleAvatarChange}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG ou WEBP (max. 5MB)
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Nom et prénom */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname" className="flex items-center gap-2">
                          <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                            <User className="h-4 w-4 text-primary" />
                          </motion.span>
                          Prénom <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="signup-firstname"
                          placeholder="Jean"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                          required
                          className="bg-background/50"
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
                          className="bg-background/50"
                        />
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center gap-2">
                        <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                          <Mail className="h-4 w-4 text-primary" />
                        </motion.span>
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                        className="bg-background/50"
                      />
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="signup-password" className="flex items-center gap-2">
                        <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                          <Lock className="h-4 w-4 text-primary" />
                        </motion.span>
                        Mot de passe <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          className="bg-background/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirmer mot de passe */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Retaper le mot de passe <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                          className="bg-background/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Pays et Ville */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-country" className="flex items-center gap-2">
                          <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                            <MapPin className="h-4 w-4 text-primary" />
                          </motion.span>
                          Pays <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={signupData.country}
                          onValueChange={(value) => setSignupData({ ...signupData, country: value, city: "" })}
                          required
                        >
                          <SelectTrigger id="signup-country" className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <ScrollArea className="h-[300px]">
                              {COUNTRY_REGIONS.map((region, index) => {
                                const countries = getCountriesByRegion(region.codes);
                                if (countries.length === 0) return null;
                                
                                return (
                                  <SelectGroup key={region.name}>
                                    {index > 0 && <SelectSeparator />}
                                    <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                                      {region.name}
                                    </SelectLabel>
                                    {countries.map((country) => (
                                      <SelectItem key={country.code} value={country.code}>
                                        <span className="flex items-center gap-2">
                                          <FlagIcon countryCode={country.code} className="w-5 h-4" />
                                          <span>{country.name}</span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                );
                              })}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>
                      <CitySelector
                        country={signupData.country}
                        value={signupData.city}
                        onChange={(city) => setSignupData({ ...signupData, city })}
                        required
                      />
                    </motion.div>

                    {/* Téléphone */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="signup-phone" className="flex items-center gap-2">
                        <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                          <Phone className="h-4 w-4 text-primary" />
                        </motion.span>
                        Téléphone <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                          <FlagIcon countryCode={signupData.country} className="w-5 h-4" />
                          <span className="text-sm text-muted-foreground">
                            {WEST_AFRICAN_COUNTRIES.find(c => c.code === signupData.country)?.dialCode}
                          </span>
                        </div>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="01 23 45 67 89"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          className="pl-24 bg-background/50"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Type d'utilisateur */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="signup-usertype" className="flex items-center gap-2">
                        <motion.span whileHover={{ scale: 1.2 }} className="inline-block">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </motion.span>
                        Type d'utilisateur <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={signupData.userType}
                        onValueChange={(value: any) => setSignupData({ ...signupData, userType: value })}
                        required
                      >
                        <SelectTrigger id="signup-usertype" className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Acheteur</SelectItem>
                          <SelectItem value="seller">Vendeur</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="dealer">Concessionnaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Nom de l'entreprise / Agence */}
                    <AnimatePresence>
                      {(signupData.userType === "seller" || signupData.userType === "dealer" || signupData.userType === "agent") && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <Label htmlFor="signup-company">
                            {signupData.userType === "agent" ? "Nom de l'agence / Parc auto" : "Nom de l'entreprise"} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="signup-company"
                            placeholder={signupData.userType === "agent" ? "Auto Prestige Dakar" : "Mon Garage SARL"}
                            value={signupData.companyName}
                            onChange={(e) => setSignupData({ ...signupData, companyName: e.target.value })}
                            required
                            className="bg-background/50"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CGU */}
                    <motion.div variants={itemVariants} className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        J'accepte les{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsDialog(true)}
                          className="text-primary underline hover:no-underline"
                        >
                          Conditions Générales d'Utilisation
                        </button>{" "}
                        et la{" "}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyDialog(true)}
                          className="text-primary underline hover:no-underline"
                        >
                          Politique de Confidentialité
                        </button>
                        <span className="text-destructive ml-1">*</span>
                      </label>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        className="w-full relative overflow-hidden group" 
                        disabled={loading || !acceptedTerms}
                      >
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                        <span className="relative">
                          {loading ? "Inscription..." : "S'inscrire"}
                        </span>
                      </Button>
                    </motion.div>
                  </motion.form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <TermsDialog open={showTermsDialog} onOpenChange={setShowTermsDialog} />
      <PrivacyDialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog} />
      
      {/* App Tracking Transparency Dialog */}
      <AlertDialog open={showATTDialog} onOpenChange={setShowATTDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confidentialité des données</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                CarFlex collecte des informations de base (email, nom, téléphone) 
                uniquement pour le fonctionnement de l'application :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Créer et gérer votre compte</li>
                <li>Permettre la messagerie entre utilisateurs</li>
                <li>Gérer vos annonces et réservations</li>
              </ul>
              <p className="font-semibold mt-2">
                Aucun suivi publicitaire n'est effectué.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={async () => {
            await requestTrackingPermission();
            setShowATTDialog(false);
            navigate("/");
          }}>
            J'ai compris
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auth;
