import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
export function ScreenContainer({ children }: { children: ReactNode }) { return <View style={styles.outer}><SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>{children}</SafeAreaView></View>; }
const styles = StyleSheet.create({ outer: { flex: 1, backgroundColor: "#0B0C0F" }, safeArea: { flex: 1 } });
