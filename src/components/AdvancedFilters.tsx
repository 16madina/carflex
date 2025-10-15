import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import BudgetCalculator from "@/components/BudgetCalculator";

export interface FilterState {
  priceMin: string;
  priceMax: string;
  mileageMin: string;
  mileageMax: string;
  yearMin: string;
  yearMax: string;
  fuelType: string;
  transmission: string;
  budgetMax: string;
  sortBy: string;
}

interface AdvancedFiltersProps {
  listingType: "sale" | "rental";
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortBy: string) => void;
  sortBy: string;
}

const AdvancedFilters = ({
  listingType,
  filters,
  onFiltersChange,
  onSortChange,
  sortBy,
}: AdvancedFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      priceMin: "",
      priceMax: "",
      mileageMin: "",
      mileageMax: "",
      yearMin: "",
      yearMax: "",
      fuelType: "all",
      transmission: "all",
      budgetMax: "",
      sortBy: "created_at",
    });
    onSortChange("created_at");
  };

  const handleBudgetChange = (maxPrice: number) => {
    updateFilter("budgetMax", maxPrice.toString());
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "fuelType" || key === "transmission") return value !== "all";
    if (key === "sortBy") return false;
    return value !== "";
  }).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filtres avancés</SheetTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Budget Calculator */}
          {listingType === "sale" && (
            <BudgetCalculator onBudgetChange={handleBudgetChange} />
          )}

          {/* Sort */}
          <div className="space-y-2">
            <Label>Trier par</Label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Plus récent</SelectItem>
                <SelectItem value="price">Prix croissant</SelectItem>
                <SelectItem value="mileage">Kilométrage</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Prix</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilter("priceMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilter("priceMax", e.target.value)}
              />
            </div>
          </div>

          {/* Mileage Range */}
          <div className="space-y-2">
            <Label>Kilométrage (km)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.mileageMin}
                onChange={(e) => updateFilter("mileageMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.mileageMax}
                onChange={(e) => updateFilter("mileageMax", e.target.value)}
              />
            </div>
          </div>

          {/* Year Range */}
          <div className="space-y-2">
            <Label>Année</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.yearMin}
                onChange={(e) => updateFilter("yearMin", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.yearMax}
                onChange={(e) => updateFilter("yearMax", e.target.value)}
              />
            </div>
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <Label>Carburant</Label>
            <Select value={filters.fuelType} onValueChange={(value) => updateFilter("fuelType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="gasoline">Essence</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Électrique</SelectItem>
                <SelectItem value="hybrid">Hybride</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select value={filters.transmission} onValueChange={(value) => updateFilter("transmission", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="automatic">Automatique</SelectItem>
                <SelectItem value="manual">Manuelle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
