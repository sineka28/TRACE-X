-- ============================================================
-- TRACE-X DATABASE SCHEMA (Supabase PostgreSQL / RLS Enabled)
-- ============================================================

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    organization TEXT DEFAULT 'TRACE-X Labs',
    role TEXT DEFAULT 'Lead Investigator',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Investigations Table
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    domain TEXT DEFAULT 'Campus Safety',
    status TEXT DEFAULT 'ACTIVE',
    is_synthetic_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evidence Sources Table
CREATE TABLE IF NOT EXISTS public.evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source_category TEXT NOT NULL,
    description TEXT,
    location TEXT,
    coverage_time_window TEXT,
    source_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Evidence Files Table
CREATE TABLE IF NOT EXISTS public.evidence_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    source_id UUID REFERENCES public.evidence_sources(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_path_or_url TEXT,
    file_size BIGINT DEFAULT 0,
    timestamp TEXT,
    location TEXT,
    status TEXT DEFAULT 'READY',
    extracted_text TEXT,
    file_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    source_id UUID REFERENCES public.evidence_sources(id) ON DELETE SET NULL,
    timestamp TEXT NOT NULL,
    end_timestamp TEXT,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    entities JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'OBSERVED', -- OBSERVED, INFERRED, UNKNOWN, CONFLICTING
    confidence NUMERIC(3, 2) DEFAULT 1.00,
    event_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Unknown Gaps Table
CREATE TABLE IF NOT EXISTS public.unknown_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration TEXT NOT NULL,
    preceding_event TEXT,
    following_event TEXT,
    sources_available JSONB DEFAULT '[]'::jsonb,
    sources_missing JSONB DEFAULT '[]'::jsonb,
    significance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Hypotheses Table
CREATE TABLE IF NOT EXISTS public.hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'UNCERTAIN', -- SUPPORTED, PARTIALLY_SUPPORTED, UNCERTAIN, CONTRADICTED, INSUFFICIENT_EVIDENCE
    heuristic_score NUMERIC(5, 2) DEFAULT 50.00,
    assumptions JSONB DEFAULT '[]'::jsonb,
    supporting_evidence JSONB DEFAULT '[]'::jsonb,
    contradicting_evidence JSONB DEFAULT '[]'::jsonb,
    missing_evidence JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Expected Evidence Table
CREATE TABLE IF NOT EXISTS public.expected_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    hypothesis_id UUID NOT NULL REFERENCES public.hypotheses(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    source_type TEXT NOT NULL,
    time_window TEXT NOT NULL,
    reason TEXT NOT NULL,
    actual_status TEXT DEFAULT 'UNKNOWN', -- FOUND, PARTIAL, MISSING, CONTRADICTED, UNKNOWN
    actual_finding TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Counterfactual Factors Table
CREATE TABLE IF NOT EXISTS public.counterfactual_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hypothesis_id UUID NOT NULL REFERENCES public.hypotheses(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- STRENGTHENING, WEAKENING, CONTRADICTING, DISTINGUISHING
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    time_window TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Next Best Evidence Table
CREATE TABLE IF NOT EXISTS public.next_best_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    location TEXT NOT NULL,
    time_window TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    reason TEXT NOT NULL,
    related_hypotheses JSONB DEFAULT '[]'::jsonb,
    heuristic_info_value NUMERIC(3, 2) DEFAULT 0.75,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_json JSONB DEFAULT '{}'::jsonb,
    legal_disclaimer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID,
    type TEXT DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unknown_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expected_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counterfactual_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.next_best_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own data
CREATE POLICY "Users can manage their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Users can manage their own investigations or view demo"
    ON public.investigations FOR ALL
    USING (auth.uid() = user_id OR is_synthetic_demo = TRUE);

CREATE POLICY "Users can view child investigation data"
    ON public.evidence_sources FOR ALL
    USING (EXISTS (SELECT 1 FROM public.investigations WHERE id = evidence_sources.investigation_id AND (user_id = auth.uid() OR is_synthetic_demo = TRUE)));
