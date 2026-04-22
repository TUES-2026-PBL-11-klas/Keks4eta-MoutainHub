-- Run this in your Supabase SQL editor before starting the posts-service.

create table if not exists posts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null,
  content          text not null,
  image_media_id   uuid references media(id) on delete set null,
  trail_id         uuid references trails(id) on delete set null,
  created_at       timestamptz default now()
);

create table if not exists comments (
  id                 uuid primary key default gen_random_uuid(),
  post_id            uuid not null references posts(id) on delete cascade,
  user_id            uuid not null,
  parent_comment_id  uuid references comments(id) on delete cascade,
  content            text not null,
  created_at         timestamptz default now()
);

create index if not exists comments_post_id_idx       on comments (post_id);
create index if not exists comments_parent_id_idx     on comments (parent_comment_id);
create index if not exists posts_user_id_idx          on posts (user_id);
create index if not exists posts_created_at_idx       on posts (created_at desc);
