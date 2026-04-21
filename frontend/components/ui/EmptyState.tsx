import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: palette.fieldBg }]}>
        <Ionicons name={icon} size={32} color={palette.primary} />
      </View>
      <Text style={[styles.title, { color: palette.text, fontFamily: Fonts.sans }]}>{title}</Text>
      {description ? (
        <Text
          style={[styles.desc, { color: palette.mutedText, fontFamily: Fonts.sans }]}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space.xxl,
    paddingHorizontal: Space.lg,
    gap: Space.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', textAlign: 'center' },
  desc: { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 360 },
  action: { marginTop: Space.md },
});
