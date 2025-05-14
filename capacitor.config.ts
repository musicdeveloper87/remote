import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.virtux.remoteview',
  appName: 'RemoteView',
  webDir: 'www',
  bundledWebRuntime: false,
  // Configuración de iconos para Android e iOS
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      androidScaleType: 'CENTER_CROP'
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
