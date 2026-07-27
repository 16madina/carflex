import type { CapacitorConfig } from '@capacitor/cli';

// Like KiDi+: load the live web app so UI updates deploy without a new Play build.
// Native plugins still need a store release when Capacitor/SDK/permissions change.
// Local hot-reload: set NATIVE_APP_URL=http://YOUR_LAN_IP:5173 before cap sync.
const nativeAppUrl = process.env.NATIVE_APP_URL || "https://carflex.lovable.app";

const config: CapacitorConfig = {
  appId: 'com.missdee.carflextest',
  appName: 'CarFlex',
  webDir: 'dist',
    server: {
    url: nativeAppUrl,
    cleartext: nativeAppUrl.startsWith("http://"),
    androidScheme: "https",
    allowNavigation: [
      "carflex.lovable.app",
      "*.lovable.app",
      "*.lovableproject.com",
      "*.stripe.com",
      "*.paypal.com",
    ],
  },
  ios: {
    scheme: 'App'
  },
  android: {
    scheme: 'carflex'
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
    },
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
      allowEditing: false,
      resultType: 'uri',
      saveToGallery: false,
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
