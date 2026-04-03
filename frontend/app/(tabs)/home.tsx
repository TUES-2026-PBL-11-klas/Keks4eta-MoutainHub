import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";


const COLORS = {
  green: "#00DF56",
  blue: "#9AB8F4",
  brown: "#83593D",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  card: "#F6F8FC",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
  dark: "#111111",
};

type TrailMode = "walk" | "ski" | "mtb";

const MODE_CONFIG: Record<TrailMode, { label: string; color: string; route: "/walk" | "/ski" | "/mtb" }> = {
  walk: { label: "Walk Trail", color: COLORS.green, route: "/walk" },
  ski: { label: "Ski Trail", color: COLORS.blue, route: "/ski" },
  mtb: { label: "MTB Trail", color: COLORS.brown, route: "/mtb" },
};

export default function HomeConceptScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const [selectedMode, setSelectedMode] = useState<TrailMode>("mtb");

  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const goToMode = (mode: TrailMode) => {
    setSelectedMode(mode);
    // Typed routes will validate once the pages exist; cast keeps TS happy meanwhile.
    router.push(MODE_CONFIG[mode].route as any);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image
              source={require("@/assets/images/logo.svg")}
              style={styles.logoMark}
              contentFit="contain"
            />
            <Image
              source={require("@/assets/images/logotext.svg")}
              style={styles.logoText}
              contentFit="contain"
            />
          </View>

          <View style={styles.modePills}>
            {(Object.keys(MODE_CONFIG) as TrailMode[]).map((mode) => {
              const cfg = MODE_CONFIG[mode];
              const isActive = selectedMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => goToMode(mode)}
                  style={({ pressed }) => [
                    styles.pill,
                    isActive ? styles.pillActive : styles.pillInactive,
                    { borderColor: cfg.color },
                    pressed && styles.pillPressed,
                  ]}
                >
                  <View style={[styles.pillDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {cfg.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.topActions}>
            <Pressable style={styles.iconButton} onPress={() => router.push("/explore")}>
              <Ionicons name="search-outline" size={20} color={COLORS.dark} />
            </Pressable>
            <View style={styles.profileDot} />
          </View>
        </View>

        <Text style={styles.title}>Mountain Hub</Text>

        <View style={styles.mainRow}>
          <View style={styles.mapCard}>
            <View style={styles.mapHeaderRow}>
              <Text style={styles.sectionTitle}>Map</Text>
              <View style={styles.badge}>
                <Ionicons name="server-outline" size={14} color={COLORS.primaryText} />
                <Text style={styles.badgeText}>backend-powered (soon)</Text>
              </View>
            </View>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={30} color={COLORS.mutedText} />
              <Text style={styles.mapPlaceholderTitle}>Map preview placeholder</Text>
              <Text style={styles.mapPlaceholderText}>
                This area is ready to host your interactive map component.
              </Text>
            </View>
          </View>

          <View style={styles.feedCard}>
            <Text style={styles.sectionTitle}>Latest activity</Text>

            <View style={styles.feedList}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <View key={idx} style={styles.feedItem}>
                  <View style={styles.feedDot} />
                  <View style={styles.feedTextCol}>
                    <Text style={styles.feedTitle}>Ivan Ivanov</Text>
                    <Text style={styles.feedSubtitle}>
                      visited Rila Mountain <Text style={styles.pin}>📍</Text>
                    </Text>
                    <Text style={styles.feedBody}>Lorem ipsum dolor sit amet. In facilis veritat</Text>
                  </View>
                </View>
              ))}
            </View>

            <Pressable style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(isCompact: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    content: {
      paddingTop: Platform.OS === "android" ? 18 : 22,
      paddingBottom: 18,
      paddingHorizontal: isCompact ? 14 : 28,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isCompact ? 10 : 16,
      marginBottom: isCompact ? 8 : 12,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 8 : 10,
      maxWidth: isCompact ? 140 : 220,
      flexShrink: 0,
    },
    logoMark: {
      width: isCompact ? 34 : 44,
      height: isCompact ? 40 : 52,
    },
    logoText: {
      width: isCompact ? 92 : 140,
      height: isCompact ? 36 : 48,
    },
    modePills: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      gap: isCompact ? 8 : 10,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderRadius: 999,
      paddingVertical: isCompact ? 8 : 9,
      paddingHorizontal: isCompact ? 10 : 14,
      backgroundColor: COLORS.white,
    },
    pillActive: {
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    pillInactive: {
      backgroundColor: COLORS.white,
      opacity: 0.9,
    },
    pillPressed: {
      opacity: 0.75,
    },
    pillDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      marginRight: 8,
    },
    pillText: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 13 : 14,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    pillTextActive: {
      color: COLORS.dark,
    },
    topActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 10 : 16,
    },
    iconButton: {
      width: isCompact ? 34 : 40,
      height: isCompact ? 34 : 40,
      alignItems: "center",
      justifyContent: "center",
    },
    profileDot: {
      width: isCompact ? 28 : 36,
      height: isCompact ? 28 : 36,
      borderRadius: 999,
      backgroundColor: COLORS.dark,
    },
    title: {
      textAlign: "center",
      color: COLORS.primaryText,
      fontSize: isCompact ? 34 : 54,
      fontWeight: "900",
      letterSpacing: 0.5,
      marginTop: isCompact ? 6 : 10,
      marginBottom: isCompact ? 12 : 16,
    },
    mainRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: isCompact ? 12 : 18,
      alignItems: "stretch",
    },
    mapCard: {
      flex: 1.35,
      backgroundColor: COLORS.card,
      borderRadius: 26,
      padding: isCompact ? 14 : 18,
      borderWidth: 2,
      borderColor: COLORS.blue,
    },
    mapHeaderRow: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
    },
    feedCard: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 26,
      padding: isCompact ? 14 : 18,
      borderWidth: 2,
      borderColor: COLORS.blue,
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    sectionTitle: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
      fontWeight: "900",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      borderWidth: 1,
      borderColor: COLORS.blue,
    },
    badgeText: {
      color: COLORS.primaryText,
      fontSize: 12,
      fontWeight: "700",
    },
    mapPlaceholder: {
      height: isCompact ? 220 : 300,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: "rgba(154,184,244,0.9)",
      backgroundColor: "rgba(255,255,255,0.85)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      gap: 6,
    },
    mapPlaceholderTitle: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
      fontWeight: "900",
    },
    mapPlaceholderText: {
      color: COLORS.mutedText,
      textAlign: "center",
      fontSize: isCompact ? 13 : 14,
      fontWeight: "600",
      maxWidth: 420,
      lineHeight: isCompact ? 18 : 20,
    },
    feedList: {
      marginTop: 10,
      gap: 10,
    },
    feedItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 18,
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.65)",
    },
    feedDot: {
      width: 14,
      height: 14,
      borderRadius: 999,
      backgroundColor: COLORS.green,
      marginTop: 4,
    },
    feedTextCol: {
      flex: 1,
      gap: 2,
    },
    feedTitle: {
      color: COLORS.primaryText,
      fontWeight: "900",
      fontSize: isCompact ? 14 : 15,
    },
    feedSubtitle: {
      color: COLORS.dark,
      fontWeight: "800",
      fontSize: isCompact ? 13 : 14,
    },
    pin: {
      color: COLORS.brown,
    },
    feedBody: {
      color: COLORS.mutedText,
      fontWeight: "600",
      fontSize: isCompact ? 12 : 13,
    },
    loadMoreButton: {
      alignSelf: "center",
      marginTop: 12,
      width: isCompact ? "100%" : 220,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: COLORS.brown,
      alignItems: "center",
      justifyContent: "center",
    },
    loadMoreText: {
      color: COLORS.white,
      fontSize: isCompact ? 14 : 15,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
  });
}

