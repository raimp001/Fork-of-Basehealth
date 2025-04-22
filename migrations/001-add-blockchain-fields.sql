-- Add blockchain fields to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Add blockchain transaction hash field to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT;

-- Create index for blockchain transaction hash
CREATE INDEX IF NOT EXISTS idx_appointments_blockchain_tx_hash ON appointments(blockchain_tx_hash);

-- Add blockchain payment method to appointments table
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_payment_method_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_payment_method_check 
CHECK (payment_method IN ('credit_card', 'insurance', 'cash', 'blockchain'));
