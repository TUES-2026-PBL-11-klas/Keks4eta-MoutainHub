import React, { forwardRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, Radii, Space, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
  containerStyle?: ViewStyle;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, hint, containerStyle, leading, trailing, style, ...rest }, ref) => {
    const scheme = useColorScheme() ?? 'light';
    const palette = Colors[scheme];

    const inputWeb =
      Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {};

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Text style={[styles.label, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
            {label}
          </Text>
        ) : null}

        <View
          style={[
            styles.fieldRow,
            {
              backgroundColor: palette.fieldBg,
              borderColor: error ? palette.danger : palette.border,
            },
          ]}
        >
          {leading ? <View style={styles.leading}>{leading}</View> : null}

          <TextInput
            ref={ref}
            placeholderTextColor={palette.mutedText}
            style={[
              styles.input,
              { color: palette.text, fontFamily: Fonts.sans },
              inputWeb as any,
              style,
            ]}
            {...rest}
          />

          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>

        {error ? (
          <Text style={[styles.error, { color: palette.danger, fontFamily: Fonts.sans }]}>
            {error}
          </Text>
        ) : hint ? (
          <Text style={[styles.hint, { color: palette.mutedText, fontFamily: Fonts.sans }]}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);
TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: { width: '100%', gap: Space.xs },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Space.md,
    minHeight: 44,
  },
  leading: { marginRight: Space.sm },
  trailing: { marginLeft: Space.sm },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: Platform.OS === 'web' ? Space.sm + 2 : Space.sm,
  },
  error: { fontSize: FontSize.xs, fontWeight: '500' },
  hint: { fontSize: FontSize.xs },
});
