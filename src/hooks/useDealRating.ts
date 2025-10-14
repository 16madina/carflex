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
        
        // Try AI evaluation first
        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-price-evaluation', {
          body: { listingId, listingType }
        });

        if (!aiError && aiData?.dealRating) {
          setRating(aiData.dealRating);
          setLoading(false);
          return;
        }

        // Fallback to basic calculation
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('calculate-deal-rating', {
          body: { listingId, listingType }
        });

        if (!fallbackError && fallbackData?.dealRating) {
          setRating(fallbackData.dealRating);
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
