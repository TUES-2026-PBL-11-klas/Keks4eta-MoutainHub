import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePost, useComments, useCreateComment, useDeleteComment, useDeletePost } from '@/hooks/posts';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { CommentThread } from '@/components/CommentThread';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Colors, Fonts, FontSize, Space, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { isAuthed, user, token } = useAuth();
  const toast = useToast();

  const { post, loading: postLoading, error: postError } = usePost(id);
  const { comments, loading: commentsLoading, refresh: refreshComments } = useComments(id);
  const { createComment, loading: commenting } = useCreateComment(token ?? '');
  const { deleteComment } = useDeleteComment(token ?? '');
  const { deletePost } = useDeletePost(token ?? '');

  const [newComment, setNewComment] = useState('');

  const handleTopLevelComment = async () => {
    if (!newComment.trim()) return;
    const result = await createComment(id, { content: newComment.trim() });
    if (result) { setNewComment(''); refreshComments(); }
    else toast.error('Failed to post comment.');
  };

  const handleReply = async (parentId: string, content: string) => {
    await createComment(id, { content, parent_comment_id: parentId });
    refreshComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    const ok = await deleteComment(commentId);
    if (ok) refreshComments();
    else toast.error('Failed to delete comment.');
  };

  const handleDeletePost = async () => {
    if (!post) return;
    const ok = await deletePost(post.id);
    if (ok) { toast.success('Post deleted.'); router.back(); }
    else toast.error('Failed to delete post.');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        {/* Back */}
        <Button
          label="Back"
          variant="ghost"
          size="sm"
          leading={<Ionicons name="arrow-back" size={16} color={palette.primary} />}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: Space.md }}
        />

        {postError ? <ErrorBanner message={postError} /> : null}

        {postLoading ? (
          <>
            <Skeleton height={20} width="60%" radius={8} style={{ marginBottom: Space.sm }} />
            <Skeleton height={80} radius={8} />
          </>
        ) : post ? (
          <View style={[styles.postBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={styles.postHeader}>
              <Avatar name={user?.userId === post.user_id ? user?.displayName : post.user_id.slice(0, 6)} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.authorName, { color: palette.text, fontFamily: Fonts.sans }]}>
                  {user?.userId === post.user_id ? (user?.displayName || 'You') : `user·${post.user_id.slice(0, 6)}`}
                </Text>
                <Text style={[styles.time, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
                  {new Date(post.created_at).toLocaleDateString()}
                </Text>
              </View>
              {user?.userId === post.user_id ? (
                <Button
                  label="Delete"
                  variant="danger"
                  size="sm"
                  onPress={handleDeletePost}
                />
              ) : null}
            </View>
            <Text style={[styles.postContent, { color: palette.text, fontFamily: Fonts.sans }]}>
              {post.content}
            </Text>
          </View>
        ) : null}

        {/* Comments */}
        <Text style={[styles.commentsHeading, { color: palette.text, fontFamily: Fonts.sans }]}>
          Comments
        </Text>

        {commentsLoading ? (
          <View style={{ gap: Space.sm }}>
            <Skeleton height={60} radius={8} />
            <Skeleton height={60} radius={8} />
          </View>
        ) : (
          <CommentThread
            comments={comments}
            currentUserId={user?.userId}
            onReply={handleReply}
            onDelete={handleDeleteComment}
          />
        )}

        {isAuthed ? (
          <View style={[styles.newComment, { borderTopColor: palette.border }]}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment…"
              placeholderTextColor={palette.mutedText}
              style={[
                styles.commentInput,
                { color: palette.text, borderColor: palette.border, backgroundColor: palette.fieldBg },
              ]}
              multiline
            />
            <Button
              label={commenting ? 'Posting…' : 'Post'}
              variant="primary"
              size="sm"
              loading={commenting}
              onPress={handleTopLevelComment}
              style={{ alignSelf: 'flex-end' }}
            />
          </View>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  postBox: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.sm,
    marginBottom: Space.lg,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  authorName: { fontSize: FontSize.md, fontWeight: '700' },
  time: { fontSize: FontSize.xs },
  postContent: { fontSize: FontSize.md, lineHeight: 24 },
  commentsHeading: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: Space.sm },
  newComment: {
    marginTop: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: 1,
    gap: Space.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Space.sm,
    fontSize: FontSize.sm,
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
