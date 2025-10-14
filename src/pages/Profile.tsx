import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Crown, ShoppingCart, Store, UserCheck, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (roles && roles.length > 0) {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
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
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <UserIcon className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
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
                  <p className="text-muted-foreground">{profile?.email}</p>
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
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Mes Annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-6">
                Vous n'avez pas encore d'annonces
              </p>
              <Button className="w-full" onClick={() => navigate("/sell")}>
                Créer une annonce
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
