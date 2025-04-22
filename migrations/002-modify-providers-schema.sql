-- Add blockchain fields to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS network TEXT DEFAULT 'base-sepolia';

-- Update existing users with demo wallet addresses (for testing only)
UPDATE providers 
SET wallet_address = '0x' || encode(gen_random_bytes(20), 'hex') 
WHERE wallet_address IS NULL;
