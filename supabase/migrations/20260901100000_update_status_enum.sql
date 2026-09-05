-- Supabase Migration to update scan_jobs status enum constraint
ALTER TABLE public.scan_jobs DROP CONSTRAINT IF EXISTS scan_jobs_status_check;
ALTER TABLE public.scan_jobs ADD CONSTRAINT scan_jobs_status_check CHECK (status IN ('draft', 'pending', 'running', 'completed', 'failed'));
