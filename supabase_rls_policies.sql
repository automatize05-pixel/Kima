-- ============================================
-- KIMA - Políticas de Segurança (RLS Policies)
-- Cole e execute no SQL Editor do Supabase
-- ============================================

-- 1. Habilitar RLS nas tabelas (se não estiver)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES: cada utilizador vê e edita apenas o seu próprio perfil
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;

CREATE POLICY "Profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. TASKS: cada utilizador vê e edita apenas as suas tarefas
DROP POLICY IF EXISTS "Tasks: select own" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: insert own" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: update own" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: delete own" ON public.tasks;

CREATE POLICY "Tasks: select own"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Tasks: insert own"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tasks: update own"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Tasks: delete own"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- 4. FOCUS_SESSIONS: cada utilizador vê e insere apenas as suas sessões
DROP POLICY IF EXISTS "Sessions: select own" ON public.focus_sessions;
DROP POLICY IF EXISTS "Sessions: insert own" ON public.focus_sessions;

CREATE POLICY "Sessions: select own"
  ON public.focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sessions: insert own"
  ON public.focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
