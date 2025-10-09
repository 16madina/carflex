import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    country: "",
    company_name: "",
    avatar_url: ""
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

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
        city: profileData.city || "",
        country: profileData.country || "",
        company_name: profileData.company_name || "",
        avatar_url: profileData.avatar_url || ""
      });
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Photo uploadée avec succès");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Erreur lors de l'upload de la photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          city: formData.city,
          country: formData.country,
          company_name: formData.company_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
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

      <main className="container mx-auto px-4 py-6">
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
              <CardTitle>Modifier mon profil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-smooth">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Upload en cours..." : "Changer la photo"}
                    </div>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </Label>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Entreprise (optionnel)</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
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

export default ProfileEdit;
