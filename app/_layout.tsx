import * as NativeSplash from "expo-splash-screen";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, View, Image, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import "react-native-reanimated";
import { WordbookProvider } from "@/lib/wordbook";

export { ErrorBoundary } from "expo-router";

NativeSplash.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [isSplashDone, setIsSplashDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (e) {
        console.warn(e);
      } finally {
        await NativeSplash.hideAsync().catch(() => undefined);

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          setIsSplashDone(true);
        });
      }
    }

    prepare();
  }, [fadeAnim]);

  return (
    <WordbookProvider>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="light" />

            {!isSplashDone && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: fadeAnim, backgroundColor: "#061121" },
                ]}
                pointerEvents="none"
              >
                <Image
                  source={require("../assets/images/splash-screen-deep-blue.png")}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              </Animated.View>
            )}
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </WordbookProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
