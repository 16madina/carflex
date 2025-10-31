import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Plus, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BottomNav = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

      if (!conversations) return;

      const conversationIds = conversations.map(c => c.id);
      
      const { count } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .in("conversation_id", conversationIds)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/listings", icon: ShoppingCart, label: "Acheter" },
    { path: "/sell", icon: Plus, label: "Poster", isCenter: true },
    { path: "/messages", icon: MessageCircle, label: "Messages", showBadge: true },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t shadow-material-xl">
      <div className="flex items-center justify-around px-2 pb-safe-bottom" style={{ height: 'max(60px, calc(60px + env(safe-area-inset-bottom)))' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isCenter) {
            return (
              <Link key={item.path} to={item.path} className="relative -top-6">
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-gradient-hero shadow-material-xl hover:scale-110 active:scale-95 transition-all"
                  aria-label={item.label}
                >
                  <Icon className="h-7 w-7" />
                </Button>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl
                transition-all duration-300 relative min-h-[48px] min-w-[48px] active-press
                ${
                  active
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <div className={`p-2 rounded-xl ${active ? 'glass-morphism' : ''}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {item.showBadge && unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shadow-material"
                  >
                    {unreadCount}
                  </Badge>
                )}
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
