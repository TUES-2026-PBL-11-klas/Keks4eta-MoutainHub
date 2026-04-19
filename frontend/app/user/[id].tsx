import React, { useMemo } from "react";
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import LineBackground from "@/assets/images/group-R5.svg";
import { useUser, useUserTrails, useUserReviews } from "@/hooks/api";

const COLORS = {
  blue: "#9AB8F4",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  card: "#F6F8FC",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
  dark: "#111111",
};

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const id = typeof params.id === "string" ? params.id : "";
  const { user, loading: userLoading } = useUser(id);
  const { trails, loading: trailsLoading } = useUserTrails(id);
  const { reviews, loading: reviewsLoading } = useUserReviews(id);

  const displayName = user?.display_name || user?.email || "Unknown user";

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ImageBackground source={LineBackground} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={COLORS.primaryText} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={8}>
              <Image source={require("@/assets/images/logo.svg")} style={styles.logoMark} contentFit="contain" />
            </Pressable>
          </View>

          <View style={styles.card}>
            {userLoading ? (
              <Text style={styles.bio}>Loading…</Text>
            ) : (
              <>
                <Text style={styles.name}>{displayName}</Text>
                {user?.email ? <Text style={styles.bio}>{user.email}</Text> : null}
              </>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trails</Text>
              {trailsLoading ? (
                <View style={styles.item}>
                  <Text style={styles.itemText}>Loading…</Text>
                </View>
              ) : trails.length === 0 ? (
                <View style={styles.item}>
                  <Ionicons name="map-outline" size={16} color={COLORS.primaryText} />
                  <Text style={styles.itemText}>No trails yet.</Text>
                </View>
              ) : (
                trails.map((trail) => (
                  <View key={trail.id} style={styles.item}>
                    <Ionicons name="map-outline" size={16} color={COLORS.primaryText} />
                    <Text style={styles.itemText}>{trail.name}</Text>
                    {trail.distance_km ? (
                      <Text style={[styles.itemText, { marginLeft: "auto" }]}>{trail.distance_km.toFixed(1)} km</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviewsLoading ? (
                <View style={styles.item}>
                  <Text style={styles.itemText}>Loading…</Text>
                </View>
              ) : reviews.length === 0 ? (
                <View style={styles.item}>
                  <Ionicons name="star-outline" size={16} color={COLORS.primaryText} />
                  <Text style={styles.itemText}>No reviews yet.</Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={[styles.item, { marginBottom: 6 }]}>
                    <Ionicons name="star" size={16} color={COLORS.primaryText} />
                    <Text style={styles.itemText}>{review.name}</Text>
                    <Text style={[styles.itemText, { marginLeft: "auto" }]}>{"★".repeat(review.rating)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
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
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.9)",
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.6)",
    },
    backText: { color: COLORS.primaryText, fontWeight: "900", fontSize: 13 },
    logoMark: { width: 38, height: 46 },
    card: {
      width: "100%",
      backgroundColor: COLORS.white,
      borderRadius: 28,
      padding: 16,
      borderWidth: 2,
      borderColor: COLORS.blue,
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 10,
    },
    name: { color: COLORS.primaryText, fontSize: 28, fontWeight: "900" },
    bio: { color: COLORS.mutedText, fontSize: 13, fontWeight: "700", marginTop: 6, marginBottom: 12 },
    section: { marginTop: 10 },
    sectionTitle: { color: COLORS.primaryText, fontSize: 15, fontWeight: "900", marginBottom: 8 },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 10,
      borderRadius: 18,
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.65)",
    },
    itemText: { color: COLORS.mutedText, fontWeight: "700" },
  });
}

