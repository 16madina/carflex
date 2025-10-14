-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "User roles viewable by owner or admin" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own user role on signup" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;

-- RLS policies for user_roles
CREATE POLICY "User roles viewable by owner or admin"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own user role on signup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'user');

CREATE POLICY "Only admins can update user roles"
  ON public.user_roles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete user roles"
  ON public.user_roles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create premium_packages table
CREATE TABLE IF NOT EXISTS public.premium_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on premium_packages
ALTER TABLE public.premium_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Premium packages viewable by everyone" ON public.premium_packages;
DROP POLICY IF EXISTS "Only admins can insert premium packages" ON public.premium_packages;
DROP POLICY IF EXISTS "Only admins can update premium packages" ON public.premium_packages;
DROP POLICY IF EXISTS "Only admins can delete premium packages" ON public.premium_packages;

-- RLS policies for premium_packages
CREATE POLICY "Premium packages viewable by everyone"
  ON public.premium_packages
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert premium packages"
  ON public.premium_packages
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update premium packages"
  ON public.premium_packages
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete premium packages"
  ON public.premium_packages
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create premium_listings table
CREATE TABLE IF NOT EXISTS public.premium_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rental')),
  package_id UUID NOT NULL REFERENCES public.premium_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on premium_listings
ALTER TABLE public.premium_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Premium listings viewable by everyone" ON public.premium_listings;
DROP POLICY IF EXISTS "Users can create their own premium listings" ON public.premium_listings;
DROP POLICY IF EXISTS "Users can update their own premium listings" ON public.premium_listings;
DROP POLICY IF EXISTS "Users can delete their own premium listings" ON public.premium_listings;

-- RLS policies for premium_listings
CREATE POLICY "Premium listings viewable by everyone"
  ON public.premium_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own premium listings"
  ON public.premium_listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own premium listings"
  ON public.premium_listings
  FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own premium listings"
  ON public.premium_listings
  FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Create trigger for premium_packages updated_at
DROP TRIGGER IF EXISTS update_premium_packages_updated_at ON public.premium_packages;
CREATE TRIGGER update_premium_packages_updated_at
  BEFORE UPDATE ON public.premium_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();