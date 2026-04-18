import React, { useMemo, useRef, useState } from "react";
import {
  ImageBackground,
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

import LineBackground from "@/assets/images/group-R5.svg";
import { PostDetailsModal, type FeedPost } from "@/components/post-details-modal";
import { useTrails, useCategoryReviews } from "@/hooks/api";
import Map from "@/components/Map";

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

type Mode = "walk" | "ski" | "mtb";

const MODE_CONFIG: Record<Mode, { label: string; color: string; route: "/walk" | "/ski" | "/mtb" }> =
  {
    walk: { label: "Walk Trail", color: COLORS.green, route: "/walk" },
    ski: { label: "Ski Trail", color: COLORS.blue, route: "/ski" },
    mtb: { label: "MTB Trail", color: COLORS.brown, route: "/mtb" },
  };


export default function WalkHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const scrollRef = useRef<ScrollView | null>(null);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [postOpen, setPostOpen] = useState(false);

  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const { trails } = useTrails({ category: "hiking" });
  const { reviews } = useCategoryReviews("hiking", { size: 10 });

  const posts: FeedPost[] = reviews.map((r) => ({
    id: r.id,
    userId: r.user_id ?? "",
    user: r.name,
    title: `rated ${r.rating}/5 ⭐`,
    subtitle: r.description ?? "",
    photos: [],
  }));

  const mapActivity = trails.map((t) => ({
    id: t.id,
    title: t.name,
    place: `${t.distance_km} km · ${t.status}`,
  }));

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
              <Pressable onPress={() => router.replace("/(tabs)")} style={styles.brandRow} hitSlop={8}>
                <Image
                  source={require("@/assets/images/logo.svg")}
                  style={styles.logoMark}
                  contentFit="contain"
                />
              </Pressable>

              <View style={styles.modePills}>
                {(Object.keys(MODE_CONFIG) as Mode[]).map((mode) => {
                  const cfg = MODE_CONFIG[mode];
                  const active = mode === "walk";
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => router.push(cfg.route as any)}
                      style={({ pressed }) => [
                        styles.pill,
                        active ? styles.pillActive : styles.pillInactive,
                        { borderColor: cfg.color },
                        pressed && styles.pillPressed,
                      ]}
                    >
                      <View style={[styles.pillDot, { backgroundColor: cfg.color }]} />
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{cfg.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.topActions}>
                <Pressable style={styles.iconButton} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}>
                  <Ionicons name="arrow-up-outline" size={20} color={COLORS.dark} />
                </Pressable>
                <Pressable style={styles.profileDot} onPress={() => router.push("/profile")} hitSlop={8} />
              </View>
            </View>
          </View>

          <Text style={styles.pageTitle}>Walk Trail</Text>

          <View style={styles.mainRow}>
            <View style={styles.feedCard}>
              <Text style={styles.sectionTitle}>Newest posts</Text>
              <Text style={styles.sectionSubTitle}>Completed trails and new trails with photos.</Text>

              <View style={styles.postList}>
                {posts.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.postCard}
                    onPress={() => {
                      setActivePost(p);
                      setPostOpen(true);
                    }}
                  >
                    <View style={styles.postHeader}>
                      <View style={styles.userDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.postUser}>{p.user}</Text>
                        <Text style={styles.postMeta}>
                          {p.title} • <Text style={styles.postMetaStrong}>{p.subtitle}</Text>
                        </Text>
                      </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                      {p.photos.map((src, idx) => (
                        <Image key={idx} source={src} style={styles.photo} contentFit="cover" />
                      ))}
                    </ScrollView>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.mapCard}>
              <Text style={styles.sectionTitle}>Latest map activity (Bulgaria)</Text>
              <Text style={styles.sectionSubTitle}>New trails and updates around the country.</Text>

              <View style={styles.activityList}>
                {mapActivity.map((a) => (
                  <View key={a.id} style={styles.activityItem}>
                    <Ionicons name="location-outline" size={16} color={COLORS.primaryText} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>{a.title}</Text>
                      <Text style={styles.activityPlace}>{a.place}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.mapPlaceholder}>
                <Map category="hiking" />
              </View>
            </View>
          </View>

          <View style={styles.sportBanner}>
            <Ionicons name="walk-outline" size={20} color={COLORS.primaryText} />
            <Text style={styles.sportBannerText}>
              Sport image missing: add `assets/photos/hike.*` and I’ll wire it here.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>

      <PostDetailsModal
        visible={postOpen}
        post={activePost}
        onClose={() => setPostOpen(false)}
        onViewProfile={(userId) => {
          setPostOpen(false);
          router.push(`/user/${userId}` as any);
        }}
      />
    </View>
  );
}

function createStyles(isCompact: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.white },
    background: { flex: 1 },
    backgroundImage: { opacity: 0.23 },
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
      paddingBottom: 6,
      marginBottom: isCompact ? 8 : 10,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.55)",
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isCompact ? 10 : 16,
    },
    brandRow: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
    logoMark: { width: isCompact ? 34 : 44, height: isCompact ? 40 : 52 },
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
    pillInactive: { opacity: 0.9 },
    pillPressed: { opacity: 0.75 },
    pillDot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
    pillText: { color: COLORS.primaryText, fontSize: isCompact ? 13 : 14, fontWeight: "800" },
    pillTextActive: { color: COLORS.dark },
    topActions: { flexDirection: "row", alignItems: "center", gap: isCompact ? 8 : 10 },
    iconButton: { width: isCompact ? 34 : 40, height: isCompact ? 34 : 40, alignItems: "center", justifyContent: "center" },
    profileDot: { width: isCompact ? 28 : 36, height: isCompact ? 28 : 36, borderRadius: 999, backgroundColor: COLORS.dark },
    pageTitle: {
      textAlign: "center",
      color: COLORS.primaryText,
      fontSize: isCompact ? 26 : 40,
      fontWeight: "900",
      marginTop: 6,
      marginBottom: 12,
    },
    mainRow: { flexDirection: isCompact ? "column" : "row", gap: isCompact ? 12 : 18 },
    feedCard: {
      flex: 1.2,
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
    mapCard: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderRadius: 26,
      padding: isCompact ? 14 : 18,
      borderWidth: 2,
      borderColor: COLORS.blue,
    },
    sectionTitle: { color: COLORS.primaryText, fontSize: 16, fontWeight: "900" },
    sectionSubTitle: { color: COLORS.mutedText, fontSize: 12, fontWeight: "600", marginTop: 4, marginBottom: 10 },
    postList: { gap: 12 },
    postCard: { borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 1, borderColor: "rgba(154,184,244,0.65)", padding: 12 },
    postHeader: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
    userDot: { width: 14, height: 14, borderRadius: 999, backgroundColor: COLORS.green },
    postUser: { color: COLORS.primaryText, fontWeight: "900", fontSize: 14 },
    postMeta: { color: COLORS.mutedText, fontWeight: "700", fontSize: 12 },
    postMetaStrong: { color: COLORS.primaryText, fontWeight: "900" },
    photoRow: { gap: 10 },
    photo: { width: isCompact ? 220 : 260, height: isCompact ? 140 : 160, borderRadius: 16, backgroundColor: COLORS.fieldBg },
    activityList: { gap: 10, marginBottom: 12 },
    activityItem: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.85)", borderWidth: 1, borderColor: "rgba(154,184,244,0.55)" },
    activityTitle: { color: COLORS.primaryText, fontWeight: "900", fontSize: 13 },
    activityPlace: { color: COLORS.mutedText, fontWeight: "700", fontSize: 12, marginTop: 2 },
    mapPlaceholder: { height: isCompact ? 180 : 220, borderRadius: 22, borderWidth: 2, borderColor: "rgba(154,184,244,0.9)", overflow: "hidden" },
    sportBanner: { marginTop: 14, borderRadius: 26, padding: 14, borderWidth: 2, borderColor: COLORS.blue, backgroundColor: "rgba(255,255,255,0.9)", flexDirection: "row", alignItems: "center", gap: 10 },
    sportBannerText: { flex: 1, color: COLORS.mutedText, fontWeight: "800", fontSize: 12 },
  });
}

