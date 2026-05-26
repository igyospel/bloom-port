-- -------------------------------------------------------------
-- BLOOMPORT SUPABASE DATABASE SETUP
-- Paste this script into the Supabase SQL Editor and run it.
-- -------------------------------------------------------------

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  credits integer default 10000 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- ==========================================
-- 2. HABITS TABLE
-- ==========================================
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date_str date not null,
  completed_habits boolean[] not null, -- Array of 6 booleans
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_date unique (user_id, date_str)
);

-- Enable RLS for habits
alter table public.habits enable row level security;

-- Create policies for habits
create policy "Users can view their own habits" 
  on public.habits for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own habits" 
  on public.habits for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own habits" 
  on public.habits for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own habits" 
  on public.habits for delete 
  using (auth.uid() = user_id);

-- ==========================================
-- 3. AUTH TRIGGER FOR NEW SIGNUPS
-- ==========================================
-- This function runs automatically whenever a new user signs up in auth.users.
-- It inserts a corresponding record in public.profiles.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, credits)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url', 
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80'
    ),
    10000
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users table
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
