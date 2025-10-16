/*
  # Add business field to clients table

  1. Changes
    - Add `business` column to `clients` table
      - Type: text (enum-like with check constraint)
      - Allowed values: 'real_estate', 'finance', 'education', 'healthcare', 'technology', 'retail', 'other'
      - Default: 'other'
      - Not null
    - Add index on business column for better query performance

  2. Purpose
    - Enable business-based filtering of contacts
    - Support separate call queues for different businesses
    - Maintain independent attended/unattended stacks per business
*/

-- Add business column to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'business'
  ) THEN
    ALTER TABLE clients ADD COLUMN business text NOT NULL DEFAULT 'other'
    CHECK (business IN ('real_estate', 'finance', 'education', 'healthcare', 'technology', 'retail', 'other'));
  END IF;
END $$;

-- Create index for better performance on business filtering
CREATE INDEX IF NOT EXISTS clients_business_idx ON clients(business);

-- Create composite index for user_id and business (common query pattern)
CREATE INDEX IF NOT EXISTS clients_user_business_idx ON clients(user_id, business);
