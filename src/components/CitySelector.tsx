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
  // Pays UEMOA
  'CI': ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man', 'Gagnoa', 'Divo', 'Abengourou'],
  'SN': ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Rufisque', 'Diourbel', 'Tambacounda'],
  'BJ': ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Kandi', 'Abomey', 'Natitingou', 'Lokossa', 'Ouidah'],
  'BF': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou', 'Kaya', 'Fada N\'Gourma', 'Tenkodogo'],
  'ML': ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes', 'Ségou', 'Gao', 'Kati', 'San', 'Tombouctou'],
  'NE': ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso', 'Diffa', 'Tillabéri', 'Arlit'],
  'TG': ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé', 'Dapaong', 'Tsévié', 'Aného', 'Bassar'],
  'GW': ['Bissau', 'Bafatá', 'Gabú', 'Bissorã', 'Bolama', 'Cacheu', 'Canchungo', 'Catió'],
  // Autres pays africains francophones
  'GN': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Boké', 'Siguiri', 'Guéckédou'],
  'CM': ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Bafoussam', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Kribi', 'Limbé'],
  'CD': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Kananga', 'Goma', 'Bukavu', 'Matadi', 'Kolwezi', 'Likasi'],
  'CG': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Owando', 'Ouesso', 'Impfondo'],
  'GA': ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné'],
  'TD': ['N\'Djamena', 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Koumra', 'Pala', 'Bongor'],
  'CF': ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari', 'Bouar', 'Bossangoa'],
  'MG': ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara', 'Antsiranana', 'Ambovombe'],
  'MA': ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi', 'Kenitra'],
  'DZ': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Tlemcen', 'Biskra', 'Béjaïa'],
  'TN': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Gabès', 'Bizerte', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous'],
  // Autres pays africains
  'NG': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna', 'Enugu', 'Warri', 'Jos'],
  'GH': ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Ashaiman', 'Sunyani', 'Cape Coast', 'Tema', 'Koforidua', 'Ho'],
  'KE': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Ruiru', 'Kikuyu', 'Thika', 'Malindi'],
  'ZA': ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Soweto', 'Pietermaritzburg'],
  'ET': ['Addis-Abeba', 'Dire Dawa', 'Mekele', 'Gondar', 'Bahir Dar', 'Hawassa', 'Adama', 'Jimma'],
  'EG': ['Le Caire', 'Alexandrie', 'Gizeh', 'Port-Saïd', 'Suez', 'Louxor', 'Assouan', 'Mansoura', 'Tanta'],
  // Europe francophone
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Grenoble', 'Dijon'],
  'BE': ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Louvain', 'Mons', 'Malines'],
  'CH': ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Lucerne', 'Winterthour', 'Saint-Gall', 'Lugano', 'Bienne'],
  'LU': ['Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Ettelbruck', 'Diekirch'],
  // Autres pays européens
  'DE': ['Berlin', 'Munich', 'Hambourg', 'Cologne', 'Francfort', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
  'GB': ['Londres', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Édimbourg', 'Bristol', 'Cardiff'],
  'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palerme', 'Gênes', 'Bologne', 'Florence', 'Bari', 'Venise'],
  'ES': ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Saragosse', 'Malaga', 'Murcie', 'Palma', 'Bilbao', 'Alicante'],
  'NL': ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningue', 'Almere', 'Breda'],
  'PT': ['Lisbonne', 'Porto', 'Amadora', 'Braga', 'Coimbra', 'Funchal', 'Setúbal', 'Aveiro', 'Faro'],
  // Amérique
  'CA': ['Montréal', 'Québec', 'Gatineau', 'Sherbrooke', 'Trois-Rivières', 'Saguenay', 'Laval', 'Longueuil', 'Ottawa'],
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphie', 'San Antonio', 'San Diego', 'Dallas', 'Miami']
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
