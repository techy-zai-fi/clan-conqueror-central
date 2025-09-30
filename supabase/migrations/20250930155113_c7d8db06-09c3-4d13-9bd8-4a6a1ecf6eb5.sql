-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'clan_leader', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create clans table
CREATE TABLE public.clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  color TEXT NOT NULL,
  logo TEXT NOT NULL,
  mascot TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sports table
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  sport_name TEXT NOT NULL,
  clan1 TEXT NOT NULL,
  clan2 TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'completed')),
  score1 INTEGER,
  score2 INTEGER,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create highlights table
CREATE TABLE public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clans (public read, admin write)
CREATE POLICY "Anyone can view clans"
  ON public.clans FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage clans"
  ON public.clans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sports (public read, admin write)
CREATE POLICY "Anyone can view sports"
  ON public.sports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sports"
  ON public.sports FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for matches (public read, admin write)
CREATE POLICY "Anyone can view matches"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage matches"
  ON public.matches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for announcements (public read, admin write)
CREATE POLICY "Anyone can view announcements"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for highlights (public read, admin write)
CREATE POLICY "Anyone can view highlights"
  ON public.highlights FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage highlights"
  ON public.highlights FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clans_updated_at
  BEFORE UPDATE ON public.clans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();