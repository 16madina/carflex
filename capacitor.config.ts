import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.missdee.carflextest',
  appName: 'CarFlex',
  webDir: 'dist',
  // Pour la production, pas de server URL - l'app utilisera les fichiers locaux
  // Pour le développement avec hot-reload, décommentez les lignes ci-dessous:
  // server: {
  //   url: 'https://c69889b6-be82-4301-84ff-53e58a725869.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  ios: {
    scheme: 'carflex'
  },
  android: {
    scheme: 'carflex'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
      // Configuration iOS spécifique
      iosSpinnerStyle: "small",
      // Configuration Android spécifique  
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      androidSpinnerStyle: "large"
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
