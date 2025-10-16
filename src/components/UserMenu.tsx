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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, LogOut, LogIn, UserCircle, Calendar, Crown, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

const UserMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pendingBookings, setPendingBookings] = useState(0);

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt={profile?.first_name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
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
              {profile?.email}
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
          <Crown className="mr-2 h-4 w-4 text-primary" />
          Plan Pro
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
