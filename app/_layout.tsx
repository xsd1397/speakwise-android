import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { WordbookProvider } from "@/lib/wordbook";
export { ErrorBoundary } from "expo-router";
export default function RootLayout() {
  return <WordbookProvider><SafeAreaProvider><ThemeProvider value={DarkTheme}><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack><StatusBar style="light" /></ThemeProvider></SafeAreaProvider></WordbookProvider>;
}
