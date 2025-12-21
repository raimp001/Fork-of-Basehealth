-- Migration: Add licenseNumber field to providers table
-- This field stores the state medical board license number (required for physicians)

ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS "licenseNumber" TEXT;

-- Add comment to document the field
COMMENT ON COLUMN providers."licenseNumber" IS 'State medical board license number (required for physicians)';
