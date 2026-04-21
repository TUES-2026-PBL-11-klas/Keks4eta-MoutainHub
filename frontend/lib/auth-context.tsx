import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getAvatarUrl,
  getDisplayName,
  getToken,
  getUserId,
  isLoggedIn,
  logout as clearAuth,
  setAvatarUrl as persistAvatar,
  setDisplayName as persistDisplayName,
  setLoggedIn as persistLoggedIn,
  setToken as persistToken,
  setUserId as persistUserId,
} from './auth';

export type AuthUser = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

type AuthState = {
  ready: boolean;
  isAuthed: boolean;
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  signIn: (payload: {
    userId: string;
    displayName: string;
    accessToken: string;
    avatarUrl?: string | null;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  patchUser: (patch: Partial<AuthUser>) => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ready: false,
    isAuthed: false,
    token: null,
    user: null,
  });

  useEffect(() => {
    (async () => {
      const [authed, token, uid, name, avatar] = await Promise.all([
        isLoggedIn(),
        getToken(),
        getUserId(),
        getDisplayName(),
        getAvatarUrl(),
      ]);

      setState({
        ready: true,
        isAuthed: !!authed && !!token && !!uid,
        token,
        user:
          uid && name !== null
            ? { userId: uid, displayName: name ?? '', avatarUrl: avatar }
            : null,
      });
    })();
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(async (p) => {
    await Promise.all([
      persistToken(p.accessToken),
      persistUserId(p.userId),
      persistDisplayName(p.displayName ?? ''),
      persistAvatar(p.avatarUrl ?? null),
      persistLoggedIn(true),
    ]);
    setState({
      ready: true,
      isAuthed: true,
      token: p.accessToken,
      user: {
        userId: p.userId,
        displayName: p.displayName ?? '',
        avatarUrl: p.avatarUrl ?? null,
      },
    });
  }, []);

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    await clearAuth();
    setState({ ready: true, isAuthed: false, token: null, user: null });
  }, []);

  const patchUser = useCallback<AuthContextValue['patchUser']>(async (patch) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const next = { ...prev.user, ...patch };
      if (patch.displayName !== undefined) persistDisplayName(next.displayName);
      if (patch.avatarUrl !== undefined) persistAvatar(next.avatarUrl);
      return { ...prev, user: next };
    });
  }, []);

  return (
    <AuthCtx.Provider value={{ ...state, signIn, signOut, patchUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used within <AuthProvider>');
  return c;
}
