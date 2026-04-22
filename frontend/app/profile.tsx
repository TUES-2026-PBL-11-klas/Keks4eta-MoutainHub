import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as ImagePicker from "expo-image-picker";

import LineBackground from "@/assets/images/group-R5.svg";
import { useAuth } from "@/lib/auth-context";
import { useUpdateProfile, useUserTrails } from "@/hooks/api";
import { useUserPosts } from "@/hooks/posts";
import { PostCard } from "@/components/PostCard";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

const COLORS = {
  green: "#00DF56",
  blue: "#9AB8F4",
  brown: "#83593D",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  white: "#FFFFFF",
  dark: "#111111",
  fieldBg: "#EEF3FB",
};

type UserMode = "walk" | "ski" | "mtb";
const MODE_CONFIG: Record<UserMode, { label: string; color: string }> = {
  walk: { label: "Hike", color: COLORS.green },
  ski:  { label: "Ski",  color: COLORS.blue },
  mtb:  { label: "Bike", color: COLORS.brown },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const { isAuthed, ready, user, token, patchUser } = useAuth();
  const toast = useToast();

  const { updateProfile, loading: saving, error: saveError } = useUpdateProfile(token ?? "");
  const { trails, loading: trailsLoading } = useUserTrails(user?.userId ?? "");
  const { posts: userPosts, loading: postsLoading } = useUserPosts(user?.userId ?? "");

  const [userMode, setUserMode] = useState<UserMode>("mtb");
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (!ready) return;
    if (!isAuthed) { router.replace("/login"); return; }
  }, [ready, isAuthed, router]);

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName ?? "",
      bio: "",
      location: "",
    });
  }, [user?.userId]);

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to change your avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
      } as any);

      const uploadRes = await fetch(`${API_URL}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();
      const ok = await updateProfile({ avatar_url: url });
      if (ok) {
        await patchUser({ avatarUrl: url });
        toast.success("Avatar updated!");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    const ok = await updateProfile({
      display_name: form.displayName.trim() || undefined,
      bio: form.bio.trim() || undefined,
      location: form.location.trim() || undefined,
    });
    if (ok) {
      await patchUser({ displayName: form.displayName.trim() });
      setEditing(false);
      toast.success("Profile saved!");
    }
  };

  if (!ready) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={COLORS.primaryText} size="large" />
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
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.replace("/(tabs)")} style={styles.brandRow} hitSlop={8}>
              <Image source={require("@/assets/images/logo.svg")} style={styles.logoMark} contentFit="contain" />
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
                    accessibilityRole="button"
                    accessibilityLabel={cfg.label}
                  >
                    <View style={[styles.pillDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{cfg.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.topActions}>
              <ProfileMenu size={isCompact ? 32 : 38} />
            </View>
          </View>

          {/* ── Header row ── */}
          <View style={styles.headerRow}>
            <Text style={styles.profileTitle}>Profile</Text>
            <Image
              source={require("@/assets/images/logotext.svg")}
              style={styles.headerLogo}
              contentFit="contain"
            />
          </View>

          {saveError ? <ErrorBanner message={saveError} /> : null}

          {/* ── Profile card ── */}
          <View style={styles.profileCard}>
            {/* Avatar column */}
            <View style={styles.photoCol}>
              <Pressable
                onPress={handlePickAvatar}
                disabled={avatarUploading}
                style={styles.avatarWrapper}
                accessibilityLabel="Change profile picture"
                accessibilityRole="button"
              >
                <Avatar
                  uri={user?.avatarUrl}
                  name={user?.displayName}
                  size={isCompact ? 130 : 150}
                  ring
                />
                <View style={styles.avatarBadge}>
                  {avatarUploading
                    ? <ActivityIndicator size="small" color={COLORS.white} />
                    : <Ionicons name="camera" size={14} color={COLORS.white} />}
                </View>
              </Pressable>
            </View>

            {/* Form column */}
            <View style={styles.formCol}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  value={form.displayName}
                  onChangeText={(v) => setForm((c) => ({ ...c, displayName: v }))}
                  placeholder="Your name"
                  placeholderTextColor="#90A6CB"
                  style={[styles.input, !editing && styles.inputReadonly]}
                  editable={editing}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  value={form.bio}
                  onChangeText={(v) => setForm((c) => ({ ...c, bio: v }))}
                  placeholder="Tell people about yourself"
                  placeholderTextColor="#90A6CB"
                  style={[styles.input, styles.inputMultiline, !editing && styles.inputReadonly]}
                  editable={editing}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  value={form.location}
                  onChangeText={(v) => setForm((c) => ({ ...c, location: v }))}
                  placeholder="City, Country"
                  placeholderTextColor="#90A6CB"
                  style={[styles.input, !editing && styles.inputReadonly]}
                  editable={editing}
                />
              </View>

              <View style={styles.actionsRow}>
                {editing ? (
                  <>
                    <Button
                      label="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={() => setEditing(false)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label={saving ? "Saving…" : "Save"}
                      variant="primary"
                      size="sm"
                      loading={saving}
                      onPress={handleSave}
                      style={{ flex: 1 }}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      label="Edit Profile"
                      variant="secondary"
                      size="sm"
                      onPress={() => setEditing(true)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Add Trail"
                      variant="primary"
                      size="sm"
                      onPress={() => router.push("/new-trail")}
                      style={{ flex: 1 }}
                    />
                  </>
                )}
              </View>
            </View>
          </View>

          {/* ── My Trails ── */}
          <Text style={styles.sectionTitle}>My Trails</Text>
          {trailsLoading ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={72} radius={16} />
              <Skeleton height={72} radius={16} />
            </View>
          ) : trails.length === 0 ? (
            <EmptyState
              icon="map-outline"
              title="No trails yet"
              description="Start exploring and add your first trail."
              actionLabel="Add Trail"
              onAction={() => router.push("/new-trail")}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {trails.map((trail) => (
                <Card key={trail.id} style={styles.trailCard}>
                  <View style={[styles.trailColorBar, {
                    backgroundColor:
                      trail.category === "hiking" ? COLORS.green
                      : trail.category === "ski" ? COLORS.blue
                      : COLORS.brown
                  }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trailName} numberOfLines={1}>{trail.name}</Text>
                    <Text style={styles.trailMeta}>
                      {trail.distance_km} km · {trail.elevation_gain_m} m gain · ★{trail.difficulty}/5
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── My Posts ── */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Posts</Text>
          {postsLoading ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={100} radius={12} />
              <Skeleton height={100} radius={12} />
            </View>
          ) : userPosts.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="No posts yet"
              description="Share your experiences with the community."
              actionLabel="Create Post"
              onAction={() => router.push("/posts/new" as any)}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  authorName={user?.displayName}
                  authorAvatar={user?.avatarUrl}
                  isOwner
                />
              ))}
            </View>
          )}

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
    screen: { flex: 1, backgroundColor: COLORS.white },
    background: { flex: 1 },
    backgroundImage: { opacity: 0.23 },
    content: {
      paddingTop: Platform.OS === "android" ? 18 : 22,
      paddingBottom: 24,
      paddingHorizontal: isCompact ? 14 : 28,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isCompact ? 10 : 16,
      marginBottom: isCompact ? 10 : 14,
    },
    brandRow: { maxWidth: isCompact ? 90 : 120, flexShrink: 0 },
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
    topActions: { flexDirection: "row", alignItems: "center" },
    headerRow: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    profileTitle: { color: COLORS.blue, fontSize: isCompact ? 28 : 36, fontWeight: "900" },
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
      marginBottom: 20,
    },
    photoCol: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 4,
    },
    avatarWrapper: { position: "relative" },
    avatarBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.primaryText,
      alignItems: "center",
      justifyContent: "center",
    },
    formCol: { flex: 1, gap: 10 },
    fieldGroup: { gap: 4 },
    label: {
      color: COLORS.blue,
      fontSize: isCompact ? 13 : 14,
      fontWeight: "800",
      marginLeft: 8,
    },
    input: {
      minHeight: isCompact ? 42 : 46,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 16,
      backgroundColor: COLORS.fieldBg,
      paddingHorizontal: 18,
      paddingVertical: 10,
      color: COLORS.primaryText,
      fontSize: isCompact ? 15 : 16,
    },
    inputMultiline: { height: 80, textAlignVertical: "top" },
    inputReadonly: { opacity: 0.75, borderColor: "#C8D8EE" },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    sectionTitle: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 18 : 22,
      fontWeight: "900",
      marginBottom: 12,
    },
    trailCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      overflow: "hidden",
      padding: 14,
    },
    trailColorBar: {
      width: 4,
      alignSelf: "stretch",
      borderRadius: 2,
    },
    trailName: {
      color: COLORS.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    trailMeta: {
      color: COLORS.mutedText,
      fontSize: 13,
      marginTop: 2,
    },
    bottomImage: {
      width: "100%",
      height: isCompact ? 160 : 240,
      borderRadius: 28,
      overflow: "hidden",
      marginTop: 24,
    },
  });
}
