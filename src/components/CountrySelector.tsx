import { Button } from "@/components/ui/button";
import { useCountry } from "@/contexts/CountryContext";

/**
 * Affiche le pays de l'utilisateur (basé sur son profil d'inscription)
 * Le pays ne peut pas être changé manuellement - il est synchronisé automatiquement via AuthSync
 */
const CountrySelector = () => {
  const { selectedCountry } = useCountry();

  return (
    <Button variant="outline" className="gap-2 cursor-default hover:bg-background">
      <span className="text-xl">{selectedCountry.flag}</span>
      <span className="hidden sm:inline">{selectedCountry.name}</span>
    </Button>
  );
};

export default CountrySelector;
