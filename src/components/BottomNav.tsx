import { Link, useLocation } from "react-router-dom";
import { Home, Car, PlusCircle, MessageSquare, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    { path: "/", icon: Home, label: "Accueil", gradient: "from-primary to-primary/70" },
    { path: "/listings", icon: Car, label: "Acheter", gradient: "from-primary/80 to-primary/50" },
    { path: "/sell", icon: PlusCircle, label: "Poster", isCenter: true, gradient: "from-primary to-primary/70" },
    { path: "/messages", icon: MessageSquare, label: "Messages", showBadge: true, gradient: "from-primary/90 to-primary/60" },
    { path: "/profile", icon: UserCircle, label: "Profil", gradient: "from-accent to-accent/70" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const bounceAnimation = {
    tap: { 
      scale: [1, 0.85, 1.2, 0.95, 1],
      transition: { duration: 0.4, ease: "easeInOut" as const }
    }
  };

  const centerBounceAnimation = {
    tap: { 
      scale: [1, 0.88, 1.15, 1],
      y: [0, 3, -6, 0],
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50" 
      style={{ touchAction: 'none' }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]" />
      
      {/* Liquid gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div 
        className="relative flex items-center justify-around px-2 pb-safe-bottom" 
        style={{ height: 'max(70px, calc(70px + env(safe-area-inset-bottom)))' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isCenter) {
            return (
              <Link key={item.path} to={item.path} className="relative -top-5">
                <motion.div
                  whileTap="tap"
                  variants={centerBounceAnimation}
                  className="relative"
                >
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 blur-xl scale-150 animate-pulse" />
                  
                  {/* Main button container */}
                  <div className={cn(
                    "relative h-16 w-16 rounded-full",
                    "bg-gradient-to-br from-primary via-primary to-primary/80",
                    "shadow-[0_8px_32px_rgba(var(--primary),0.4)]",
                    "flex items-center justify-center",
                    "transition-shadow duration-300",
                    "hover:shadow-[0_12px_40px_rgba(var(--primary),0.5)]"
                  )}>
                    {/* Inner glassmorphism layer */}
                    <div className="absolute inset-1 rounded-full bg-white/20 backdrop-blur-sm" />
                    
                    {/* Icon */}
                    <Icon className="relative h-7 w-7 text-primary-foreground drop-shadow-lg" strokeWidth={2.5} />
                  </div>
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 relative group"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Active background glow */}
              {active && (
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-20",
                  `bg-gradient-to-br ${item.gradient}`,
                  "blur-md"
                )} />
              )}
              
              {/* Icon container with bounce animation */}
              <motion.div 
                className="relative"
                whileTap="tap"
                variants={bounceAnimation}
              >
                {/* Glassmorphism icon background */}
                <div className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-300",
                  active 
                    ? "bg-white/30 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white/30" 
                    : "group-hover:bg-white/20 group-hover:backdrop-blur-sm"
                )}>
                  {/* Gradient overlay for active state */}
                  {active && (
                    <div className={cn(
                      "absolute inset-0 rounded-xl opacity-30",
                      `bg-gradient-to-br ${item.gradient}`
                    )} />
                  )}
                  
                  <Icon 
                    className={cn(
                      "relative h-5 w-5 transition-all duration-300",
                      active 
                        ? "text-primary drop-shadow-sm" 
                        : "text-muted-foreground group-hover:text-foreground"
                    )} 
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                
                {/* Notification badge */}
                {item.showBadge && unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shadow-lg border-2 border-background animate-pulse"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                
                {/* Active indicator dot */}
                {active && (
                  <motion.div 
                    className={cn(
                      "absolute -bottom-1 left-1/2 -translate-x-1/2",
                      "w-1.5 h-1.5 rounded-full",
                      `bg-gradient-to-r ${item.gradient}`,
                      "shadow-sm"
                    )}
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-300",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;