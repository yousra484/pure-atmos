-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'client';
    END IF;
END $$;

-- Create enum type for roles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'intervenant', 'admin');
    END IF;
END $$;

-- Update the role column to use the enum type
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Add constraint to ensure role is valid
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'client'::user_role;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- Add missing columns to profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'nom') THEN
        ALTER TABLE public.profiles ADD COLUMN nom TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'prenom') THEN
        ALTER TABLE public.profiles ADD COLUMN prenom TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'telephone') THEN
        ALTER TABLE public.profiles ADD COLUMN telephone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'adresse') THEN
        ALTER TABLE public.profiles ADD COLUMN adresse TEXT;
    END IF;
END $$;

-- Create index on role for better performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Update RLS policies to include role-based access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Policy: Intervenants can read other profiles for messaging
CREATE POLICY "Intervenants can read profiles for messaging" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() AND p.role = 'intervenant'
        )
    );
