
-- Lock down publicly readable sensitive tables: require authentication.

-- cards
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON public.cards;
DROP POLICY IF EXISTS "Public can view cards" ON public.cards;
DROP POLICY IF EXISTS "Anyone can view cards" ON public.cards;
CREATE POLICY "Authenticated users can view cards"
  ON public.cards FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.cards FROM anon;

-- exam_questions
DROP POLICY IF EXISTS "Exam questions are viewable by everyone" ON public.exam_questions;
DROP POLICY IF EXISTS "Public can view exam questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Anyone can view exam questions" ON public.exam_questions;
CREATE POLICY "Authenticated users can view exam questions"
  ON public.exam_questions FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.exam_questions FROM anon;

-- app_settings (contains agent phone)
DROP POLICY IF EXISTS "App settings are viewable by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "Public can view app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
CREATE POLICY "Authenticated users can view app settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.app_settings FROM anon;
