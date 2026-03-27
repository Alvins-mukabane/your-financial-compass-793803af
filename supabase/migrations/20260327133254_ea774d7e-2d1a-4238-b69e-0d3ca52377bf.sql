
CREATE TABLE public.spending_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  raw_input text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spending_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs" ON public.spending_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.spending_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON public.spending_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_spending_logs_user_date ON public.spending_logs (user_id, date DESC);
