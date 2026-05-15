-- Neon / PostgreSQL schema (mirrors former Mongoose models)
-- Applied automatically on server start via db/migrate.js; you can also run this file in the Neon SQL editor.

CREATE TABLE IF NOT EXISTS typing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL,
    wpm DOUBLE PRECISION NOT NULL,
    spm DOUBLE PRECISION NOT NULL DEFAULT 0,
    accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
    "time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compiler_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT,
    language TEXT,
    input TEXT,
    result TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Former TypingResult model (flattened nested result object)
CREATE TABLE IF NOT EXISTS typing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT,
    input TEXT,
    result_wpm DOUBLE PRECISION,
    result_accuracy DOUBLE PRECISION,
    result_time DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS typing_logs_set_updated_at ON typing_logs;
CREATE TRIGGER typing_logs_set_updated_at
    BEFORE UPDATE ON typing_logs
    FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();

DROP TRIGGER IF EXISTS compiler_runs_set_updated_at ON compiler_runs;
CREATE TRIGGER compiler_runs_set_updated_at
    BEFORE UPDATE ON compiler_runs
    FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();

DROP TRIGGER IF EXISTS typing_results_set_updated_at ON typing_results;
CREATE TRIGGER typing_results_set_updated_at
    BEFORE UPDATE ON typing_results
    FOR EACH ROW EXECUTE PROCEDURE trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_typing_logs_created_at ON typing_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compiler_runs_created_at ON compiler_runs (created_at DESC);
