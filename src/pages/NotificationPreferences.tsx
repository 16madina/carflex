import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, MessageSquare, Star, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [preferences, setPreferences] = useState({
    messages: true,
    bookings: true,
    reviews: true,
    payments: true,
    promotions: false,
    email_notifications: true,
    push_notifications: true
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
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // TODO: Sauvegarder les préférences dans une table dédiée
      toast.success("Préférences mises à jour avec succès");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating preferences:", error);
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
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Choisissez les notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Types de notifications */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Types de notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="messages" className="cursor-pointer">
                          Messages
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Nouveaux messages des autres utilisateurs
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="messages"
                      checked={preferences.messages}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, messages: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="bookings" className="cursor-pointer">
                          Réservations
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Demandes et confirmations de réservation
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="bookings"
                      checked={preferences.bookings}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, bookings: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="reviews" className="cursor-pointer">
                          Avis
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Nouveaux avis sur vos annonces
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="reviews"
                      checked={preferences.reviews}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, reviews: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="payments" className="cursor-pointer">
                          Paiements
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Confirmations et reçus de paiement
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="payments"
                      checked={preferences.payments}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, payments: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="promotions" className="cursor-pointer">
                          Promotions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Offres spéciales et nouveautés
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="promotions"
                      checked={preferences.promotions}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, promotions: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Canaux de notification */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium">Canaux de notification</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications" className="cursor-pointer">
                        Notifications par email
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Recevoir les notifications par email
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, email_notifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push_notifications" className="cursor-pointer">
                        Notifications push
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Recevoir les notifications sur l'application
                      </p>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={preferences.push_notifications}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, push_notifications: checked }))
                      }
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer les préférences"}
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

export default NotificationPreferences;
