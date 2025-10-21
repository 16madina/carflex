import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useSplashScreen = () => {
  useEffect(() => {
    // Vérifie si on est sur une plateforme native
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Cache immédiatement le splash screen natif (il est déjà configuré pour se cacher automatiquement)
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
        console.log('Splash screen natif caché');
      } catch (error) {
        // Erreur silencieuse - le splash natif est désactivé dans la config
        console.log('Splash screen déjà caché ou non disponible');
      }
    };

    // Attendre un court instant pour laisser React s'initialiser
    setTimeout(hideSplash, 100);
  }, []);
};
