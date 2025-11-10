import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountry, WEST_AFRICAN_COUNTRIES } from "@/contexts/CountryContext";
import { ChevronDown } from "lucide-react";

/**
 * Affiche le pays de l'utilisateur (initialisé selon son pays d'inscription)
 * L'utilisateur peut changer manuellement le pays affiché
 */
const CountrySelector = () => {
  const { selectedCountry, setSelectedCountry } = useCountry();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="hidden sm:inline">{selectedCountry.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {WEST_AFRICAN_COUNTRIES.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => setSelectedCountry(country)}
            className="cursor-pointer gap-3"
          >
            <span className="text-xl">{country.flag}</span>
            <div className="flex-1">
              <div className="font-medium">{country.name}</div>
              <div className="text-xs text-muted-foreground">
                {country.currency} ({country.currencySymbol})
              </div>
            </div>
            {selectedCountry.code === country.code && (
              <span className="text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
