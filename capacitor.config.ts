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
      launchShowDuration:30,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: false,
      useDialog: true
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
