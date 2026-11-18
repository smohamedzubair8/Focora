-- ==============================================================================
-- Focora Supabase Database Schema Migration
-- ==============================================================================

-- 1. Helper Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Table: learning_goals
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_skill_name_not_empty CHECK (length(trim(skill_name)) > 0)
);

-- Indexes for learning_goals
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON public.learning_goals(user_id);

-- Enforce strictly one primary goal per user
CREATE UNIQUE INDEX IF NOT EXISTS learning_goals_one_primary_per_user 
  ON public.learning_goals (user_id) 
  WHERE is_primary = true;

-- Enforce case-insensitive unique skill name per user
CREATE UNIQUE INDEX IF NOT EXISTS learning_goals_unique_skill_per_user 
  ON public.learning_goals (user_id, LOWER(TRIM(skill_name)));

-- Updated_at trigger for learning_goals
CREATE OR REPLACE TRIGGER trg_learning_goals_updated_at
  BEFORE UPDATE ON public.learning_goals
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 3. Table: learning_resources
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  goal_id UUID REFERENCES public.learning_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT chk_url_not_empty CHECK (length(trim(url)) > 0)
);

-- Indexes for learning_resources
CREATE INDEX IF NOT EXISTS idx_learning_resources_user_id ON public.learning_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_goal_id ON public.learning_resources(goal_id);

-- Updated_at trigger for learning_resources
CREATE OR REPLACE TRIGGER trg_learning_resources_updated_at
  BEFORE UPDATE ON public.learning_resources
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 4. Cross-tenant verification: Ensure resource goal_id belongs to the same user
CREATE OR REPLACE FUNCTION verify_resource_goal_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.goal_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.learning_goals
      WHERE id = NEW.goal_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Associated goal % does not belong to user %', NEW.goal_id, NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_verify_resource_goal_ownership
  BEFORE INSERT OR UPDATE OF goal_id, user_id ON public.learning_resources
  FOR EACH ROW
  EXECUTE FUNCTION verify_resource_goal_ownership();

-- 5. Safe Primary Goal Management: Atomic procedure to switch or unset primary goal
CREATE OR REPLACE FUNCTION public.set_primary_goal(p_goal_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Clear any current primary goal for this user
  UPDATE public.learning_goals
  SET is_primary = false, updated_at = NOW()
  WHERE user_id = v_user_id AND is_primary = true;

  -- If a valid goal id is passed, set it as primary
  IF p_goal_id IS NOT NULL THEN
    UPDATE public.learning_goals
    SET is_primary = true, updated_at = NOW()
    WHERE id = p_goal_id AND user_id = v_user_id;
  END IF;
END;
$$;

-- Trigger to clear other primary goals if a goal is inserted or updated with is_primary = true
CREATE OR REPLACE FUNCTION handle_learning_goal_primary_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.learning_goals
    SET is_primary = false, updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND id IS DISTINCT FROM NEW.id 
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_ensure_single_primary_goal
  BEFORE INSERT OR UPDATE OF is_primary ON public.learning_goals
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION handle_learning_goal_primary_conflict();

-- 6. Row Level Security (RLS)
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_goals
CREATE POLICY "Users can view their own learning goals"
  ON public.learning_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning goals"
  ON public.learning_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning goals"
  ON public.learning_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning goals"
  ON public.learning_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for learning_resources
CREATE POLICY "Users can view their own resources"
  ON public.learning_resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resources"
  ON public.learning_resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON public.learning_resources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON public.learning_resources FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Grant Permissions to API Roles (Required for Supabase Data API)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.learning_goals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.learning_resources TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
