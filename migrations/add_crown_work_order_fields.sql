-- Migration: Add Crown Work Order Fields to lab_slips Table
-- Created: 2025-10-26
-- Purpose: Extend lab_slips table to support both traditional lab slips and internal crown work orders

BEGIN;

-- ============================================
-- STEP 1: Add new columns for crown work orders
-- ============================================

-- External references
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS lab_id TEXT;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS template_id TEXT;

-- Open Dental References
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS opendental_patient_id INTEGER;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS opendental_procedure_id INTEGER;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS opendental_appointment_id INTEGER;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS opendental_lab_case_id INTEGER;

-- Patient Information
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS patient_dob DATE;

-- Procedure Information
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS procedure_code TEXT;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS procedure_description TEXT;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS tooth_number TEXT;

-- Work Order Data (JSONB)
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS lab_slip_data JSONB;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Files
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;

-- Timestamps
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE lab_slips ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- ============================================
-- STEP 2: Update status constraint
-- ============================================

-- Drop existing status check constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lab_slips_status_check' 
    AND conrelid = 'lab_slips'::regclass
  ) THEN
    ALTER TABLE lab_slips DROP CONSTRAINT lab_slips_status_check;
  END IF;
END $$;

-- Add new constraint that allows both lab slip and crown work order statuses
ALTER TABLE lab_slips ADD CONSTRAINT lab_slips_status_check CHECK (
  status IN (
    -- Traditional lab slip statuses
    'draft', 
    'sent', 
    'received', 
    'completed', 
    'cancelled',
    
    -- Crown work order statuses
    'pending',
    'scanned',
    'designed',
    'milling',
    'sintering',
    'finishing',
    'qc',
    'ready',
    'seated',
    'on_hold'
  )
);

-- ============================================
-- STEP 3: Create indexes for common queries
-- ============================================

-- Index for Open Dental procedure lookups
CREATE INDEX IF NOT EXISTS idx_lab_slips_opendental_procedure_id 
ON lab_slips(opendental_procedure_id) 
WHERE opendental_procedure_id IS NOT NULL;

-- Index for Open Dental patient lookups
CREATE INDEX IF NOT EXISTS idx_lab_slips_opendental_patient_id 
ON lab_slips(opendental_patient_id) 
WHERE opendental_patient_id IS NOT NULL;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_lab_slips_status ON lab_slips(status);

-- Index for created_at for chronological sorting
CREATE INDEX IF NOT EXISTS idx_lab_slips_created_at ON lab_slips(created_at DESC);

-- ============================================
-- STEP 4: Add comments for documentation
-- ============================================

COMMENT ON COLUMN lab_slips.opendental_patient_id IS 'Open Dental PatNum reference for crown work orders';
COMMENT ON COLUMN lab_slips.opendental_procedure_id IS 'Open Dental ProcNum reference for crown work orders';
COMMENT ON COLUMN lab_slips.lab_slip_data IS 'Full work order data as JSONB for crown work orders';
COMMENT ON COLUMN lab_slips.status IS 'Status: draft/sent/received/completed/cancelled for lab slips, pending/scanned/designed/milling/sintering/finishing/qc/ready/seated/on_hold for crown work orders';

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lab_slips'
AND column_name IN (
  'opendental_patient_id', 
  'opendental_procedure_id',
  'patient_name',
  'patient_dob',
  'procedure_code',
  'lab_slip_data',
  'pdf_storage_path'
)
ORDER BY column_name;

-- Verify status constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'lab_slips_status_check';

-- Show indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'lab_slips'
ORDER BY indexname;
