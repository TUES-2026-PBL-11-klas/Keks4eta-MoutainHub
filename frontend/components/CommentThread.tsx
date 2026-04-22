import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '@/hooks/posts';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Colors, FontSize, Fonts, Space, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CommentNodeProps = {
  comment: Comment;
  children: Comment[];
  allComments: Comment[];
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
};

function CommentNode({
  comment,
  children,
  allComments,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: CommentNodeProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setReplying(false);
    setSubmitting(false);
  };

  return (
    <View style={[styles.node, depth > 0 && { marginLeft: Math.min(depth * 20, 60) }]}>
      <View style={[styles.bubble, { backgroundColor: depth > 0 ? palette.surface : palette.fieldBg }]}>
        <View style={styles.header}>
          <Avatar size={28} name={comment.user_id.slice(0, 6)} />
          <Text style={[styles.userId, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
            user·{comment.user_id.slice(0, 6)}
          </Text>
          <Text style={[styles.time, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
            {timeAgo(comment.created_at)}
          </Text>
          {currentUserId === comment.user_id ? (
            <Pressable onPress={() => onDelete(comment.id)} hitSlop={8} accessibilityLabel="Delete comment">
              <Ionicons name="trash-outline" size={14} color={palette.danger} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.content, { color: palette.text, fontFamily: Fonts.sans }]}>
          {comment.content}
        </Text>

        {currentUserId ? (
          <Pressable onPress={() => setReplying((v) => !v)} style={styles.replyTrigger}>
            <Ionicons name="return-down-forward-outline" size={13} color={palette.primary} />
            <Text style={[styles.replyLabel, { color: palette.primary, fontFamily: Fonts.sans }]}>Reply</Text>
          </Pressable>
        ) : null}
      </View>

      {replying ? (
        <View style={[styles.replyBox, { marginLeft: 20 }]}>
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply…"
            placeholderTextColor={palette.mutedText}
            style={[
              styles.replyInput,
              { color: palette.text, borderColor: palette.border, backgroundColor: palette.fieldBg },
            ]}
            multiline
            autoFocus
          />
          <View style={styles.replyActions}>
            <Button label="Cancel" variant="ghost" size="sm" onPress={() => setReplying(false)} />
            <Button
              label={submitting ? 'Posting…' : 'Post'}
              variant="primary"
              size="sm"
              loading={submitting}
              onPress={handleSubmitReply}
            />
          </View>
        </View>
      ) : null}

      {children.map((child) => (
        <CommentNode
          key={child.id}
          comment={child}
          children={allComments.filter((c) => c.parent_comment_id === child.id)}
          allComments={allComments}
          currentUserId={currentUserId}
          onReply={onReply}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </View>
  );
}

type CommentThreadProps = {
  comments: Comment[];
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

export function CommentThread({ comments, currentUserId, onReply, onDelete }: CommentThreadProps) {
  const roots = comments.filter((c) => !c.parent_comment_id);

  return (
    <View style={styles.thread}>
      {roots.map((root) => (
        <CommentNode
          key={root.id}
          comment={root}
          children={comments.filter((c) => c.parent_comment_id === root.id)}
          allComments={comments}
          currentUserId={currentUserId}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  thread: { gap: Space.sm },
  node: { gap: 4 },
  bubble: {
    borderRadius: Radii.md,
    padding: Space.sm + 2,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    flexWrap: 'wrap',
  },
  userId: { fontSize: FontSize.xs, fontWeight: '600', flex: 1 },
  time: { fontSize: FontSize.xs },
  content: { fontSize: FontSize.sm, lineHeight: 20 },
  replyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  replyLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  replyBox: { gap: Space.xs, marginTop: 4 },
  replyInput: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Space.sm,
    fontSize: FontSize.sm,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyActions: { flexDirection: 'row', gap: Space.xs, justifyContent: 'flex-end' },
});
