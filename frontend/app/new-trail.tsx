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
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";

import LineBackground from "@/assets/images/group-R5.svg";
import { useCreateTrail } from "@/hooks/api";
import { getToken } from "@/lib/auth";

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

const DIFFICULTY_NUM: Record<Difficulty, number> = { easy: 1, medium: 3, hard: 5 };
const CATEGORY_MAP: Record<UserMode, string> = { walk: "hiking", ski: "ski", mtb: "mtb" };

function haversineKm(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function getByTag(node: Document | Element, tag: string): HTMLCollectionOf<Element> {
  // getElementsByTagNameNS("*", ...) works regardless of default namespace declarations
  const ns = node.getElementsByTagNameNS("*", tag);
  return ns.length > 0 ? (ns as any) : node.getElementsByTagName(tag);
}

function parseGpx(xml: string): {
  coordinates: [number, number, number][];
  distance_km: number;
  elevation_gain_m: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  // prefer trkpt (track), then rtept (route), then wpt (waypoints)
  let pts = getByTag(doc, "trkpt");
  if (pts.length === 0) pts = getByTag(doc, "rtept");
  if (pts.length === 0) pts = getByTag(doc, "wpt");

  const coordinates: [number, number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i];
    const lat = parseFloat(pt.getAttribute("lat") ?? "0");
    const lon = parseFloat(pt.getAttribute("lon") ?? "0");
    const eleEl = getByTag(pt, "ele")[0];
    const ele = eleEl ? parseFloat(eleEl.textContent ?? "0") : 0;
    coordinates.push([lon, lat, ele]);
  }

  let distance_km = 0;
  let elevation_gain_m = 0;
  for (let i = 1; i < coordinates.length; i++) {
    distance_km += haversineKm(coordinates[i - 1], coordinates[i]);
    const diff = coordinates[i][2] - coordinates[i - 1][2];
    if (diff > 0) elevation_gain_m += diff;
  }

  return {
    coordinates,
    distance_km: Math.round(distance_km * 10) / 10,
    elevation_gain_m: Math.round(elevation_gain_m),
  };
}

