-- Add referral_code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create index for faster referral code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Update existing users to have referral codes based on username
UPDATE public.profiles 
SET referral_code = LOWER(REPLACE(username, ' ', ''))
WHERE referral_code IS NULL;

-- Create referrals table to track who referred whom
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  UNIQUE(referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON public.referrals FOR UPDATE
  USING (true);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  referral_threshold INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, referral_threshold) VALUES
  ('Recruiter', 'Recruited your first friend', '🎖️', 1),
  ('Ambassador', 'Recruited 3 friends', '👑', 3),
  ('Legend', 'Recruited 5 friends', '⭐', 5),
  ('Influencer', 'Recruited 10 friends', '💎', 10)
ON CONFLICT DO NOTHING;

-- Enable RLS on badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- RLS policy for badges (public read)
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges
CREATE POLICY "Users can view all badges"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert user badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- Function to get referral stats for a user
CREATE OR REPLACE FUNCTION public.get_referral_stats(user_uuid UUID)
RETURNS TABLE(
  total_referrals BIGINT,
  completed_referrals BIGINT,
  next_badge_name TEXT,
  next_badge_icon TEXT,
  next_badge_threshold INTEGER,
  progress_to_next INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_refs BIGINT;
  completed_refs BIGINT;
  next_badge RECORD;
BEGIN
  -- Get total and completed referrals
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true)
  INTO total_refs, completed_refs
  FROM referrals
  WHERE referrer_id = user_uuid;
  
  -- Get next badge to earn
  SELECT b.name, b.icon, b.referral_threshold
  INTO next_badge
  FROM badges b
  WHERE b.referral_threshold > completed_refs
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = user_uuid AND ub.badge_id = b.id
  )
  ORDER BY b.referral_threshold ASC
  LIMIT 1;
  
  RETURN QUERY SELECT 
    total_refs,
    completed_refs,
    next_badge.name,
    next_badge.icon,
    next_badge.referral_threshold,
    completed_refs::INTEGER;
END;
$$;

-- Function to mark referral as completed and award badges
CREATE OR REPLACE FUNCTION public.complete_referral(referred_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
  completed_count INTEGER;
  badge_record RECORD;
BEGIN
  -- Update referral to completed
  UPDATE referrals 
  SET completed = true 
  WHERE referred_id = referred_user_id
  RETURNING referrer_id INTO referrer_user_id;
  
  IF referrer_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get completed referral count
  SELECT COUNT(*) INTO completed_count
  FROM referrals
  WHERE referrer_id = referrer_user_id AND completed = true;
  
  -- Award badges based on threshold
  FOR badge_record IN 
    SELECT id FROM badges 
    WHERE referral_threshold <= completed_count
  LOOP
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (referrer_user_id, badge_record.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Add referred_by column to profiles to track who referred them
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referred_by TEXT;