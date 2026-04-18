import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { Image } from "expo-image";
import { isLoggedIn } from "@/lib/auth";

import LineBackground from "@/assets/images/group-R5.svg";
import Map from "@/components/Map";
import { useCategoryReviews } from "@/hooks/api";

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
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const [selectedMode, setSelectedMode] = useState<TrailMode>("mtb");
  const scrollRef = useRef<ScrollView | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => { isLoggedIn().then(setAuthed); }, []);

  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const { reviews: hikingReviews } = useCategoryReviews("hiking", { size: 3 });
  const { reviews: skiReviews }    = useCategoryReviews("ski",    { size: 3 });
  const { reviews: mtbReviews }    = useCategoryReviews("mtb",    { size: 3 });

  const activity = useMemo(() => [
    ...hikingReviews.map((r) => ({ id: r.id, name: r.name, title: `rated a trail ${r.rating}/5`, body: r.description ?? "", color: COLORS.green })),
    ...skiReviews.map((r) => ({ id: r.id, name: r.name, title: `rated a trail ${r.rating}/5`, body: r.description ?? "", color: COLORS.blue })),
    ...mtbReviews.map((r) => ({ id: r.id, name: r.name, title: `rated a trail ${r.rating}/5`, body: r.description ?? "", color: COLORS.brown })),    
  ], [hikingReviews, skiReviews, mtbReviews]);

  const filteredActivity = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activity;
    return activity.filter((item: typeof activity[0]) =>
      `${item.name} ${item.title} ${item.body}`.toLowerCase().includes(q)
    );
  }, [activity, searchQuery]);

  const refreshHome = () => {
    setSelectedMode("mtb");
    setSearchQuery("");
    setSearchOpen(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    router.replace(pathname as any);
  };

  const goToMode = (mode: TrailMode) => {
    setSelectedMode(mode);
    router.push(MODE_CONFIG[mode].route as any);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={LineBackground}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          ref={(node) => {
            scrollRef.current = node;
          }}
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stickyHeader}>
            <View style={styles.topBar}>
              <Pressable onPress={refreshHome} style={styles.brandRow} hitSlop={8}>
                <Image
                  source={require("@/assets/images/logo.svg")}
                  style={styles.logoMark}
                  contentFit="contain"
                />
              </Pressable>

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
                {!isCompact ? (
                  <View style={styles.searchInline}>
                    <Ionicons name="search-outline" size={16} color={COLORS.mutedText} />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search activity..."
                      placeholderTextColor="#90A6CB"
                      style={styles.searchInput}
                      returnKeyType="search"
                    />
                  </View>
                ) : (
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => setSearchOpen((v) => !v)}
                    hitSlop={8}
                  >
                    <Ionicons name="search-outline" size={20} color={COLORS.dark} />
                  </Pressable>
                )}

                {!authed && (
                  <Pressable
                    style={styles.signupButton}
                    onPress={() => router.push("/signup")}
                    hitSlop={8}
                  >
                    <Text style={styles.signupButtonText}>Sign up</Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.profileDot}
                  onPress={() => router.push("/profile")}
                  hitSlop={8}
                />
              </View>
            </View>

            {isCompact && searchOpen ? (
              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={16} color={COLORS.mutedText} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search activity..."
                  placeholderTextColor="#90A6CB"
                  style={styles.searchInput}
                  returnKeyType="search"
                />
                <Pressable onPress={() => setSearchQuery("")} hitSlop={8} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color={COLORS.primaryText} />
                </Pressable>
              </View>
            ) : null}
          </View>

        <Pressable onPress={refreshHome} style={styles.titleWrap} hitSlop={8}>
          <Image
            source={require("@/assets/images/logotext.svg")}
            style={styles.titleLogo}
            contentFit="contain"
          />
        </Pressable>

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
              <View style={{ flex: 1, width: "100%" }}>
                <Map />
              </View>
            </View>
          </View>

          <View style={styles.feedCard}>
            <Text style={styles.sectionTitle}>Latest activity</Text>

            <View style={styles.feedList}>
              {filteredActivity.map((item) => (
                <View key={item.id} style={styles.feedItem}>
                  <View style={[styles.feedDot, { backgroundColor: item.color }]} />
                  <View style={styles.feedTextCol}>
                    <Text style={styles.feedTitle}>{item.name}</Text>
                    <Text style={styles.feedSubtitle}>
                      {item.title} <Text style={styles.pin}>📍</Text>
                    </Text>
                    <Text style={styles.feedBody}>{item.body}</Text>
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
      </ImageBackground>
    </View>
  );
}

function createStyles(isCompact: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    background: {
      flex: 1,
    },
    backgroundImage: {
      opacity: 0.23,
    },
    content: {
      paddingTop: Platform.OS === "android" ? 18 : 22,
      paddingBottom: 18,
      paddingHorizontal: isCompact ? 14 : 28,
    },
    stickyHeader: {
      backgroundColor: "rgba(255,255,255,0.92)",
      borderRadius: 18,
      paddingHorizontal: isCompact ? 8 : 10,
      paddingTop: 6,
      paddingBottom: isCompact ? 8 : 6,
      marginBottom: isCompact ? 8 : 10,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.55)",
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isCompact ? 10 : 16,
      marginBottom: 0,
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
      marginLeft: 280,
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
      gap: isCompact ? 8 : 10,
    },
    searchInline: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.8)",
      backgroundColor: COLORS.fieldBg,
      borderRadius: 999,
      paddingHorizontal: 12,
      height: isCompact ? 34 : 38,
      width: isCompact ? 160 : 240,
    },
    searchRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.8)",
      backgroundColor: COLORS.fieldBg,
      borderRadius: 999,
      paddingHorizontal: 12,
      height: 38,
    },
    searchInput: {
      flex: 1,
      color: COLORS.primaryText,
      fontSize: 14,
      fontWeight: "700",
      paddingVertical: 0,
    },
    clearButton: {
      paddingLeft: 6,
    },
    signupButton: {
      height: isCompact ? 34 : 38,
      borderRadius: 999,
      paddingHorizontal: isCompact ? 10 : 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: COLORS.primaryText,
      backgroundColor: COLORS.white,
    },
    signupButtonText: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 12 : 13,
      fontWeight: "900",
      letterSpacing: 0.2,
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
    titleWrap: {
      alignSelf: "center",
      marginTop: isCompact ? 6 : 10,
      marginBottom: isCompact ? 12 : 16,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    titleLogo: {
      width: isCompact ? 240 : 420,
      height: isCompact ? 72 : 110,
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
      overflow: "hidden",          // ← clips map tiles to rounded corners
      borderWidth: 2,
      borderColor: "rgba(154,184,244,0.9)",
      // remove: alignItems, justifyContent, paddingHorizontal, gap, backgroundColor
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

