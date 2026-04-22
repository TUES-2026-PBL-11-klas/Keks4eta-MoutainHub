import { useCallback, useEffect, useState } from "react";
import { notifyUnauthorized } from "@/lib/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_media_id?: string | null;
  trail_id?: string | null;
  created_at: string;
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  content: string;
  created_at: string;
}

export interface CreatePostPayload {
  content: string;
  image_media_id?: string;
  trail_id?: string;
}

export interface CreateCommentPayload {
  content: string;
  parent_comment_id?: string;
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

export function usePostsFeed(opts: { page?: number; size?: number } = {}) {
  const page = opts.page ?? 1;
  const size = opts.size ?? 20;

  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/posts/?page=${page}&size=${size}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Post[]) => { setPosts(data); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [page, size]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { posts, loading, error, refresh: fetch_ };
}

// ---------------------------------------------------------------------------
// Single post
// ---------------------------------------------------------------------------

export function usePost(id: string) {
  const [post, setPost]       = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/posts/${id}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Post) => { setPost(data); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { post, loading, error, refresh: fetch_ };
}

// ---------------------------------------------------------------------------
// User posts (profile page)
// ---------------------------------------------------------------------------

export function useUserPosts(userId: string) {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/posts/user/${userId}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Post[]) => { setPosts(data); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [userId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { posts, loading, error, refresh: fetch_ };
}

// ---------------------------------------------------------------------------
// Create / delete post
// ---------------------------------------------------------------------------

export function useCreatePost(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const createPost = useCallback(async (payload: CreatePostPayload): Promise<Post | null> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/posts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      if (r.status === 401) { notifyUnauthorized(); setLoading(false); return null; }
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.message ?? `HTTP ${r.status}`); }
      const data: Post = await r.json();
      setLoading(false);
      return data;
    } catch (e: any) { setError(e.message); setLoading(false); return null; }
  }, [accessToken]);

  return { createPost, loading, error };
}

export function useDeletePost(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (r.status === 401) { notifyUnauthorized(); setLoading(false); return false; }
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.message ?? `HTTP ${r.status}`); }
      setLoading(false);
      return true;
    } catch (e: any) { setError(e.message); setLoading(false); return false; }
  }, [accessToken]);

  return { deletePost, loading, error };
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/posts/${postId}/comments`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Comment[]) => { setComments(data); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [postId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { comments, loading, error, refresh: fetch_ };
}

export function useCreateComment(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const createComment = useCallback(async (postId: string, payload: CreateCommentPayload): Promise<Comment | null> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      if (r.status === 401) { notifyUnauthorized(); setLoading(false); return null; }
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.message ?? `HTTP ${r.status}`); }
      const data: Comment = await r.json();
      setLoading(false);
      return data;
    } catch (e: any) { setError(e.message); setLoading(false); return null; }
  }, [accessToken]);

  return { createComment, loading, error };
}

export function useDeleteComment(accessToken: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/posts/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (r.status === 401) { notifyUnauthorized(); setLoading(false); return false; }
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.message ?? `HTTP ${r.status}`); }
      setLoading(false);
      return true;
    } catch (e: any) { setError(e.message); setLoading(false); return false; }
  }, [accessToken]);

  return { deleteComment, loading, error };
}
