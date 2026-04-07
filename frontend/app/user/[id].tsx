import React, { useMemo } from "react";
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import LineBackground from "@/assets/images/group-R5.svg";

const COLORS = {
  blue: "#9AB8F4",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  card: "#F6F8FC",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
  dark: "#111111",
};

const USER_MOCK: Record<string, { name: string; bio: string }> = {
  u1: { name: "Ivan Ivanov", bio: "Hike lover. Weekend explorer." },
  u2: { name: "Maria Petrova", bio: "MTB and mountains." },
  u3: { name: "Georgi Georgiev", bio: "Ski season all year (almost)." },
  u4: { name: "Petar Petrov", bio: "Long rides, big climbs." },
  u5: { name: "Nikol Nikolova", bio: "Trail builder & photographer." },
  u6: { name: "Elena Dimitrova", bio: "Ski touring beginner." },
};

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const id = typeof params.id === "string" ? params.id : "unknown";
  const user = USER_MOCK[id] ?? { name: "Unknown user", bio: "No details yet." };

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
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.bio}>{user.bio}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trails</Text>
              <View style={styles.item}>
                <Ionicons name="map-outline" size={16} color={COLORS.primaryText} />
                <Text style={styles.itemText}>No trails loaded yet (mock).</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Posts</Text>
              <View style={styles.item}>
                <Ionicons name="images-outline" size={16} color={COLORS.primaryText} />
                <Text style={styles.itemText}>No posts loaded yet (mock).</Text>
              </View>
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

