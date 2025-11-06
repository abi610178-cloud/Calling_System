/*
  # Create employees (contacts) table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `phone_number` (text, not null)
      - `whatsapp_number` (text, nullable)
      - `status` (text, default 'pending')
      - `priority` (text, nullable)
      - `call_attempts` (integer, default 0)
      - `user_id` (uuid, foreign key to auth.users)
      - `business_id` (uuid, foreign key to businesses, nullable)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `employees` table
    - Add policies for authenticated users to manage their own contacts
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  whatsapp_number text,
  status text DEFAULT 'pending',
  priority text,
  call_attempts integer DEFAULT 0,
  user_id uuid REFERENCES auth.users NOT NULL,
  business_id uuid REFERENCES businesses,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON employees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON employees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
