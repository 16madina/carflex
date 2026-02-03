import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, LogOut, LogIn, UserCircle, Calendar, Crown, BadgeCheck, AlertCircle } from "lucide-react";
import AvatarWithBadge from "@/components/AvatarWithBadge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const UserMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPendingBookings(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPendingBookings(session.user.id);
      } else {
        setProfile(null);
        setPendingBookings(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    setProfile(data);
  };

  const fetchPendingBookings = async (userId: string) => {
    const { count } = await supabase
      .from("rental_bookings")
      .select("*", { count: 'exact', head: true })
      .eq("owner_id", userId)
      .eq("status", "pending");
    
    setPendingBookings(count || 0);

    // Subscribe to real-time updates
    const channel = supabase
      .channel('pending-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_bookings',
          filter: `owner_id=eq.${userId}`
        },
        () => {
          // Refetch count when changes occur
          supabase
            .from("rental_bookings")
            .select("*", { count: 'exact', head: true })
            .eq("owner_id", userId)
            .eq("status", "pending")
            .then(({ count }) => setPendingBookings(count || 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReportIssue = async () => {
    if (!reportSubject.trim() || !reportMessage.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setSubmittingReport(true);
    try {
      const { error } = await supabase.functions.invoke("report-issue", {
        body: {
          userEmail: profile?.email || user?.email,
          userName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || "Utilisateur",
          subject: reportSubject,
          message: reportMessage,
        },
      });

      if (error) throw error;

      toast.success("Problème signalé avec succès");
      setReportDialogOpen(false);
      setReportSubject("");
      setReportMessage("");
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast.error("Erreur lors de l'envoi du signalement");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  if (!user) {
    return (
      <Button variant="default" onClick={() => navigate("/auth")}>
        <LogIn className="h-4 w-4 mr-2" />
        Se connecter
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <AvatarWithBadge
              src={profile?.avatar_url}
              alt={profile?.first_name || "User"}
              fallback={<User className="h-5 w-5" />}
              userId={user?.id}
            />
            {pendingBookings > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                {pendingBookings}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-background" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.first_name} {profile?.last_name}
                </p>
                {profile?.email_verified && (
                  <BadgeCheck className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {profile?.email || user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/bookings")}>
            <Calendar className="mr-2 h-4 w-4" />
            <span className="flex-1">Mes réservations</span>
            {pendingBookings > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingBookings}
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <UserCircle className="mr-2 h-4 w-4" />
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/subscription")}>
            <Crown className="mr-2 h-4 w-4" />
            Plan Pro
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Signaler un problème
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un problème</DialogTitle>
            <DialogDescription>
              Décrivez le problème que vous rencontrez et nous vous répondrons rapidement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                placeholder="Ex: Problème de paiement"
                value={reportSubject}
                onChange={(e) => setReportSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Description</Label>
              <Textarea
                id="message"
                placeholder="Décrivez votre problème en détail..."
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleReportIssue} disabled={submittingReport}>
              {submittingReport ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserMenu;
