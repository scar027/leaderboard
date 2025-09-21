-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance when ordering by score
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);

-- Insert some sample data
INSERT INTO public.leaderboard (player_name, score) VALUES
  ('Alice Johnson', 2500),
  ('Bob Smith', 2200),
  ('Charlie Brown', 1950),
  ('Diana Prince', 1800),
  ('Eve Wilson', 1650),
  ('Frank Miller', 1400),
  ('Grace Lee', 1200),
  ('Henry Davis', 1000),
  ('Ivy Chen', 850),
  ('Jack Thompson', 700)
ON CONFLICT DO NOTHING;
