-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ROLES TABLE
create table roles (
    id serial primary key,
    role_name text not null unique
);

insert into roles (role_name) values ('admin'), ('public_user');

-- 2. USER_ROLES TABLE
create table user_roles (
    user_id uuid references auth.users(id) on delete cascade primary key,
    role_id int references roles(id) on delete cascade not null,
    constraint unique_user_role unique (user_id) -- One role per user for simplicity
);

-- 3. PUBLIC_USERS TABLE (Patients)
create table public_users (
    id uuid references auth.users(id) on delete cascade primary key,
    name text not null,
    email text not null,
    phone text,
    created_at timestamptz default now()
);

-- 4. ADMINS TABLE
create table admins (
    id uuid references auth.users(id) on delete cascade primary key,
    name text not null,
    email text not null,
    created_at timestamptz default now()
);

-- 5. DOCTORS TABLE
create table doctors (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    specialization text not null,
    start_time time not null,
    end_time time not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- 6. APPOINTMENTS TABLE
create type appointment_status as enum ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

create table appointments (
    id uuid default uuid_generate_v4() primary key,
    doctor_id uuid references doctors(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null, -- generic link to auth.users, conceptually public_users
    token_number int not null,
    status appointment_status default 'WAITING',
    appointment_date date default current_date not null,
    created_at timestamptz default now()
);

-- RLS POLICIES
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table public_users enable row level security;
alter table admins enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;

-- HELPER FUNCTIONS
-- Check if requesting user is admin
create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1
    from user_roles ur
    join roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.role_name = 'admin'
  ) into is_admin;
  return is_admin;
end;
$$ language plpgsql security definer;

-- POLICIES

-- roles: public read-only
create policy "Roles are viewable by everyone" on roles for select using (true);

-- user_roles: users view their own, admins view all
create policy "Users can view own role" on user_roles for select using (auth.uid() = user_id);
create policy "Admins can view all roles" on user_roles for select using (public.is_admin());

-- public_users: view own, admins view all
create policy "Users can view own profile" on public_users for select using (auth.uid() = id);
create policy "Users can update own profile" on public_users for update using (auth.uid() = id);
create policy "Admins can view all public profiles" on public_users for select using (public.is_admin());

-- admins: view own, other admins view all (simplified)
create policy "Admins can view all admin profiles" on admins for select using (public.is_admin());

-- doctors: public read active, admins read/write all
create policy "Public can view active doctors" on doctors for select using (is_active = true);
create policy "Admins can view all doctors" on doctors for select using (public.is_admin());
create policy "Admins can insert doctors" on doctors for insert with check (public.is_admin());
create policy "Admins can update doctors" on doctors for update using (public.is_admin());
create policy "Admins can delete doctors" on doctors for delete using (public.is_admin());

-- appointments: 
-- Public: create own, read own
-- Admin: read all, update status

create policy "Users can view own appointments" on appointments for select using (auth.uid() = user_id);
create policy "Users can create appointments" on appointments for insert with check (auth.uid() = user_id);

create policy "Admins can view all appointments" on appointments for select using (public.is_admin());
create policy "Admins can update appointments" on appointments for update using (public.is_admin());

-- TRIGGER FOR NEW USER REGISTRATION (PUBLIC)
-- Default to public_user role
create or replace function public.handle_new_user()
returns trigger as $$
declare
  public_role_id int;
begin
  select id into public_role_id from roles where role_name = 'public_user';

  -- Add to user_roles
  insert into user_roles (user_id, role_id)
  values (new.id, public_role_id);

  -- Add to public_users
  insert into public_users (id, name, email, phone)
  values (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'phone');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger only applies if it's a patient registration? 
-- Simplification: All signups via UI are public users. Admins are created via SQL manually (which won't trigger this auth hook if creating directly in auth.users? No, auth.users insert triggers this).
-- Problem: If we manually insert admin, we don't want this trigger to make them public_user.
-- Solution: Check metadata or just let the manual process overwrite/ignore.
-- Better: The trigger always runs on auth.users insert.
-- Fix: We can assume manual Admin creation will happen, and we can just delete the user_role entry and replace it, or update it.
-- OR: Check for a flag in raw_user_meta_data 'is_admin_manual' (risky).
-- SAFEST: Just let it create as public_user. Super admin manually changes role in `user_roles` and moves entry from `public_users` to `admins`. 
-- OR: For now, just implement the trigger for public support. Manual admin creation will involve SQL scripts anyway, which can handle cleanup.

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
