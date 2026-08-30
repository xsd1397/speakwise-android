import * as NativeSplash from "expo-splash-screen";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Image, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { WordbookProvider } from "@/lib/wordbook";
export { ErrorBoundary } from "expo-router";
NativeSplash.preventAutoHideAsync().catch(() => undefined);
export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => { NativeSplash.hideAsync().catch(() => undefined); const timer = setTimeout(() => setShowSplash(false), 1400); return () => clearTimeout(timer); }, []);
  return <WordbookProvider><SafeAreaProvider><ThemeProvider value={DarkTheme}><View style={styles.root}><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack><StatusBar style="light" />{showSplash && <View style={styles.splash} pointerEvents="none"><Image source={require("../assets/images/splash-screen-deep-blue.png")} style={StyleSheet.absoluteFill} resizeMode="cover" /></View>}</View></ThemeProvider></SafeAreaProvider></WordbookProvider>;
}
const styles = StyleSheet.create({ root: { flex: 1 }, splash: { ...StyleSheet.absoluteFill, zIndex: 100, backgroundColor: "#061B46" } });
