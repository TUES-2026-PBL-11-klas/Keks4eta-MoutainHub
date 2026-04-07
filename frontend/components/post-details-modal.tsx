import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const COLORS = {
  blue: "#9AB8F4",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  card: "#F6F8FC",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
  dark: "#111111",
};

export type FeedPost = {
  id: string;
  userId: string;
  user: string;
  title: string;
  subtitle: string;
  photos: any[];
};

export function PostDetailsModal({
  visible,
  post,
  onClose,
  onViewProfile,
}: {
  visible: boolean;
  post: FeedPost | null;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
}) {
  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Post</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color={COLORS.primaryText} />
            </Pressable>
          </View>

          <Pressable style={styles.userRow} onPress={() => onViewProfile(post.userId)} hitSlop={8}>
            <View style={styles.userDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{post.user}</Text>
              <Text style={styles.meta}>
                {post.title} • <Text style={styles.metaStrong}>{post.subtitle}</Text>
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.mutedText} />
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {post.photos.map((src, idx) => (
              <Image key={idx} source={src} style={styles.photo} contentFit="cover" />
            ))}
          </ScrollView>

          <View style={styles.actionsRow}>
            <Pressable style={[styles.button, styles.secondary]} onPress={onClose}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Close</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primary]} onPress={() => onViewProfile(post.userId)}>
              <Text style={styles.buttonText}>Open profile</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 840,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.blue,
    shadowColor: "#2B4D7A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: "900",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "rgba(154,184,244,0.65)",
    marginBottom: 12,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: COLORS.fieldBg,
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  userName: {
    color: COLORS.primaryText,
    fontWeight: "900",
    fontSize: 14,
  },
  meta: {
    color: COLORS.mutedText,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 2,
  },
  metaStrong: {
    color: COLORS.primaryText,
    fontWeight: "900",
  },
  photoRow: {
    gap: 10,
    paddingBottom: 2,
  },
  photo: {
    width: 280,
    height: 170,
    borderRadius: 18,
    backgroundColor: COLORS.card,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: COLORS.primaryText,
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryText: {
    color: COLORS.primaryText,
  },
});

