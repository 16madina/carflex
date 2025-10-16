import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useSplashScreen = () => {
  useEffect(() => {
    // Vérifie si on est sur une plateforme native
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Cache le splash screen immédiatement après le chargement de l'app
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (error) {
        console.error('Erreur lors du masquage du splash screen:', error);
      }
    };

    // Cache après un court délai pour assurer que l'app est prête
    const timer = setTimeout(() => {
      hideSplash();
    }, 100);

    return () => clearTimeout(timer);
  }, []);
};
