import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useSplashScreen = () => {
  useEffect(() => {
    // Vérifie si on est sur une plateforme native
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Cache IMMÉDIATEMENT le splash screen natif pour éviter qu'il s'affiche
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
        console.log('Splash screen natif Capacitor caché');
      } catch (error) {
        console.error('Erreur lors du masquage du splash screen:', error);
      }
    };

    // Cacher dès que possible sans délai
    hideSplash();
  }, []);
};
