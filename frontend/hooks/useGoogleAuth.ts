import { useCallback, useEffect, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useGoogleLogin, LoginResponse } from './auth';
import { useAuth } from '@/lib/auth-context';

WebBrowser.maybeCompleteAuthSession();

export type UseGoogleAuthOptions = {
  onSuccess?: (result: LoginResponse) => void;
  onError?: (message: string) => void;
};

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const router = useRouter();
  const { signIn } = useAuth();
  const { googleLogin, loading: exchanging, error } = useGoogleLogin();

  const rawNonceRef = useRef('');
  const [hashedNonce, setHashedNonce] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const raw = Crypto.randomUUID();
    rawNonceRef.current = raw;
    Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw).then(setHashedNonce);
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
    extraParams: hashedNonce ? { nonce: hashedNonce } : {},
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error' || response?.type === 'dismiss') {
        setPending(false);
      }
      return;
    }
    const idToken = response.params?.id_token;
    if (!idToken) {
      setPending(false);
      return;
    }
    (async () => {
      const result = await googleLogin(idToken, rawNonceRef.current);
      setPending(false);
      if (!result) {
        options.onError?.(error ?? 'Google sign-in failed');
        return;
      }
      await signIn({
        userId: result.user_id,
        displayName: result.display_name,
        accessToken: result.access_token,
      });
      if (options.onSuccess) options.onSuccess(result);
      else router.replace('/(tabs)');
    })();
  }, [response]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = useCallback(async () => {
    if (!request) return;
    setPending(true);
    try {
      await promptAsync();
    } catch {
      setPending(false);
    }
  }, [request, promptAsync]);

  return {
    request,
    loading: pending || exchanging,
    error,
    handlePress,
    ready: !!request && !!hashedNonce,
  };
}
