import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
export { ErrorBoundary } from "expo-router";
export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider value={DarkTheme}><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack><StatusBar style="light" /></ThemeProvider></SafeAreaProvider>;
}
