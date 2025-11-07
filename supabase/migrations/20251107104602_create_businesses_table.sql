/*
  # Create businesses table

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `value` (text)
      - `is_default` (boolean, default false)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `businesses` table
    - Add policies for authenticated users to manage their own businesses
*/

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  is_default boolean DEFAULT false,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses"
  ON businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);