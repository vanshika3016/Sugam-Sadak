-- Fix RLS recursion on public.users table - Complete migration
-- Run this in Supabase SQL Editor

-- Drop problematic policies
DROP POLICY IF EXISTS "Government can view all users" ON public.users;
DROP POLICY IF EXISTS "Government can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create a security definer function to check if current user is government
-- This function runs with elevated privileges and can query public.users safely
CREATE OR REPLACE FUNCTION public.is_government_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'government'
  );
END;
$$;

-- Create policies using the security definer function
-- Citizens can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Citizens can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Government can view all users (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Government can view all users" ON public.users
  FOR SELECT USING (public.is_government_user());

-- Government can manage all users
CREATE POLICY "Government can manage users" ON public.users
  FOR ALL USING (public.is_government_user());

-- Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_government_user() TO authenticated;

-- Verify the fix by checking policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';