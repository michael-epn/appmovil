import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.michaelvargas.pokeapp',
  appName: 'PokeApp',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
