import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CitySelectorProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'CI': ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man'],
  'SN': ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour'],
  'BJ': ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Kandi', 'Abomey'],
  'BF': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou'],
  'ML': ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes', 'Ségou', 'Gao'],
  'NE': ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso', 'Diffa'],
  'TG': ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé', 'Dapaong', 'Tsévié'],
  'GW': ['Bissau', 'Bafatá', 'Gabú', 'Bissorã', 'Bolama', 'Cacheu'],
  'NG': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna'],
  'GH': ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Ashaiman', 'Sunyani', 'Cape Coast'],
  'GN': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Boké'],
  'MA': ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  'BE': ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur'],
  'CH': ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Lucerne'],
  'CA': ['Montréal', 'Québec', 'Gatineau', 'Sherbrooke', 'Trois-Rivières', 'Saguenay']
};

const CitySelector = ({ country, value, onChange, required }: CitySelectorProps) => {
  const [isCustomCity, setIsCustomCity] = useState(false);
  const cities = CITIES_BY_COUNTRY[country] || [];

  const handleCityChange = (selectedValue: string) => {
    if (selectedValue === "other") {
      setIsCustomCity(true);
      onChange("");
    } else {
      setIsCustomCity(false);
      onChange(selectedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="city">Ville {required && <span className="text-destructive">*</span>}</Label>
      {!isCustomCity ? (
        <Select value={value} onValueChange={handleCityChange} required={required}>
          <SelectTrigger id="city">
            <SelectValue placeholder="Sélectionnez une ville" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
            <SelectItem value="other">Autre (saisir manuellement)</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            id="city"
            placeholder="Entrez votre ville"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          <button
            type="button"
            onClick={() => {
              setIsCustomCity(false);
              onChange("");
            }}
            className="text-sm text-primary hover:underline"
          >
            ← Revenir à la liste
          </button>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
