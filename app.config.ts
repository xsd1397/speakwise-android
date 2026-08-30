import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "SpeakWise",
  slug: "speakwise",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "speakwise",
  userInterfaceStyle: "dark",
  platforms: ["android", "web"],
  icon: "./assets/images/icon.png",
  android: {
    package: "com.speakwise.app",
    permissions: ["RECORD_AUDIO"],
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
  },
  plugins: [
    "expo-router",
    "expo-audio",
    ["expo-splash-screen", { image: "./assets/images/splash-screen-deep-blue.png", resizeMode: "cover", backgroundColor: "#061B46" }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
    eas: {
      projectId: "cadf963b-9d15-4717-b951-c6d4dca961fa",
    },
  },
};

export default config;
