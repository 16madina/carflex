import { useState, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAR_BRANDS, CAR_MODELS } from "@/constants/vehicles";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

const priceRanges = [
  { value: "0-5000000", label: "Moins de 5M FCFA" },
  { value: "5000000-10000000", label: "5M - 10M FCFA" },
  { value: "10000000-20000000", label: "10M - 20M FCFA" },
  { value: "20000000-50000000", label: "20M - 50M FCFA" },
  { value: "50000000+", label: "Plus de 50M FCFA" },
];

const ProgressiveSearch = () => {
  const navigate = useNavigate();
  const [brandOpen, setBrandOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const models = useMemo(() => {
    return selectedBrand ? CAR_MODELS[selectedBrand] || [] : [];
  }, [selectedBrand]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch) return CAR_BRANDS;
    return CAR_BRANDS.filter(brand =>
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandSearch]);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setBrandOpen(false);
    setBrandSearch("");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split("-");
      if (min) params.set("minPrice", min.replace("+", ""));
      if (max) params.set("maxPrice", max);
    }
    
    navigate(`/listings?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear("");
    setSelectedPriceRange("");
  };

  const hasSelection = selectedBrand || selectedModel || selectedYear || selectedPriceRange;

  return (
    <div className="bg-background rounded-xl p-4 shadow-elevated">
      <div className="space-y-3">
        {/* Étape 1: Marque */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Popover open={brandOpen} onOpenChange={setBrandOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={brandOpen}
                  className="w-full h-11 justify-between text-base font-normal text-foreground bg-background border-input"
                >
                  {selectedBrand || "Sélectionnez une marque..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 z-50" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Rechercher une marque..." 
                    value={brandSearch}
                    onValueChange={setBrandSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Aucune marque trouvée.</CommandEmpty>
                    <CommandGroup>
                      {filteredBrands.map((brand) => (
                        <CommandItem
                          key={brand}
                          value={brand}
                          onSelect={() => handleBrandSelect(brand)}
                          className="cursor-pointer"
                        >
                          {brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Bouton recherche (toujours visible) */}
          <Button size="lg" className="h-11 px-6" onClick={handleSearch}>
            <Search className="mr-2 h-5 w-5" />
            Rechercher
          </Button>
        </div>

        {/* Champs additionnels (apparaissent progressivement) */}
        <AnimatePresence>
          {selectedBrand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Étape 2: Modèle */}
                {models.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="h-11 text-foreground bg-background border-input">
                        <SelectValue placeholder="Modèle (optionnel)" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {/* Étape 3: Année */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-11 text-foreground bg-background border-input">
                      <SelectValue placeholder="Année (optionnel)" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Étape 4: Budget */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="h-11 text-foreground bg-background border-input">
                      <SelectValue placeholder="Budget (optionnel)" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              {/* Bouton réinitialiser */}
              {hasSelection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex justify-end"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Réinitialiser
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressiveSearch;
