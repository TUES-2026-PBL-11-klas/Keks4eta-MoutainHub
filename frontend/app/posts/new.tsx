import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCreatePost } from '@/hooks/posts';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Colors, Fonts, FontSize, Radii, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export default function NewPostScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { token, isAuthed } = useAuth();
  const toast = useToast();

  const { createPost, loading, error } = useCreatePost(token ?? '');

  const [content, setContent] = useState('');
  const [imageMediaId, setImageMediaId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as any);
      const res = await fetch(`${API_URL}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { id, url } = await res.json();
      setImageMediaId(id);
      setImagePreview(url);
    } catch (e: any) {
      toast.error(e.message ?? 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Post content cannot be empty.'); return; }
    const post = await createPost({
      content: content.trim(),
      image_media_id: imageMediaId ?? undefined,
    });
    if (post) {
      toast.success('Post published!');
      router.replace(`/posts/${post.id}` as any);
    }
  };

  if (!isAuthed) {
    router.replace('/login');
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Button
          label="Back"
          variant="ghost"
          size="sm"
          leading={<Ionicons name="arrow-back" size={16} color={palette.primary} />}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: Space.md }}
        />

        <Text style={[styles.heading, { color: palette.text, fontFamily: Fonts.sans }]}>
          New Post
        </Text>

        {error ? <ErrorBanner message={error} /> : null}

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="What's on your mind?"
          placeholderTextColor={palette.mutedText}
          multiline
          style={[
            styles.textarea,
            {
              color: palette.text,
              borderColor: palette.border,
              backgroundColor: palette.fieldBg,
              fontFamily: Fonts.sans,
            },
          ]}
          autoFocus
        />

        <View style={styles.actions}>
          <Button
            label={uploading ? 'Uploading…' : imageMediaId ? 'Image attached' : 'Attach image'}
            variant={imageMediaId ? 'accent' : 'secondary'}
            size="sm"
            loading={uploading}
            leading={<Ionicons name="image-outline" size={16} color={imageMediaId ? '#07240F' : palette.primary} />}
            onPress={handlePickImage}
          />
          <Button
            label={loading ? 'Posting…' : 'Publish'}
            variant="primary"
            size="md"
            loading={loading}
            disabled={!content.trim()}
            onPress={handleSubmit}
            fullWidth={false}
          />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Space.md },
  textarea: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Space.md,
    minHeight: 160,
    fontSize: FontSize.md,
    textAlignVertical: 'top',
    lineHeight: 24,
    marginBottom: Space.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
});