export default function NewTrailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const [token, setToken] = useState("");
  const { createTrail, loading, error } = useCreateTrail(token);

  const [trailName, setTrailName] = useState("");
  const [trailDescription, setTrailDescription] = useState("");
  const [trailMode, setTrailMode] = useState<UserMode>("mtb");
  const [trailLengthKm, setTrailLengthKm] = useState("");
  const [trailElevationGain, setTrailElevationGain] = useState("");
  const [trailDifficulty, setTrailDifficulty] = useState<Difficulty>("medium");
  const [trailStartImageUrl, setTrailStartImageUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [gpxFileName, setGpxFileName] = useState<string | null>(null);
  const [gpxCoordinates, setGpxCoordinates] = useState<[number, number, number][]>([]);
  const [gpxParseError, setGpxParseError] = useState<string | null>(null);

  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    getToken().then((t) => setToken(t ?? ""));
  }, []);

  const handlePickGpx = () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: any) => {
    const file: File = e.target.files?.[0];
    if (!file) return;
    setGpxParseError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const xml = evt.target?.result as string;
        const { coordinates, distance_km, elevation_gain_m } = parseGpx(xml);
        if (coordinates.length === 0) {
          setGpxParseError("No track points found in GPX file.");
          return;
        }
        setGpxFileName(file.name);
        setGpxCoordinates(coordinates);
        setTrailLengthKm(String(distance_km));
        setTrailElevationGain(String(elevation_gain_m));
      } catch {
        setGpxParseError("Failed to parse GPX file.");
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!trailName.trim()) { setSaveError("Trail name is required."); return; }
    if (gpxCoordinates.length === 0) { setSaveError("Please upload a GPX file."); return; }

    const result = await createTrail({
      name:              trailName.trim(),
      category:          CATEGORY_MAP[trailMode],
      difficulty:        DIFFICULTY_NUM[trailDifficulty],
      description:       trailDescription.trim() || undefined,
      distance_km:       trailLengthKm ? parseFloat(trailLengthKm) : undefined,
      elevation_gain_m:  trailElevationGain ? parseFloat(trailElevationGain) : undefined,
      route:             { type: "LineString", coordinates: gpxCoordinates },
    });
    if (result) router.back();
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={COLORS.primaryText} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={styles.title}>Add new trail</Text>

            <Pressable
              style={[styles.saveButton, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
              hitSlop={8}
            >
              <Text style={styles.saveButtonText}>{loading ? "Saving…" : "Save"}</Text>
            </Pressable>
          </View>

          {(saveError || error) && (
            <Text style={{ color: "#c0392b", fontWeight: "700", marginBottom: 10, paddingHorizontal: 4 }}>
              {saveError ?? error}
            </Text>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trail name</Text>
            <TextInput
              value={trailName}
              onChangeText={setTrailName}
              placeholder="e.g. Vitosha Loop"
              placeholderTextColor="#90A6CB"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              value={trailDescription}
              onChangeText={setTrailDescription}
              placeholder="Describe the trail…"
              placeholderTextColor="#90A6CB"
              multiline
              style={[styles.input, { height: 80, paddingTop: 12, textAlignVertical: "top" }]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GPX Route</Text>

            {Platform.OS === "web" && (
              // @ts-ignore — web-only hidden file input
              <input
                ref={fileInputRef}
                type="file"
                accept=".gpx"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            )}

            <Pressable
              onPress={handlePickGpx}
              style={({ pressed }) => [styles.gpxButton, pressed && { opacity: 0.75 }]}
            >
              <Ionicons
                name={gpxFileName ? "checkmark-circle" : "cloud-upload-outline"}
                size={22}
                color={gpxFileName ? COLORS.green : COLORS.primaryText}
              />
              <Text style={[styles.gpxButtonText, gpxFileName && { color: COLORS.green }]}>
                {gpxFileName ?? "Upload .gpx file"}
              </Text>
            </Pressable>

            {gpxParseError && (
              <Text style={{ color: "#c0392b", fontSize: 12, fontWeight: "700", marginTop: 6, paddingLeft: 4 }}>
                {gpxParseError}
              </Text>
            )}

            {gpxCoordinates.length > 0 && (
              <View style={styles.gpxStats}>
                <View style={styles.gpxStat}>
                  <Ionicons name="navigate-outline" size={14} color={COLORS.mutedText} />
                  <Text style={styles.gpxStatText}>{gpxCoordinates.length} points</Text>
                </View>
                <View style={styles.gpxStat}>
                  <Ionicons name="resize-outline" size={14} color={COLORS.mutedText} />
                  <Text style={styles.gpxStatText}>{trailLengthKm} km</Text>
                </View>
                <View style={styles.gpxStat}>
                  <Ionicons name="trending-up-outline" size={14} color={COLORS.mutedText} />
                  <Text style={styles.gpxStatText}>{trailElevationGain} m gain</Text>
                </View>
              </View>
            )}

            {Platform.OS !== "web" && (
              <Text style={[styles.hint, { marginTop: 6 }]}>
                GPX upload is only available in the web app.
              </Text>
            )}
          </View>

          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>Distance (km)</Text>
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
              <Text style={styles.label}>Elevation gain (m)</Text>
              <TextInput
                value={trailElevationGain}
                onChangeText={setTrailElevationGain}
                placeholder="e.g. 450"
                placeholderTextColor="#90A6CB"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
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
    gpxButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      paddingVertical: 12,
      paddingHorizontal: 18,
    },
    gpxButtonText: {
      color: COLORS.primaryText,
      fontSize: 14,
      fontWeight: "700",
      flex: 1,
    },
    gpxStats: {
      flexDirection: "row",
      gap: 16,
      paddingLeft: 8,
      marginTop: 10,
      flexWrap: "wrap",
    },
    gpxStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    gpxStatText: {
      color: COLORS.mutedText,
      fontSize: 12,
      fontWeight: "700",
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
