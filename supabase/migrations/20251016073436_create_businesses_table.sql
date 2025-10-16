/*
  # Create Businesses Table

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `name` (text) - Display name of the business
      - `value` (text) - Slug/identifier for filtering
      - `user_id` (uuid, references auth.users, nullable for defaults)
      - `is_default` (boolean) - Whether this is a system-default business
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `businesses` table
    - Add policy for authenticated users to read their own businesses and default businesses
    - Add policy for authenticated users to insert their own businesses
    - Add policy for authenticated users to update their own businesses
    - Add policy for authenticated users to delete their own businesses (not defaults)

  3. Data
    - Insert default business types
*/

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint for user-specific businesses
CREATE UNIQUE INDEX IF NOT EXISTS unique_business_value_per_user 
  ON businesses (user_id, value) 
  WHERE user_id IS NOT NULL;

-- Create unique constraint for default businesses
CREATE UNIQUE INDEX IF NOT EXISTS unique_default_business_value 
  ON businesses (value) 
  WHERE is_default = true;

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own and default businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own businesses"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update their own businesses"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete their own businesses"
  ON businesses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- Insert default businesses (user_id is NULL for defaults)
INSERT INTO businesses (name, value, user_id, is_default)
VALUES
  ('All Businesses', 'all', NULL, true),
  ('Real Estate', 'real_estate', NULL, true),
  ('Finance', 'finance', NULL, true),
  ('Education', 'education', NULL, true),
  ('Healthcare', 'healthcare', NULL, true),
  ('Technology', 'technology', NULL, true),
  ('Retail', 'retail', NULL, true),
  ('Other', 'other', NULL, true)
ON CONFLICT DO NOTHING;