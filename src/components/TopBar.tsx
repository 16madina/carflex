import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import NotificationBell from "./NotificationBell";
import CountrySelector from "./CountrySelector";

const TopBar = () => {

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
            <Car className="h-7 w-7 text-primary" />
            <span>
              <span className="text-primary">Car</span>
              <span className="text-destructive">Flex</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <CountrySelector />
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
