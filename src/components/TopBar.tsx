import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import CountrySelector from "./CountrySelector";
import UserMenu from "./UserMenu";
import carflexLogo from "@/assets/carflex-logo.png";

const TopBar = () => {

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-lg pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="container mx-auto px-6">
        <div className="flex h-18 items-center justify-between">
          <Link to="/" className="flex items-center active-press">
            <img src={carflexLogo} alt="CarFlex Logo" className="h-14 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            <CountrySelector />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
