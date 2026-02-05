import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_FREE_LISTINGS = 5;

// Map user_type to the appropriate setting key
const getUserTypeSettingKey = (userType: string | null): string => {
  switch (userType) {
    case 'dealer':
      return 'free_listings_limit_dealer';
    case 'agent':
      return 'free_listings_limit_agent';
    default:
      return 'free_listings_limit';
  }
};

export interface ListingLimitResult {
  canCreateListing: boolean;
  listingsThisMonth: number;
  remainingListings: number;
  freeListingsLimit: number;
  loading: boolean;
  error: string | null;
  isPro: boolean;
  refresh: () => Promise<void>;
}

export const useListingLimit = (userId: string | null): ListingLimitResult => {
  const [listingsThisMonth, setListingsThisMonth] = useState(0);
  const [freeListingsLimit, setFreeListingsLimit] = useState(DEFAULT_FREE_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  const checkProSubscription = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !data) return false;

      // Check if subscription is still valid
      if (data.current_period_end) {
        const endDate = new Date(data.current_period_end);
        return endDate > new Date();
      }

      return data.status === 'active';
    } catch (err) {
      console.error('[useListingLimit] Error checking Pro status:', err);
      return false;
    }
  };

  const fetchListingLimit = async (userType: string | null) => {
    try {
      const settingKey = getUserTypeSettingKey(userType);
      
      const { data, error } = await supabase
        .from('app_settings_numeric')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .maybeSingle();

      if (!error && data) {
        setFreeListingsLimit(data.setting_value);
      } else {
        // Fallback to default limit if specific one not found
        const { data: defaultData } = await supabase
          .from('app_settings_numeric')
          .select('setting_value')
          .eq('setting_key', 'free_listings_limit')
          .maybeSingle();
        
        if (defaultData) {
          setFreeListingsLimit(defaultData.setting_value);
        }
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
      // Check if user has Pro subscription
      const hasProSubscription = await checkProSubscription(userId);
      setIsPro(hasProSubscription);

      // If Pro, no need to count listings (unlimited)
      if (hasProSubscription) {
        setLoading(false);
        return;
      }

      // Get user type to determine appropriate limit
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      // Fetch the appropriate limit based on user type
      await fetchListingLimit(profile?.user_type || null);

      // Calculate start of current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthISO = startOfMonth.toISOString();

      // Count sale listings created this month
      const { count: saleCount, error: saleError } = await supabase
        .from('sale_listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .gte('created_at', startOfMonthISO);

      if (saleError) throw saleError;

      // Count rental listings created this month
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

  // Pro users have unlimited listings
  const remainingListings = isPro ? Infinity : Math.max(0, freeListingsLimit - listingsThisMonth);
  const canCreateListing = isPro || listingsThisMonth < freeListingsLimit;

  return {
    canCreateListing,
    listingsThisMonth,
    remainingListings,
    freeListingsLimit,
    loading,
    error,
    isPro,
    refresh: fetchListingCount,
  };
};

// Export for external access if needed
export const useFreeListingsLimit = (userType?: string) => {
  const [limit, setLimit] = useState(DEFAULT_FREE_LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const settingKey = getUserTypeSettingKey(userType || null);
        
        const { data, error } = await supabase
          .from('app_settings_numeric')
          .select('setting_value')
          .eq('setting_key', settingKey)
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
  }, [userType]);

  return { limit, loading };
};