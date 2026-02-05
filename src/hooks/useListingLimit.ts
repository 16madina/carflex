import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_TIERS, TIER_LIMITS, SubscriptionTier } from '@/contexts/SubscriptionContext';

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
  tier: SubscriptionTier;
  boostsRemaining: number;
  boostsLimit: number;
  refresh: () => Promise<void>;
}

export const useListingLimit = (userId: string | null): ListingLimitResult => {
  const [listingsThisMonth, setListingsThisMonth] = useState(0);
  const [freeListingsLimit, setFreeListingsLimit] = useState(DEFAULT_FREE_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [boostsUsed, setBoostsUsed] = useState(0);

  const checkProSubscription = async (userId: string): Promise<{ isPro: boolean; tier: SubscriptionTier; limit: number }> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, current_period_end, product_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !data) return { isPro: false, tier: 'free', limit: DEFAULT_FREE_LISTINGS };

      // Check if subscription is still valid
      if (data.current_period_end) {
        const endDate = new Date(data.current_period_end);
        if (endDate <= new Date()) {
          return { isPro: false, tier: 'free', limit: DEFAULT_FREE_LISTINGS };
        }
      }

      if (data.status === 'active' && data.product_id) {
        const subTier = PRODUCT_TIERS[data.product_id] || 'free';
        const tierLimits = TIER_LIMITS[subTier];
        return { 
          isPro: subTier !== 'free', 
          tier: subTier, 
          limit: tierLimits.listings 
        };
      }

      return { isPro: false, tier: 'free', limit: DEFAULT_FREE_LISTINGS };
    } catch (err) {
      console.error('[useListingLimit] Error checking Pro status:', err);
      return { isPro: false, tier: 'free', limit: DEFAULT_FREE_LISTINGS };
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

  const fetchBoostsUsed = async (userId: string) => {
    try {
      // Count active boosts this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { count, error } = await supabase
        .from('premium_listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('created_at', startOfMonth.toISOString());

      if (!error && count !== null) {
        setBoostsUsed(count);
      }
    } catch (err) {
      console.error('[useListingLimit] Error fetching boosts:', err);
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
      // Check if user has Pro subscription and get tier
      const proStatus = await checkProSubscription(userId);
      setIsPro(proStatus.isPro);
      setTier(proStatus.tier);

      // Set limit based on tier
      if (proStatus.isPro) {
        setFreeListingsLimit(proStatus.limit);
        await fetchBoostsUsed(userId);
      } else {
        // Get user type to determine appropriate limit for free users
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .single();

        // Fetch the appropriate limit based on user type
        await fetchListingLimit(profile?.user_type || null);
      }

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

  const tierLimits = TIER_LIMITS[tier];
  const remainingListings = Math.max(0, freeListingsLimit - listingsThisMonth);
  const canCreateListing = listingsThisMonth < freeListingsLimit;
  const boostsRemaining = Math.max(0, tierLimits.boosts - boostsUsed);

  return {
    canCreateListing,
    listingsThisMonth,
    remainingListings,
    freeListingsLimit,
    loading,
    error,
    isPro,
    tier,
    boostsRemaining,
    boostsLimit: tierLimits.boosts,
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