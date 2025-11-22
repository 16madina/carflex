import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Star, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [preferences, setPreferences] = useState({
    test_drive_enabled: true,
    message_enabled: true,
    booking_enabled: true,
    email_enabled: true,
    push_enabled: true
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
    await loadPreferences(user.id);
    setLoading(false);
  };

  const loadPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPreferences({
          test_drive_enabled: data.test_drive_enabled,
          message_enabled: data.message_enabled,
          booking_enabled: data.booking_enabled,
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          test_drive_enabled: preferences.test_drive_enabled,
          message_enabled: preferences.message_enabled,
          booking_enabled: preferences.booking_enabled,
          email_enabled: preferences.email_enabled,
          push_enabled: preferences.push_enabled
        });

      if (error) throw error;

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
          onClick={() => navigate(-1)}
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
                      checked={preferences.message_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, message_enabled: checked }))
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
                      checked={preferences.booking_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, booking_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="test_drive" className="cursor-pointer">
                          Essais
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Demandes et confirmations d'essai
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="test_drive"
                      checked={preferences.test_drive_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, test_drive_enabled: checked }))
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
                      checked={preferences.email_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, email_enabled: checked }))
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
                      checked={preferences.push_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, push_enabled: checked }))
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
