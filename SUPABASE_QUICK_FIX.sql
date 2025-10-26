-- Quick Fix: Update Status Constraint for Crown Work Orders
-- Run this in your Supabase SQL Editor to enable crown work order statuses
-- URL: https://supabase.com/dashboard/project/dpmwjmikdkcgjcmhdslc/sql

BEGIN;

-- Drop existing status check constraint
ALTER TABLE lab_slips DROP CONSTRAINT IF EXISTS lab_slips_status_check;

-- Add new constraint with both lab slip and crown work order statuses
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

COMMIT;

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'lab_slips_status_check';
