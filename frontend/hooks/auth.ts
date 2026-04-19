import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: string;
  display_name: string;
  access_token: string;
  refresh_token: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  display_name?: string;
}

export interface SignupResponse {
  message: string;
  display_name: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${r.status}`);
      }

      const data: LoginResponse = await r.json();
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  return { login, loading, error };
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const signup = useCallback(async (payload: SignupPayload): Promise<SignupResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`${API_URL}/auth/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${r.status}`);
      }

      const data: SignupResponse = await r.json();
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  return { signup, loading, error };
}

export function useLogout(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`${API_URL}/auth/logout`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${r.status}`);
      }

      setLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return false;
    }
  }, [accessToken]);

  return { logout, loading, error };
}

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const googleLogin = useCallback(async (idToken: string): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`${API_URL}/auth/google`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id_token: idToken }),
      });

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${r.status}`);
      }

      const data: LoginResponse = await r.json();
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  return { googleLogin, loading, error };
}

export function useUser(userId: string) {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/auth/user/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: UserProfile) => { setUser(data); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [userId]);

  return { user, loading, error };
}
