import React, { useMemo, useState } from "react";
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
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";

import LineBackground from "@/assets/images/group-R5.svg";

const COLORS = {
  green: "#00DF56",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  blue: "#9AB8F4",
  brown: "#83593D",
  card: "#F6F8FC",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
};

type UserMode = "walk" | "ski" | "mtb";
type Difficulty = "easy" | "medium" | "hard";

const MODE_CONFIG: Record<UserMode, { label: string; color: string }> = {
  walk: { label: "Hike", color: COLORS.green },
  ski: { label: "Ski", color: COLORS.blue },
  mtb: { label: "Bike", color: COLORS.brown },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: "Easy", color: COLORS.green },
  medium: { label: "Medium", color: COLORS.blue },
  hard: { label: "Hard", color: COLORS.brown },
};

export default function NewTrailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const [trailMode, setTrailMode] = useState<UserMode>("mtb");
  const [trailLengthKm, setTrailLengthKm] = useState("");
  const [trailDifficulty, setTrailDifficulty] = useState<Difficulty>("medium");
  const [trailStartImageUrl, setTrailStartImageUrl] = useState("");

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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={COLORS.primaryText} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={styles.title}>Add new trail</Text>

            <Pressable
              style={styles.saveButton}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Map</Text>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={28} color={COLORS.mutedText} />
              <Text style={styles.mapPlaceholderTitle}>Pick the trail on the map</Text>
              <Text style={styles.mapPlaceholderText}>
                Map integration will be connected to your backend later.
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>How long (km)</Text>
              <TextInput
                value={trailLengthKm}
                onChangeText={setTrailLengthKm}
                placeholder="e.g. 12.5"
                placeholderTextColor="#90A6CB"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.chipsRow}>
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const active = trailDifficulty === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setTrailDifficulty(d)}
                      style={({ pressed }) => [
                        styles.chip,
                        { borderColor: cfg.color },
                        active && styles.chipActive,
                        pressed && { opacity: 0.75 },
                      ]}
                    >
                      <View style={[styles.chipDot, { backgroundColor: cfg.color }]} />
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {cfg.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.difficultyColorRow}>
                <Text style={styles.hint}>Color for difficulty:</Text>
                <View
                  style={[
                    styles.difficultyColorSwatch,
                    { backgroundColor: DIFFICULTY_CONFIG[trailDifficulty].color },
                  ]}
                />
                <Text style={styles.hintStrong}>{DIFFICULTY_CONFIG[trailDifficulty].label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.chipsRow}>
              {(Object.keys(MODE_CONFIG) as UserMode[]).map((m) => {
                const cfg = MODE_CONFIG[m];
                const active = trailMode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setTrailMode(m)}
                    style={({ pressed }) => [
                      styles.chip,
                      { borderColor: cfg.color },
                      active && styles.chipActive,
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <View style={[styles.chipDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {cfg.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Starting point image</Text>
            <Text style={styles.hint}>
              Paste an image URL for now (later we can add real image picking/upload).
            </Text>
            <TextInput
              value={trailStartImageUrl}
              onChangeText={setTrailStartImageUrl}
              placeholder="https://..."
              placeholderTextColor="#90A6CB"
              autoCapitalize="none"
              style={styles.input}
            />
            {trailStartImageUrl.trim() ? (
              <Image
                source={{ uri: trailStartImageUrl.trim() }}
                style={styles.startImagePreview}
                contentFit="cover"
              />
            ) : null}
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
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },
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
    backText: {
      color: COLORS.primaryText,
      fontWeight: "900",
      fontSize: 13,
    },
    title: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 22 : 28,
      fontWeight: "900",
      textAlign: "center",
      flex: 1,
    },
    saveButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: COLORS.primaryText,
    },
    saveButtonText: {
      color: COLORS.white,
      fontWeight: "900",
      fontSize: 13,
    },
    section: {
      marginBottom: 14,
    },
    sectionTitle: {
      color: COLORS.primaryText,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 8,
    },
    mapPlaceholder: {
      height: isCompact ? 180 : 220,
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
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },
    mapPlaceholderText: {
      color: COLORS.mutedText,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "600",
      maxWidth: 520,
      lineHeight: 18,
    },
    grid: {
      flexDirection: isCompact ? "column" : "row",
      gap: 12,
      marginBottom: 14,
    },
    field: {
      flex: 1,
      gap: 6,
    },
    label: {
      color: COLORS.blue,
      fontSize: 14,
      fontWeight: "800",
      marginLeft: 8,
    },
    input: {
      height: 44,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      paddingHorizontal: 18,
      color: COLORS.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    hint: {
      color: COLORS.mutedText,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
    },
    hintStrong: {
      color: COLORS.primaryText,
      fontSize: 12,
      fontWeight: "900",
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingLeft: 4,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: COLORS.white,
    },
    chipActive: {
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    chipDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      marginRight: 8,
    },
    chipText: {
      color: COLORS.primaryText,
      fontSize: 13,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    chipTextActive: {
      color: "#111111",
    },
    difficultyColorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingLeft: 4,
      marginTop: 6,
    },
    difficultyColorSwatch: {
      width: 22,
      height: 12,
      borderRadius: 6,
    },
    startImagePreview: {
      width: "100%",
      height: isCompact ? 150 : 200,
      borderRadius: 18,
      marginTop: 10,
      borderWidth: 1,
      borderColor: "rgba(154,184,244,0.55)",
      backgroundColor: COLORS.card,
    },
  });
}

