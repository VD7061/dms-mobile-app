import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Dealer Management',
  slug: 'dealer_management',
  version: '1.0.0',
  scheme: 'dealermanagement',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',

  ios: {
    bundleIdentifier: 'org.name.dealermanagement',
    supportsTablet: true,
  },

  android: {
    package: 'com.dealermanagement',
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#ffffff',
    },
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash-icon.png',
        imageWidth: 200,
        ios: {
          backgroundColor: '#ffffff',
          image: './assets/splash-icon.png',
          imageWidth: 200,
        },
        android: {
          backgroundColor: '#ffffff',
          image: './assets/splash-icon.png',
          imageWidth: 200,
        },
        dark: {
          image: './assets/splash-icon.png',
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Poppins-Regular.ttf',
          './assets/fonts/Poppins-Medium.ttf',
          './assets/fonts/Poppins-SemiBold.ttf',
          './assets/fonts/Poppins-Bold.ttf',
        ],
      },
    ],
  ],

  extra: {
    appEnv: process.env.APP_ENV ?? 'development',
  },
});
