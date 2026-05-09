-- ============================================================
-- DRUK STAY — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text not null check (role in ('customer', 'business')),
  business_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- LISTINGS TABLE
-- ============================================================
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  dzongkhag text not null check (dzongkhag in (
    'Bumthang', 'Chukha', 'Dagana', 'Gasa', 'Haa',
    'Lhuentse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha',
    'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu',
    'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang',
    'Wangdue Phodrang', 'Zhemgang'
  )),
  address text not null,
  bhk integer not null check (bhk in (1, 2, 3, 4)),
  price_per_night numeric(10, 2) not null check (price_per_night > 0),
  max_guests integer not null default 2 check (max_guests > 0),
  rules text,
  amenities text[] default '{}',
  images text[] default '{}',
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.listings enable row level security;

-- Anyone can view active listings
create policy "Anyone can view active listings"
  on public.listings for select
  using (is_active = true);

-- Business owners can view all their own listings (including inactive)
create policy "Business can view own listings"
  on public.listings for select
  using (auth.uid() = business_id);

-- Business can insert their own listings
create policy "Business can insert listings"
  on public.listings for insert
  with check (auth.uid() = business_id);

-- Business can update their own listings
create policy "Business can update own listings"
  on public.listings for update
  using (auth.uid() = business_id);

-- Business can delete their own listings
create policy "Business can delete own listings"
  on public.listings for delete
  using (auth.uid() = business_id);

-- ============================================================
-- AVAILABILITY TABLE
-- Dates when the listing IS available
-- ============================================================
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  available_date date not null,
  created_at timestamptz default now() not null,
  unique(listing_id, available_date)
);

-- RLS
alter table public.availability enable row level security;

create policy "Anyone can view availability"
  on public.availability for select
  using (true);

create policy "Business can manage availability"
  on public.availability for all
  using (
    auth.uid() = (
      select business_id from public.listings where id = listing_id
    )
  );

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  check_in date not null,
  check_out date not null,
  total_nights integer not null check (total_nights > 0),
  total_price numeric(10, 2) not null check (total_price > 0),
  guest_count integer not null default 1 check (guest_count > 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  special_requests text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint check_out_after_check_in check (check_out > check_in)
);

-- RLS
alter table public.bookings enable row level security;

-- Customers can see their own bookings
create policy "Customers can view own bookings"
  on public.bookings for select
  using (auth.uid() = customer_id);

-- Business can see bookings for their listings
create policy "Business can view bookings for their listings"
  on public.bookings for select
  using (
    auth.uid() = (
      select business_id from public.listings where id = listing_id
    )
  );

-- Customers can create bookings
create policy "Customers can create bookings"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

-- Customers can cancel their own bookings
create policy "Customers can cancel own bookings"
  on public.bookings for update
  using (auth.uid() = customer_id);

-- Business can cancel bookings for their listings
create policy "Business can cancel bookings"
  on public.bookings for update
  using (
    auth.uid() = (
      select business_id from public.listings where id = listing_id
    )
  );

-- Business can delete bookings for their listings
create policy "Business can delete bookings"
  on public.bookings for delete
  using (
    auth.uid() = (
      select business_id from public.listings where id = listing_id
    )
  );

-- ============================================================
-- STORAGE BUCKET for listing images
-- Run this separately in Supabase dashboard or here
-- ============================================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Users can delete own images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- FUNCTION: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_updated_at
  before update on public.listings
  for each row execute procedure public.handle_updated_at();

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
