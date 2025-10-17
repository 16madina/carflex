import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useSplashScreen = () => {
  useEffect(() => {
    // Vérifie si on est sur une plateforme native
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Cache le splash screen après que l'app soit prête
    const hideSplash = async () => {
      try {
        // Attendre que le DOM soit complètement chargé
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true), { once: true });
          }
        });
        
        // Petit délai supplémentaire pour s'assurer que React est prêt
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await SplashScreen.hide();
        console.log('Splash screen caché avec succès');
      } catch (error) {
        console.error('Erreur lors du masquage du splash screen:', error);
        // En cas d'erreur, on force le masquage après un délai
        setTimeout(() => {
          SplashScreen.hide().catch(() => {});
        }, 1000);
      }
    };

    hideSplash();
  }, []);
};
