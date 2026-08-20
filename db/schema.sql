-- ============================================================
-- ÉLANÉ — Ghanaian fragrance e-commerce
-- Supabase schema + RLS
-- Run this in the Supabase SQL editor (or via psql) on a NEW project.
-- The app works in "demo mode" until NEXT_PUBLIC_SUPABASE_URL,
-- NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are set.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Profiles (one row per auth user, created by trigger)
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Product categories
-- ------------------------------------------------------------
create table if not exists product_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  sort_order integer not null default 0
);

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand text not null,
  description text not null default '',
  category_id text not null references product_categories(id),
  category_slug text,
  category_name text,
  gender text not null default 'unisex' check (gender in ('women', 'men', 'unisex')),
  fragrance_family text not null default 'Fresh',
  top_notes jsonb not null default '[]',
  heart_notes jsonb not null default '[]',
  base_notes jsonb not null default '[]',
  longevity text,
  sillage text,
  occasion text,
  featured boolean not null default false,
  bestseller boolean not null default false,
  new_arrival boolean not null default false,
  rating numeric(3,1) not null default 0,
  review_count integer not null default 0,
  min_price numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_slug_idx on products(category_slug);
create index if not exists products_family_idx on products(fragrance_family);
create index if not exists products_brand_idx on products(brand);

-- ------------------------------------------------------------
-- Product variants (sizes/prices/stock)
-- ------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  stock integer not null default 0,
  sku text,
  unique (product_id, size)
);

create index if not exists variants_product_idx on product_variants(product_id);

-- Decrement a variant's stock, failing if insufficient
create or replace function decrement_variant_stock(p_variant_id uuid, p_quantity integer)
returns void
language plpgsql
security invoker
as $$
begin
  update product_variants
     set stock = stock - p_quantity
   where id = p_variant_id
     and stock >= p_quantity;
  if not found then
    raise exception 'Insufficient stock for variant %', p_variant_id;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- Product images
-- ------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0
);

create index if not exists images_product_idx on product_images(product_id);

-- ------------------------------------------------------------
-- Delivery zones (admin-configured fees — never hardcoded)
-- ------------------------------------------------------------
create table if not exists delivery_zones (
  id text primary key,
  name text not null,
  cities jsonb not null default '[]',
  fee numeric(10,2) not null default 0,
  estimated_days text not null default '1–3 working days',
  sort_order integer not null default 0,
  active boolean not null default true
);

-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------
create table if not exists orders (
  id uuid primary key,
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  region text not null,
  city text not null,
  address text not null,
  delivery_note text,
  delivery_zone_id text references delivery_zones(id),
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  coupon_type text,
  coupon_value numeric(10,2),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'cancelled')),
  order_status text not null default 'pending'
    check (order_status in (
      'pending', 'payment_confirmed', 'processing', 'ready_for_delivery',
      'out_for_delivery', 'delivered', 'cancelled'
    )),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_reference_idx on orders(payment_reference);
create index if not exists orders_created_idx on orders(created_at desc);

-- ------------------------------------------------------------
-- Order items
-- ------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid,
  variant_id uuid,
  product_name text not null,
  product_slug text not null default '',
  brand text not null default '',
  size text not null default '',
  image text,
  unit_price numeric(10,2) not null,
  quantity integer not null default 1
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ------------------------------------------------------------
-- Payments ledger
-- ------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  reference text not null unique,
  provider text not null default 'paystack',
  status text not null default 'pending',
  amount numeric(10,2),
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Coupons
-- ------------------------------------------------------------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10,2) not null,
  min_order numeric(10,2),
  max_uses integer,
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Reviews
-- ------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text not null,
  verified boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on reviews(product_id);
create index if not exists reviews_approved_idx on reviews(approved);

-- ------------------------------------------------------------
-- Storage bucket for product images (public read, admin upload via service role)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- ------------------------------------------------------------
-- Profile auto-create trigger
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- Catalog tables: public read, admin write
-- Orders: owner read / admin all; write by service role only
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table product_categories enable row level security;
alter table delivery_zones enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;

drop policy if exists "profiles read own" on profiles;
create policy "profiles read own"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles update own" on profiles;
create policy "profiles update own"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "products public read" on products;
create policy "products public read"
  on products for select
  to anon, authenticated
  using (true);

drop policy if exists "variants public read" on product_variants;
create policy "variants public read"
  on product_variants for select
  to anon, authenticated
  using (true);

drop policy if exists "images public read" on product_images;
create policy "images public read"
  on product_images for select
  to anon, authenticated
  using (true);

drop policy if exists "categories public read" on product_categories;
create policy "categories public read"
  on product_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "zones public read" on delivery_zones;
create policy "zones public read"
  on delivery_zones for select
  to anon, authenticated
  using (true);

drop policy if exists "orders owner read" on orders;
create policy "orders owner read"
  on orders for select
  using (auth.uid() = user_id);

drop policy if exists "order_items owner read" on order_items;
create policy "order_items owner read"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "reviews public read" on reviews;
create policy "reviews public read"
  on reviews for select
  to anon, authenticated
  using (approved = true);

drop policy if exists "reviews own insert" on reviews;
create policy "reviews own insert"
  on reviews for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    -- and orders allow: purchased.product owned by this user (checked in app too)
  );