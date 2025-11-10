import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDealRatingReturn {
  rating: string | null;
  loading: boolean;
}

export const useDealRating = (listingId: string, listingType: 'sale' | 'rental'): UseDealRatingReturn => {
  const [rating, setRating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        
        // ⚠️ Évaluation IA désactivée - crédits insuffisants
        // Utiliser directement le calcul de base
        const { data, error } = await supabase.functions.invoke('calculate-deal-rating', {
          body: { listingId, listingType }
        });

        if (!error && data?.dealRating) {
          setRating(data.dealRating);
        }
      } catch (error) {
        console.error('Error fetching deal rating:', error);
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchRating();
    }
  }, [listingId, listingType]);

  return { rating, loading };
};
