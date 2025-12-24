import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.missdee.carflextest',
  appName: 'CarFlex',
  webDir: 'dist',
  // Hot-reload désactivé pour production
  // server: {
  //   url: 'https://c69889b6-be82-4301-84ff-53e58a725869.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  ios: {
    scheme: 'App'
  },
  android: {
    scheme: 'carflex'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    Camera: {
      permissions: ['camera'],
      quality: 90,
      allowEditing: true,
      resultType: 'uri'
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
