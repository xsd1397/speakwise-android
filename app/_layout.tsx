import * as NativeSplash from "expo-splash-screen";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { useEffect } from "react";
import "react-native-reanimated";
import { WordbookProvider } from "@/lib/wordbook";
export { ErrorBoundary } from "expo-router";

NativeSplash.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  useEffect(() => {
    NativeSplash.hideAsync().catch(() => undefined);
  }, []);

  return (
    <WordbookProvider>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="light" />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </WordbookProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
