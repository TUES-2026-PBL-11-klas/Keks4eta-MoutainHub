import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Trail {
  id: string;
  created_at?: string;
  user_id?: string;
  name: string;
  category: string;
  difficulty: number;
  status: string;
  distance_km: number;
  elevation_gain_m: number;
  description: string;
  route: {
    type: string;
    coordinates: [number, number, number?][];
  };
}

export interface TrailFilters {
  category?: string;
  status?: string;
}

export interface CreateTrailPayload {
  category: string;
  name: string;
  difficulty?: number;
  description?: string;
  distance_km?: number;
  elevation_gain_m?: number;
  status?: string;
  route: {
    type: "LineString";
    coordinates: [number, number, number?][];
  };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useTrails(filters: TrailFilters = {}) {
  const [trails, setTrails]   = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.status)   params.set("status",   filters.status);

    const qs  = params.toString();
    const url = qs ? `${API_URL}/trails?${qs}` : `${API_URL}/trails`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Trail[]) => { setTrails(data); setLoading(false); })
      .catch((e: Error)     => { setError(e.message); setLoading(false); });
  }, [filters.category, filters.status]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { trails, loading, error, refresh: fetch_ };
}

export function useTrail(id: string) {
  const [trail, setTrail]     = useState<Trail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/trails/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Trail) => { setTrail(data); setLoading(false); })
      .catch((e: Error)   => { setError(e.message); setLoading(false); });
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { trail, loading, error, refresh: fetch_ };
}

export function useUserTrails(userId: string, filters: TrailFilters = {}) {
  const [trails, setTrails]   = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.status)   params.set("status",   filters.status);

    const qs  = params.toString();
    const url = qs
      ? `${API_URL}/trails/user/${userId}?${qs}`
      : `${API_URL}/trails/user/${userId}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Trail[]) => { setTrails(data); setLoading(false); })
      .catch((e: Error)     => { setError(e.message); setLoading(false); });
  }, [userId, filters.category, filters.status]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { trails, loading, error, refresh: fetch_ };
}

export function useCreateTrail(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const createTrail = useCallback(
    async (payload: CreateTrailPayload): Promise<Trail | null> => {
      setLoading(true);
      setError(null);

      try {
        const r = await fetch(`${API_URL}/trails`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${r.status}`);
        }

        const data: Trail = await r.json();
        setLoading(false);
        return data;
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        return null;
      }
    },
    [accessToken]
  );

  return { createTrail, loading, error };
}
