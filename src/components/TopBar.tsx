import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import CountrySelector from "./CountrySelector";
import UserMenu from "./UserMenu";
import carflexLogo from "@/assets/carflex-logo.png";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const TopBar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={carflexLogo} alt="CarFlex Logo" className="h-12 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-2">
            <CountrySelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Changer le thème</span>
            </Button>
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
