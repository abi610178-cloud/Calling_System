/*
  # Add Work Verification Fields

  1. Changes to work_history table
    - Add `verification_status` column (pending, verified, has_complaint)
    - Add `verification_notes` column for recording client feedback
    - Add `verified_at` timestamp for when work was verified
  
  2. Purpose
    - Track whether completed work has been verified by the client
    - Record any complaints or issues with completed work
    - Maintain pending verification state until client confirms completion
*/

DO $$
BEGIN
  -- Add verification_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE work_history 
    ADD COLUMN verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'has_complaint'));
  END IF;

  -- Add verification_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE work_history 
    ADD COLUMN verification_notes text;
  END IF;

  -- Add verified_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE work_history 
    ADD COLUMN verified_at timestamptz;
  END IF;
END $$;
