import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c69889b6be82430184ff53e58a725869',
  appName: 'CarFlex',
  webDir: 'dist',
  server: {
    url: 'https://caflexapp.com',
    cleartext: true
  },
  ios: {
    scheme: 'carflex'
  },
  android: {
    scheme: 'carflex'
  },
  plugins: {
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
