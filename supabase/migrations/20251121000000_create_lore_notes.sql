-- Update lore_notes table (table already exists from 20251104000000_add_plot_modules.sql)
-- Add user_id column and update constraints

-- Add user_id column
ALTER TABLE public.lore_notes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update user_id for existing records (set to campaign owner)
UPDATE public.lore_notes
SET user_id = (
  SELECT user_id FROM public.campaigns
  WHERE campaigns.id = lore_notes.campaign_id
)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting values
ALTER TABLE public.lore_notes
  ALTER COLUMN user_id SET NOT NULL;

-- Update content_json column to NOT NULL with default
ALTER TABLE public.lore_notes
  ALTER COLUMN content_json SET NOT NULL,
  ALTER COLUMN content_json SET DEFAULT '{}'::jsonb;

-- Update tags column to NOT NULL with default
ALTER TABLE public.lore_notes
  ALTER COLUMN tags SET NOT NULL,
  ALTER COLUMN tags SET DEFAULT '{}';

-- Drop old category constraint if exists and add new one with all categories
DO $$
BEGIN
  ALTER TABLE public.lore_notes DROP CONSTRAINT IF EXISTS lore_notes_category_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.lore_notes
  ADD CONSTRAINT lore_notes_category_check
  CHECK (category IN ('History', 'Geography', 'Religion', 'Culture', 'Magic', 'Legends', 'Other'));

-- Create missing indexes (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_lore_notes_user_id ON public.lore_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lore_notes_created_at ON public.lore_notes(created_at DESC);

-- Drop old RLS policies if they exist
DROP POLICY IF EXISTS "users can view lore notes from own campaigns - anon" ON public.lore_notes;
DROP POLICY IF EXISTS "users can view lore notes from own campaigns - authenticated" ON public.lore_notes;
DROP POLICY IF EXISTS "users can create lore notes in own campaigns - anon" ON public.lore_notes;
DROP POLICY IF EXISTS "users can create lore notes in own campaigns - authenticated" ON public.lore_notes;
DROP POLICY IF EXISTS "users can update lore notes from own campaigns - anon" ON public.lore_notes;
DROP POLICY IF EXISTS "users can update lore notes from own campaigns - authenticated" ON public.lore_notes;
DROP POLICY IF EXISTS "users can delete lore notes from own campaigns - anon" ON public.lore_notes;
DROP POLICY IF EXISTS "users can delete lore notes from own campaigns - authenticated" ON public.lore_notes;

-- Create new RLS policies with user_id checks
CREATE POLICY "Users can view lore notes from their campaigns"
  ON public.lore_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = lore_notes.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lore notes in their campaigns"
  ON public.lore_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = lore_notes.campaign_id
      AND campaigns.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own lore notes"
  ON public.lore_notes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own lore notes"
  ON public.lore_notes
  FOR DELETE
  USING (user_id = auth.uid());
