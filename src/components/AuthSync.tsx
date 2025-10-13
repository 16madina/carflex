import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCountry, WEST_AFRICAN_COUNTRIES } from '@/contexts/CountryContext';

/**
 * Component that syncs the user's country from their profile with the country context
 */
const AuthSync = () => {
  const { setSelectedCountry } = useCountry();

  useEffect(() => {
    // Function to sync user's country
    const syncUserCountry = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', userId)
          .single();

        if (profile?.country) {
          // Find the country in our list by name
          const userCountry = WEST_AFRICAN_COUNTRIES.find(
            (c) => c.name === profile.country
          );
          
          if (userCountry) {
            setSelectedCountry(userCountry);
          }
        }
      } catch (error) {
        console.error('Error syncing user country:', error);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserCountry(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          syncUserCountry(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setSelectedCountry]);

  return null;
};

export default AuthSync;
