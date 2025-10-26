-- ==========================================
-- Dental AI Agent - Supabase Database Schema
-- ==========================================
-- Run this SQL in Supabase Studio > SQL Editor

-- 1. Create automations table
CREATE TABLE IF NOT EXISTS automations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create lab_slips table
CREATE TABLE IF NOT EXISTS lab_slips (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  procedure_type TEXT NOT NULL,
  laboratory_id TEXT,
  provider_id TEXT,
  notes TEXT,
  shade TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Done! Your Supabase database is now ready.
