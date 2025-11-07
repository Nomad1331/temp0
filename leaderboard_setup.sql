-- Run this SQL in Cloud → Database → SQL Editor to set up the leaderboard system

-- Create leaderboard entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  is_verified boolean default false,
  total_logs integer default 0,
  week_logs integer default 0,
  last_week_reset timestamp with time zone default now(),
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries FOR SELECT TO public USING (true);

-- Verified users can update own entry
CREATE POLICY "Verified users can update own entry" ON public.leaderboard_entries FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Helper functions
CREATE OR REPLACE FUNCTION public.check_username_available(desired_username text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.leaderboard_entries WHERE lower(username) = lower(desired_username));
$$;

CREATE OR REPLACE FUNCTION public.suggest_usernames(base_username text)
RETURNS text[] LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN ARRAY[base_username || '123', base_username || '_king', base_username || '2024'];
END;
$$;

CREATE OR REPLACE FUNCTION public.create_leaderboard_entry(entry_username text, entry_user_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_entry_id uuid;
BEGIN
  INSERT INTO public.leaderboard_entries (username, user_id, is_verified)
  VALUES (entry_username, entry_user_id, entry_user_id IS NOT NULL)
  RETURNING id INTO new_entry_id;
  RETURN new_entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_leaderboard_stats(entry_id uuid, increment_total integer DEFAULT 1, increment_week integer DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  last_reset timestamp with time zone;
  week_ago timestamp with time zone := now() - interval '7 days';
BEGIN
  SELECT last_week_reset INTO last_reset FROM public.leaderboard_entries WHERE id = entry_id;
  
  IF last_reset < week_ago THEN
    UPDATE public.leaderboard_entries SET 
      total_logs = total_logs + increment_total,
      week_logs = increment_week,
      last_week_reset = now(),
      last_updated = now()
    WHERE id = entry_id;
  ELSE
    UPDATE public.leaderboard_entries SET 
      total_logs = total_logs + increment_total,
      week_logs = week_logs + increment_week,
      last_updated = now()
    WHERE id = entry_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_leaderboard_to_account(entry_id uuid, account_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.leaderboard_entries SET user_id = account_user_id, is_verified = true, last_updated = now() WHERE id = entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_full_leaderboard(sort_by text DEFAULT 'total')
RETURNS TABLE (id uuid, username text, user_id uuid, is_verified boolean, total_logs integer, week_logs integer, rank integer)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF sort_by = 'week' THEN
    RETURN QUERY SELECT le.id, le.username, le.user_id, le.is_verified, le.total_logs, le.week_logs,
      row_number() OVER (ORDER BY le.week_logs DESC, le.created_at ASC)::integer AS rank
    FROM public.leaderboard_entries le WHERE le.week_logs > 0 ORDER BY le.week_logs DESC, le.created_at ASC;
  ELSE
    RETURN QUERY SELECT le.id, le.username, le.user_id, le.is_verified, le.total_logs, le.week_logs,
      row_number() OVER (ORDER BY le.total_logs DESC, le.created_at ASC)::integer AS rank
    FROM public.leaderboard_entries le WHERE le.total_logs > 0 ORDER BY le.total_logs DESC, le.created_at ASC;
  END IF;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS leaderboard_entries_username_lower_idx ON public.leaderboard_entries (lower(username));
CREATE INDEX IF NOT EXISTS leaderboard_entries_user_id_idx ON public.leaderboard_entries (user_id);
CREATE INDEX IF NOT EXISTS leaderboard_entries_total_logs_idx ON public.leaderboard_entries (total_logs DESC);
CREATE INDEX IF NOT EXISTS leaderboard_entries_week_logs_idx ON public.leaderboard_entries (week_logs DESC);
