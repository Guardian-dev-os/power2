ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE public.study_notes
  ADD COLUMN IF NOT EXISTS topic VARCHAR(100),
  ADD COLUMN IF NOT EXISTS subtopic VARCHAR(150),
  ADD COLUMN IF NOT EXISTS section_number INT,
  ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Make category column nullable since some seed data may not specify it (we'll backfill from topic)
ALTER TABLE public.study_notes ALTER COLUMN category DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_study_notes_topic ON public.study_notes(topic);
CREATE INDEX IF NOT EXISTS idx_study_notes_category ON public.study_notes(category);

-- Exam Mode topic_set
INSERT INTO public.topic_sets (id, title, description, order_index, free_card_limit) VALUES
('f0000010-0000-0000-0000-000000000000', 'Exam Mode', 'Combined past-exam style questions across all topics.', 99, 99999)
ON CONFLICT (id) DO NOTHING;

-- All sets fully unlocked by default
UPDATE public.topic_sets SET free_card_limit = 99999;
