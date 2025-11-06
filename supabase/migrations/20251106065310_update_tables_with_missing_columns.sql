/*
  # Update tables with missing columns

  1. Changes to work_history
    - Add work_type column
    - Add work_description column
    - Add start_date column
    - Add completion_date column
    - Add amount column
    - Rename date to created_at if needed

  2. Changes to appointments
    - Rename date to appointment_date
    - Rename title to appointment_type
    - Rename notes to notes (keep)
    - Rename status to status (keep)

  3. Changes to client_feedback
    - Add feedback_date column
    - Rename created_at or add it
*/

-- Update work_history table
DO $$
BEGIN
  -- Add work_type column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'work_type'
  ) THEN
    ALTER TABLE work_history ADD COLUMN work_type text;
  END IF;

  -- Add work_description column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'work_description'
  ) THEN
    ALTER TABLE work_history ADD COLUMN work_description text;
  END IF;

  -- Add start_date column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE work_history ADD COLUMN start_date timestamptz;
  END IF;

  -- Add completion_date column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'completion_date'
  ) THEN
    ALTER TABLE work_history ADD COLUMN completion_date timestamptz;
  END IF;

  -- Add amount column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'amount'
  ) THEN
    ALTER TABLE work_history ADD COLUMN amount numeric(10, 2);
  END IF;

  -- Remove date column if exists (we're using created_at)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_history' AND column_name = 'date'
  ) THEN
    ALTER TABLE work_history DROP COLUMN date;
  END IF;
END $$;

-- Update appointments table
DO $$
BEGIN
  -- Rename date to appointment_date if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'appointment_date'
  ) THEN
    ALTER TABLE appointments RENAME COLUMN date TO appointment_date;
  END IF;

  -- Rename title to appointment_type if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'appointment_type'
  ) THEN
    ALTER TABLE appointments RENAME COLUMN title TO appointment_type;
  END IF;
END $$;

-- Update client_feedback table
DO $$
BEGIN
  -- Add feedback_date column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_feedback' AND column_name = 'feedback_date'
  ) THEN
    ALTER TABLE client_feedback ADD COLUMN feedback_date timestamptz DEFAULT now();
  END IF;
END $$;
