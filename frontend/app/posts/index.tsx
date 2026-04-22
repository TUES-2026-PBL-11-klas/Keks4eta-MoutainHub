import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePostsFeed, useDeletePost } from '@/hooks/posts';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { Screen } from '@/components/ui/Screen';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Colors, Fonts, FontSize, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PostsFeedScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { isAuthed, user, token } = useAuth();
  const toast = useToast();

  const { posts, loading, error, refresh } = usePostsFeed({ size: 30 });
  const { deletePost } = useDeletePost(token ?? '');

  const handleDelete = async (postId: string) => {
    const ok = await deletePost(postId);
    if (ok) { toast.success('Post deleted.'); refresh(); }
    else toast.error('Failed to delete post.');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Text style={[styles.title, { color: palette.primary, fontFamily: Fonts.sans }]}>Community</Text>
        <View style={styles.headerRight}>
          {isAuthed ? (
            <Button
              label="New Post"
              variant="primary"
              size="sm"
              onPress={() => router.push('/posts/new' as any)}
            />
          ) : null}
          <ProfileMenu size={32} />
        </View>
      </View>

      <Screen scroll padded>
        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <View style={{ gap: Space.sm }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={120} radius={12} />)}
          </View>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No posts yet"
            description="Be the first to share something with the community."
            actionLabel={isAuthed ? 'Create Post' : undefined}
            onAction={isAuthed ? () => router.push('/posts/new' as any) : undefined}
          />
        ) : (
          <View style={{ gap: Space.sm }}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                authorName={post.user_id === user?.userId ? user.displayName : undefined}
                authorAvatar={post.user_id === user?.userId ? user.avatarUrl : undefined}
                isOwner={post.user_id === user?.userId}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
          </View>
        )}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderBottomWidth: 1,
  },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
});
