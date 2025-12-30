import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_FREE_LISTINGS = 5;

export interface ListingLimitResult {
  canCreateListing: boolean;
  listingsThisMonth: number;
  remainingListings: number;
  freeListingsLimit: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useListingLimit = (userId: string | null): ListingLimitResult => {
  const [listingsThisMonth, setListingsThisMonth] = useState(0);
  const [freeListingsLimit, setFreeListingsLimit] = useState(DEFAULT_FREE_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingLimit = async () => {
    try {
      // Récupérer la limite depuis app_settings_numeric
      const { data, error } = await supabase
        .from('app_settings_numeric')
        .select('setting_value')
        .eq('setting_key', 'free_listings_limit')
        .maybeSingle();

      if (!error && data) {
        setFreeListingsLimit(data.setting_value);
      }
    } catch (err) {
      console.error('[useListingLimit] Error fetching limit:', err);
    }
  };

  const fetchListingCount = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer la limite d'abord
      await fetchListingLimit();

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

  const remainingListings = Math.max(0, freeListingsLimit - listingsThisMonth);
  const canCreateListing = listingsThisMonth < freeListingsLimit;

  return {
    canCreateListing,
    listingsThisMonth,
    remainingListings,
    freeListingsLimit,
    loading,
    error,
    refresh: fetchListingCount,
  };
};

// Export pour accès externe si nécessaire
export const useFreeListingsLimit = () => {
  const [limit, setLimit] = useState(DEFAULT_FREE_LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings_numeric')
          .select('setting_value')
          .eq('setting_key', 'free_listings_limit')
          .maybeSingle();

        if (!error && data) {
          setLimit(data.setting_value);
        }
      } catch (err) {
        console.error('[useFreeListingsLimit] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLimit();
  }, []);

  return { limit, loading };
};
