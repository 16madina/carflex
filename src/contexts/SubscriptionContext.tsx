import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Plan tier types
export type SubscriptionTier = 'free' | 'pro_argent' | 'pro_gold';

// Product ID to tier mapping
export const PRODUCT_TIERS: Record<string, SubscriptionTier> = {
  'prod_TvPMpj9rsNw7A9': 'pro_argent',  // Pro Argent
  'prod_TvPNJvVw9LiXVr': 'pro_gold',     // Pro Gold
};

// Tier limits
export const TIER_LIMITS: Record<SubscriptionTier, { listings: number; boosts: number }> = {
  'free': { listings: 5, boosts: 0 },
  'pro_argent': { listings: 10, boosts: 3 },
  'pro_gold': { listings: 25, boosts: 5 },
};

interface SubscriptionContextType {
  subscribed: boolean;
  productId: string;
  tier: SubscriptionTier;
  subscriptionEnd: string | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscribed: false,
  productId: 'free',
  tier: 'free',
  subscriptionEnd: null,
  loading: true,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [productId, setProductId] = useState('free');
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscribed(false);
      setProductId('free');
      setTier('free');
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      // Timeout de 5 secondes pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const checkPromise = supabase.functions.invoke('check-subscription');
      
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      
      if (data) {
        const isSubscribed = data.subscribed || false;
        const pid = data.product_id || 'free';
        
        setSubscribed(isSubscribed);
        setProductId(pid);
        setSubscriptionEnd(data.subscription_end || null);
        
        // Determine tier from product ID
        if (isSubscribed && pid && PRODUCT_TIERS[pid]) {
          setTier(PRODUCT_TIERS[pid]);
        } else {
          setTier('free');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      // En cas d'erreur, continuer avec les valeurs par défaut
      setSubscribed(false);
      setProductId('free');
      setTier('free');
      setSubscriptionEnd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Récupérer la session utilisateur
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    refreshSubscription();
    
    // Rafraîchir toutes les 10 minutes (optimisation de coûts)
    const interval = setInterval(refreshSubscription, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscribed, productId, tier, subscriptionEnd, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
