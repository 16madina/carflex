import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FREE_LISTINGS_PER_MONTH = 5;

export interface ListingLimitResult {
  canCreateListing: boolean;
  listingsThisMonth: number;
  remainingListings: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useListingLimit = (userId: string | null): ListingLimitResult => {
  const [listingsThisMonth, setListingsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingCount = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculer le début du mois actuel
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthISO = startOfMonth.toISOString();

      // Compter les annonces de vente créées ce mois-ci
      const { count: saleCount, error: saleError } = await supabase
        .from('sale_listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .gte('created_at', startOfMonthISO);

      if (saleError) throw saleError;

      // Compter les annonces de location créées ce mois-ci
      const { count: rentalCount, error: rentalError } = await supabase
        .from('rental_listings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .gte('created_at', startOfMonthISO);

      if (rentalError) throw rentalError;

      const totalCount = (saleCount || 0) + (rentalCount || 0);
      setListingsThisMonth(totalCount);
    } catch (err: any) {
      console.error('[useListingLimit] Error:', err);
      setError(err.message || 'Erreur lors de la vérification des annonces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingCount();
  }, [userId]);

  const remainingListings = Math.max(0, FREE_LISTINGS_PER_MONTH - listingsThisMonth);
  const canCreateListing = listingsThisMonth < FREE_LISTINGS_PER_MONTH;

  return {
    canCreateListing,
    listingsThisMonth,
    remainingListings,
    loading,
    error,
    refresh: fetchListingCount,
  };
};

export const FREE_LISTING_LIMIT = FREE_LISTINGS_PER_MONTH;
