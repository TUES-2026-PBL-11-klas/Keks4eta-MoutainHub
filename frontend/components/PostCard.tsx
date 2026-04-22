import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Post } from '@/hooks/posts';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Colors, FontSize, Fonts, Space, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PostCardProps = {
  post: Post;
  authorName?: string;
  authorAvatar?: string | null;
  onDelete?: () => void;
  isOwner?: boolean;
};

export function PostCard({ post, authorName, authorAvatar, onDelete, isOwner }: PostCardProps) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card padded={false} style={styles.card}>
      <Pressable
        onPress={() => router.push(`/posts/${post.id}` as any)}
        style={({ pressed }) => [styles.inner, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel={`Open post by ${authorName ?? 'user'}`}
      >
        <View style={styles.header}>
          <Avatar uri={authorAvatar} name={authorName} size={36} />
          <View style={styles.meta}>
            <Text style={[styles.author, { color: palette.text, fontFamily: Fonts.sans }]}>
              {authorName ?? 'Anonymous'}
            </Text>
            <Text style={[styles.time, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
              {timeAgo(post.created_at)}
            </Text>
          </View>
          {isOwner && onDelete ? (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityLabel="Delete post"
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={18} color={palette.danger} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.content, { color: palette.text, fontFamily: Fonts.sans }]}>
          {post.content}
        </Text>

        <View style={styles.footer}>
          <Ionicons name="chatbubble-outline" size={14} color={palette.mutedText} />
          <Text style={[styles.commentCount, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
            {post.comment_count ?? 0}
          </Text>
          {post.trail_id ? (
            <View style={[styles.trailBadge, { backgroundColor: palette.fieldBg }]}>
              <Ionicons name="map-outline" size={12} color={palette.primary} />
              <Text style={[styles.trailBadgeText, { color: palette.primary, fontFamily: Fonts.sans }]}>
                trail linked
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  inner: { padding: Space.md, gap: Space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  meta: { flex: 1 },
  author: { fontSize: FontSize.md, fontWeight: '700' },
  time: { fontSize: FontSize.xs },
  content: { fontSize: FontSize.md, lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
  commentCount: { fontSize: FontSize.xs, marginRight: Space.sm },
  trailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.sm,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  trailBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
});
