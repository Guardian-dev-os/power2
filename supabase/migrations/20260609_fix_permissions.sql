-- Fix: Grant proper permissions to has_role function and fix RLS policies
-- This resolves: "permission denied for function has_role" errors

-- 1. Grant execute permission on has_role to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- 2. Add missing bound_user_id column to access_codes
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS bound_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Ensure service_role can bypass RLS for admin operations
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.agents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests FORCE ROW LEVEL SECURITY;

-- 4. Add missing RLS policy for agents SELECT (allow authenticated to read)
DROP POLICY IF EXISTS "Public read agents" ON public.agents;
CREATE POLICY "Public read agents" ON public.agents FOR SELECT USING (true);

-- 5. Ensure service_role can perform all operations
ALTER TABLE public.agents OWNER TO postgres;
ALTER TABLE public.user_roles OWNER TO postgres;
ALTER TABLE public.profiles OWNER TO postgres;
ALTER TABLE public.access_requests OWNER TO postgres;
ALTER TABLE public.access_codes OWNER TO postgres;

-- 6. Verify app_settings has proper grants
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
