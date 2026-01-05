import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCountry, WEST_AFRICAN_COUNTRIES, Country } from "@/contexts/CountryContext";
import { ChevronDown } from "lucide-react";

// Grouper les pays par région
const COUNTRY_REGIONS: { name: string; codes: string[] }[] = [
  {
    name: "Afrique de l'Ouest",
    codes: ['CI', 'SN', 'BJ', 'BF', 'ML', 'NE', 'TG', 'GW', 'GN', 'NG', 'GH', 'SL', 'LR', 'GM', 'CV', 'MR']
  },
  {
    name: "Afrique Centrale",
    codes: ['CM', 'CG', 'GA', 'TD', 'CF', 'GQ', 'CD', 'ST', 'AO']
  },
  {
    name: "Afrique de l'Est",
    codes: ['KE', 'TZ', 'UG', 'RW', 'BI', 'ET', 'ER', 'DJ', 'SO', 'SS', 'SD']
  },
  {
    name: "Afrique Australe",
    codes: ['ZA', 'BW', 'NA', 'ZM', 'ZW', 'MW', 'MZ', 'SZ', 'LS']
  },
  {
    name: "Afrique du Nord",
    codes: ['MA', 'DZ', 'TN', 'LY', 'EG']
  },
  {
    name: "Océan Indien",
    codes: ['MG', 'MU', 'KM', 'SC']
  },
  {
    name: "Europe & Amérique",
    codes: ['FR', 'BE', 'CH', 'CA', 'US', 'GB', 'DE', 'IT', 'ES', 'PT', 'NL']
  }
];

const getCountriesByRegion = (regionCodes: string[]): Country[] => {
  return WEST_AFRICAN_COUNTRIES.filter(country => regionCodes.includes(country.code));
};

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
      <DropdownMenuContent align="end" className="w-64 p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-1">
            {COUNTRY_REGIONS.map((region, index) => {
              const countries = getCountriesByRegion(region.codes);
              if (countries.length === 0) return null;
              
              return (
                <div key={region.name}>
                  {index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {region.name}
                  </DropdownMenuLabel>
                  {countries.map((country) => (
                    <DropdownMenuItem
                      key={country.code}
                      onClick={() => setSelectedCountry(country)}
                      className="cursor-pointer gap-3"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{country.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {country.currency} ({country.currencySymbol})
                        </div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <span className="text-primary shrink-0">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
