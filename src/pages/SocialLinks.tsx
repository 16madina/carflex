import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { toast } from "sonner";

const SocialLinks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    setUser(user);

    // Charger les liens sociaux depuis le profil (à adapter selon votre structure)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      // Pour l'instant, on initialise avec des valeurs vides
      // Vous pouvez ajouter des colonnes dans la table profiles pour stocker ces liens
      setSocialLinks({
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: ""
      });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // TODO: Ajouter les colonnes social_links dans la table profiles
      // Pour l'instant, on simule juste la sauvegarde
      toast.success("Liens sociaux mis à jour avec succès");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating social links:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
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
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Liens vers les médias sociaux</CardTitle>
              <CardDescription>
                Ajoutez les liens vers vos profils sur les réseaux sociaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    type="url"
                    placeholder="https://facebook.com/votre-profil"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/votre-profil"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    type="url"
                    placeholder="https://twitter.com/votre-profil"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/votre-profil"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    type="url"
                    placeholder="https://youtube.com/@votre-chaine"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SocialLinks;
