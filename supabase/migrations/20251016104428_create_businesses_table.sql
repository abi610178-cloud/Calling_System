/*
  # Create Businesses Table

  ## Overview
  This migration creates the businesses table to store business types/categories that users can select for their clients.

  ## New Table: businesses

  **Purpose:** Store predefined and custom business types/categories that users can assign to their clients.

  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each business entry
  - `user_id` (uuid, not null) - Reference to authenticated user who created this business (for custom entries)
  - `name` (text, not null) - Display name of the business type (e.g., "Real Estate", "Finance")
  - `value` (text, not null) - Internal value/code for the business type (e.g., "real_estate", "finance")
  - `is_default` (boolean, default false) - Flag indicating if this is a system-provided default option
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  - `updated_at` (timestamptz, default now()) - Record last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - RLS is enabled to ensure proper data access control
  - Users can view all default businesses plus their own custom businesses
  - Users can only insert, update, and delete their own custom businesses
  - Default businesses (is_default = true) are read-only for all users

  ### Policies Created
  - Users can view all default businesses and their own custom businesses
  - Users can insert their own custom businesses
  - Users can update only their own custom businesses
  - Users can delete only their own custom businesses

  ## Default Data
  Pre-populates the table with common business types for immediate use.

  ## Indexes
  - Primary key automatically indexed
  - user_id indexed for efficient user-specific queries
  - is_default indexed for filtering default vs custom entries
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  value text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_is_default ON businesses(is_default);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for businesses table
CREATE POLICY "Users can view default businesses and own custom businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own custom businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own custom businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own custom businesses"
  ON businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- Insert default business types
-- Using a system user ID (first user or placeholder) for default entries
DO $$
DECLARE
  system_user_id uuid;
BEGIN
  -- Get the first user from auth.users to assign as owner of defaults
  -- If no users exist yet, we'll use a placeholder UUID
  SELECT id INTO system_user_id FROM auth.users LIMIT 1;
  
  -- If no users exist, use a placeholder (these will be visible to all users anyway due to is_default)
  IF system_user_id IS NULL THEN
    system_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  -- Insert default businesses if they don't exist
  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Real Estate', 'real_estate', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'real_estate' AND is_default = true);

  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Finance', 'finance', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'finance' AND is_default = true);

  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Education', 'education', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'education' AND is_default = true);

  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Healthcare', 'healthcare', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'healthcare' AND is_default = true);

  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Technology', 'technology', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'technology' AND is_default = true);

  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Retail', 'retail', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'retail' AND is_default = true);

  INSERT INTO businesses (user_id, name, value, is_default)
  SELECT system_user_id, 'Other', 'other', true
  WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE value = 'other' AND is_default = true);
END $$;