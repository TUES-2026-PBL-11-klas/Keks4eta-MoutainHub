import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonSize } from './ui/Button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type GoogleAuthButtonProps = {
  mode?: 'signin' | 'signup';
  size?: ButtonSize;
  fullWidth?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function GoogleAuthButton({
  mode = 'signin',
  size = 'md',
  fullWidth = true,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { handlePress, loading, ready } = useGoogleAuth({
    onSuccess: onSuccess ? () => onSuccess() : undefined,
    onError,
  });

  const label =
    mode === 'signup'
      ? loading
        ? 'Signing up…'
        : 'Sign up with Google'
      : loading
      ? 'Signing in…'
      : 'Continue with Google';

  return (
    <Button
      label={label}
      variant="secondary"
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      disabled={!ready}
      onPress={handlePress}
      leading={<Ionicons name="logo-google" size={18} color={palette.primary} />}
      accessibilityLabel={mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
    />
  );
}
