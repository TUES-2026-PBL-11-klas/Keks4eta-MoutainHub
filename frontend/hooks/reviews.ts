import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  created_at?: string;
  user_id?: string;
  trail_id: string;
  name: string;
  rating: number;
  description?: string;
}

export interface ReviewFilters {
  since?: string;
  size?: number;
  page?: number;
}

export interface CreateReviewPayload {
  trail_id: string;
  name: string;
  rating: number;
  description?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildParams(filters: ReviewFilters): string {
  const params = new URLSearchParams();
  if (filters.since)            params.set("since", filters.since);
  if (filters.size !== undefined) params.set("size", String(filters.size));
  if (filters.page !== undefined) params.set("page", String(filters.page));
  return params.toString();
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useReviews(filters: ReviewFilters = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    setError(null);

    const qs  = buildParams(filters);
    const url = qs ? `${API_URL}/reviews?${qs}` : `${API_URL}/reviews`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { reviews: Review[] }) => { setReviews(data.reviews); setLoading(false); })
      .catch((e: Error)                   => { setError(e.message); setLoading(false); });
  }, [filters.since, filters.size, filters.page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { reviews, loading, error, refresh: fetch_ };
}

export function useTrailReviews(trailId: string, filters: ReviewFilters = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!trailId) return;
    setLoading(true);
    setError(null);

    const qs  = buildParams(filters);
    const url = qs
      ? `${API_URL}/reviews/trail/${trailId}?${qs}`
      : `${API_URL}/reviews/trail/${trailId}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { reviews: Review[] }) => { setReviews(data.reviews); setLoading(false); })
      .catch((e: Error)                   => { setError(e.message); setLoading(false); });
  }, [trailId, filters.since, filters.size, filters.page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { reviews, loading, error, refresh: fetch_ };
}

export function useUserReviews(userId: string, filters: ReviewFilters = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const qs  = buildParams(filters);
    const url = qs
      ? `${API_URL}/reviews/user/${userId}?${qs}`
      : `${API_URL}/reviews/user/${userId}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { reviews: Review[] }) => { setReviews(data.reviews); setLoading(false); })
      .catch((e: Error)                   => { setError(e.message); setLoading(false); });
  }, [userId, filters.since, filters.size, filters.page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { reviews, loading, error, refresh: fetch_ };
}

export function useCategoryReviews(category: string, filters: ReviewFilters = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!category) return;
    setLoading(true);
    setError(null);

    const qs  = buildParams(filters);
    const url = qs
      ? `${API_URL}/reviews/category/${category}?${qs}`
      : `${API_URL}/reviews/category/${category}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { reviews: Review[] }) => { setReviews(data.reviews); setLoading(false); })
      .catch((e: Error)                   => { setError(e.message); setLoading(false); });
  }, [category, filters.since, filters.size, filters.page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { reviews, loading, error, refresh: fetch_ };
}

export function useCreateReview(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const createReview = useCallback(
    async (payload: CreateReviewPayload): Promise<Review | null> => {
      setLoading(true);
      setError(null);

      try {
        const r = await fetch(`${API_URL}/reviews`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? body.message ?? `HTTP ${r.status}`);
        }

        const data: { message: string; review: Review } = await r.json();
        setLoading(false);
        return data.review;
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        return null;
      }
    },
    [accessToken]
  );

  return { createReview, loading, error };
}
