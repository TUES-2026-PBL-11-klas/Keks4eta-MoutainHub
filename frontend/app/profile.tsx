import React, { useEffect, useMemo, useState } from "react";
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

import LineBackground from "@/assets/images/group-R5.svg";
import { isLoggedIn, logout } from "@/lib/auth";

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

type UserMode = "walk" | "ski" | "mtb";

const MODE_CONFIG: Record<UserMode, { label: string; color: string }> = {
  walk: { label: "Hike", color: COLORS.green },
  ski: { label: "Ski", color: COLORS.blue },
  mtb: { label: "Bike", color: COLORS.brown },
};

export default function ProfileScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const [ready, setReady] = useState(false);
  const [edit, setEdit] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>("mtb");

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await isLoggedIn();
      if (cancelled) return;
      if (!ok) {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const refresh = () => {
    router.replace(pathname as any);
  };

  if (!ready) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />
        <Text style={{ color: COLORS.mutedText, fontWeight: "800" }}>Loading…</Text>
      </View>
    );
  }

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
          <View style={styles.topBar}>
            <Pressable onPress={() => router.replace("/(tabs)")} style={styles.brandRow} hitSlop={8}>
              <Image
                source={require("@/assets/images/logo.svg")}
                style={styles.logoMark}
                contentFit="contain"
              />
            </Pressable>

            <View style={styles.modePills}>
              {(Object.keys(MODE_CONFIG) as UserMode[]).map((mode) => {
                const cfg = MODE_CONFIG[mode];
                const isActive = userMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setUserMode(mode)}
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
              <Pressable style={styles.iconButton} onPress={refresh} hitSlop={8}>
                <Ionicons name="search-outline" size={20} color={COLORS.dark} />
              </Pressable>
              <Pressable
                style={styles.profileDot}
                hitSlop={8}
                onPress={async () => {
                  await logout();
                  router.replace("/login");
                }}
              />
            </View>
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.profileTitle}>Profile</Text>
            <Image
              source={require("@/assets/images/logotext.svg")}
              style={styles.headerLogo}
              contentFit="contain"
            />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.photoCol}>
              <View style={styles.avatarRing}>
                <Image
                  source={require("@/assets/images/profile image.png")}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </View>
            </View>

            <View style={styles.formCol}>
              <View style={styles.formRow}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    value={form.name}
                    onChangeText={(v) => setForm((c) => ({ ...c, name: v }))}
                    placeholder="Name"
                    placeholderTextColor="#90A6CB"
                    style={styles.input}
                    editable={edit}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={form.email}
                    onChangeText={(v) => setForm((c) => ({ ...c, email: v }))}
                    placeholder="Email"
                    placeholderTextColor="#90A6CB"
                    style={styles.input}
                    editable={edit}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Surname</Text>
                  <TextInput
                    value={form.surname}
                    onChangeText={(v) => setForm((c) => ({ ...c, surname: v }))}
                    placeholder="Surname"
                    placeholderTextColor="#90A6CB"
                    style={styles.input}
                    editable={edit}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    value={form.password}
                    onChangeText={(v) => setForm((c) => ({ ...c, password: v }))}
                    placeholder="Password"
                    placeholderTextColor="#90A6CB"
                    style={styles.input}
                    editable={edit}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={styles.secondaryButton} onPress={() => router.push("/new-trail")}>
                  <Text style={styles.secondaryButtonText}>Add new trail</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={() => setEdit((v) => !v)}>
                  <Text style={styles.primaryButtonText}>
                    {edit ? "Save profile" : "Edit profile"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Image
            source={require("@/assets/images/image mountain horizontal.jpg")}
            style={styles.bottomImage}
            contentFit="cover"
          />
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
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isCompact ? 10 : 16,
      marginBottom: isCompact ? 10 : 14,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: isCompact ? 90 : 120,
      flexShrink: 0,
    },
    logoMark: {
      width: isCompact ? 34 : 44,
      height: isCompact ? 40 : 52,
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
    headerRow: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    profileTitle: {
      color: COLORS.blue,
      fontSize: isCompact ? 28 : 36,
      fontWeight: "900",
    },
    headerLogo: {
      marginRight: 400,
      width: isCompact ? 260 : 420,
      height: isCompact ? 70 : 100,
    },
    profileCard: {
      width: "100%",
      backgroundColor: COLORS.white,
      borderRadius: 28,
      padding: isCompact ? 14 : 18,
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 10,
      flexDirection: isCompact ? "column" : "row",
      gap: isCompact ? 12 : 18,
      marginBottom: 14,
    },
    photoCol: {
      width: isCompact ? "100%" : 240,
      alignItems: isCompact ? "center" : "flex-start",
      justifyContent: "flex-start",
      paddingTop: isCompact ? 0 : 6,
    },
    avatarRing: {
      width: isCompact ? 150 : 170,
      height: isCompact ? 150 : 170,
      borderRadius: 999,
      backgroundColor: COLORS.blue,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: isCompact ? 132 : 150,
      height: isCompact ? 132 : 150,
      borderRadius: 999,
      backgroundColor: COLORS.white,
    },
    formCol: {
      flex: 1,
      justifyContent: "flex-start",
      gap: 10,
    },
    formRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    label: {
      color: COLORS.blue,
      fontSize: isCompact ? 14 : 15,
      fontWeight: "800",
      marginBottom: 4,
      marginLeft: 8,
    },
    input: {
      height: isCompact ? 42 : 46,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      paddingHorizontal: 18,
      color: COLORS.primaryText,
      fontSize: isCompact ? 15 : 16,
      opacity: 0.98,
    },
    actionsRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: 10,
      marginTop: 6,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: COLORS.primaryText,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    primaryButtonText: {
      color: COLORS.white,
      fontSize: 14,
      fontWeight: "900",
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderWidth: 2,
      borderColor: COLORS.blue,
    },
    secondaryButtonText: {
      color: COLORS.primaryText,
      fontSize: 14,
      fontWeight: "900",
    },
    bottomImage: {
      width: "100%",
      height: isCompact ? 160 : 240,
      borderRadius: 28,
      overflow: "hidden",
    },

  });
}

