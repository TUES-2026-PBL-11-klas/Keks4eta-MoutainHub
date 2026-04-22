import React from "react";
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import LineBackground from "@/assets/images/group-R5.svg";
import { useUser, useUserTrails, useUserReviews } from "@/hooks/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Colors, Space, Radii, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];

  const id = typeof params.id === "string" ? params.id : "";
  const { user, loading: userLoading } = useUser(id);
  const { trails, loading: trailsLoading } = useUserTrails(id);
  const { reviews, loading: reviewsLoading } = useUserReviews(id);

  const displayName = user?.display_name || user?.email || "Unknown user";

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ImageBackground source={LineBackground} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.9)", borderColor: "rgba(154,184,244,0.6)" }]} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={palette.primary} />
              <Text style={[styles.backText, { color: palette.primary }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={8}>
              <Image source={require("@/assets/images/logo.svg")} style={styles.logoMark} contentFit="contain" />
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            {userLoading ? (
              <>
                <Skeleton height={32} width="50%" radius={8} style={{ marginBottom: Space.xs }} />
                <Skeleton height={16} width="70%" radius={6} style={{ marginBottom: Space.md }} />
              </>
            ) : (
              <>
                <Text style={[styles.name, { color: palette.primary }]}>{displayName}</Text>
                {user?.bio ? <Text style={[styles.bio, { color: palette.mutedText }]}>{user.bio}</Text> : null}
                {user?.location ? (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={palette.mutedText} />
                    <Text style={[styles.bio, { color: palette.mutedText }]}>{user.location}</Text>
                  </View>
                ) : null}
              </>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.primary }]}>Trails</Text>
              {trailsLoading ? (
                <View style={{ gap: Space.xs }}>
                  <Skeleton height={44} radius={Radii.md} />
                  <Skeleton height={44} radius={Radii.md} />
                </View>
              ) : trails.length === 0 ? (
                <View style={[styles.item, { backgroundColor: palette.fieldBg, borderColor: palette.border }]}>
                  <Ionicons name="map-outline" size={16} color={palette.primary} />
                  <Text style={[styles.itemText, { color: palette.mutedText }]}>No trails yet.</Text>
                </View>
              ) : (
                trails.map((trail) => (
                  <View key={trail.id} style={[styles.item, { backgroundColor: palette.fieldBg, borderColor: palette.border }]}>
                    <Ionicons name="map-outline" size={16} color={palette.primary} />
                    <Text style={[styles.itemText, { color: palette.mutedText }]}>{trail.name}</Text>
                    {trail.distance_km ? (
                      <Text style={[styles.itemText, { marginLeft: "auto", color: palette.mutedText }]}>{trail.distance_km.toFixed(1)} km</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.primary }]}>Reviews</Text>
              {reviewsLoading ? (
                <View style={{ gap: Space.xs }}>
                  <Skeleton height={44} radius={Radii.md} />
                  <Skeleton height={44} radius={Radii.md} />
                </View>
              ) : reviews.length === 0 ? (
                <View style={[styles.item, { backgroundColor: palette.fieldBg, borderColor: palette.border }]}>
                  <Ionicons name="star-outline" size={16} color={palette.primary} />
                  <Text style={[styles.itemText, { color: palette.mutedText }]}>No reviews yet.</Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={[styles.item, { backgroundColor: palette.fieldBg, borderColor: palette.border, marginBottom: 6 }]}>
                    <Ionicons name="star" size={16} color={palette.primary} />
                    <Text style={[styles.itemText, { color: palette.mutedText }]}>{review.name}</Text>
                    <Text style={[styles.itemText, { marginLeft: "auto", color: palette.primary }]}>{"★".repeat(review.rating)}</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.23 },
  content: {
    paddingTop: Platform.OS === "android" ? 18 : 22,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  backText: { fontWeight: "900", fontSize: FontSize.sm },
  logoMark: { width: 38, height: 46 },
  card: {
    width: "100%",
    borderRadius: Radii.lg,
    padding: Space.md,
    borderWidth: 2,
    shadowColor: "#2B4D7A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  name: { fontSize: 28, fontWeight: "900" },
  bio: { fontSize: FontSize.sm, fontWeight: "700", marginTop: 4, marginBottom: Space.sm },
  section: { marginTop: Space.sm, gap: Space.xs },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "900", marginBottom: Space.xs },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  itemText: { fontWeight: "700" },
});
