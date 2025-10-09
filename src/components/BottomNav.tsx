import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Plus, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/listings", icon: ShoppingCart, label: "Acheter" },
    { path: "/sell", icon: Plus, label: "Poster", isCenter: true },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-elevated">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isCenter) {
            return (
              <Link key={item.path} to={item.path} className="relative -top-4">
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-gradient-hero shadow-elevated hover:scale-105 transition-transform"
                >
                  <Icon className="h-6 w-6" />
                </Button>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                transition-all duration-300
                ${
                  active
                    ? "text-primary scale-105 bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
