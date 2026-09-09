# Database Schema

## users

`users.id` mirrors Supabase Auth `auth.users.id`.

```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);
```

## projects

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  prompt text not null,
  format text not null default 'landscape',
  style text not null default 'minimal-tech',
  scene_graph jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## render_jobs

```sql
create table render_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text not null default 'queued',
  progress int default 0,
  error_message text,
  output_url text,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## asset_packs

```sql
create table asset_packs (
  id text primary key,
  name text not null,
  description text,
  metadata jsonb not null default '{}',
  created_at timestamptz default now()
);
```

## assets

```sql
create table assets (
  id text primary key,
  pack_id text references asset_packs(id),
  type text not null,
  name text not null,
  tags text[] default '{}',
  file_url text not null,
  metadata jsonb not null default '{}'
);
```

## voiceovers

```sql
create table voiceovers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  provider text not null,
  voice_id text,
  script text not null,
  audio_url text,
  timing_json jsonb,
  created_at timestamptz default now()
);
```
