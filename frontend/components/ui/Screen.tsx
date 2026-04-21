import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ScreenMaxWidth, Space } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  maxWidth?: number;
  backgroundColor?: string;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  keyboardAvoiding?: boolean;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  maxWidth,
  backgroundColor,
  contentContainerStyle,
  style,
  keyboardAvoiding = true,
}: ScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { pick } = useResponsive();

  const resolvedMaxWidth =
    maxWidth ??
    pick({
      phone: ScreenMaxWidth.phone,
      tablet: ScreenMaxWidth.tablet,
      desktop: ScreenMaxWidth.desktop,
    });

  const horizontalPad = pick({ phone: Space.md, tablet: Space.lg, desktop: Space.xl });

  const container: ViewStyle = {
    width: '100%',
    maxWidth: resolvedMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: padded ? horizontalPad : 0,
    flexGrow: scroll ? 1 : undefined,
  };

  const body = (
    <View style={[container, contentContainerStyle]}>{children}</View>
  );

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={style}
    >
      {body}
    </ScrollView>
  ) : (
    <View style={[styles.flex, style]}>{body}</View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView
      style={[
        styles.flex,
        { backgroundColor: backgroundColor ?? palette.background },
      ]}
    >
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: Space.xxl },
});
