/*
  # Create clients and related tables

  1. New Tables
    - `clients` - Main client contact table with priority field for categorization
    - `work_history` - Track work history for clients
    - `appointments` - Schedule appointments with clients
    - `client_feedback` - Store client feedback
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  whatsapp_number text,
  email text,
  position text,
  department text,
  status text DEFAULT 'pending',
  call_attempts integer DEFAULT 0,
  last_call_time timestamptz,
  priority text,
  work_status text DEFAULT 'new',
  is_urgent boolean DEFAULT false,
  business text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Work history table
CREATE TABLE IF NOT EXISTS work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients ON DELETE CASCADE NOT NULL,
  date timestamptz NOT NULL,
  notes text,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view work history of their clients"
  ON work_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert work history for their clients"
  ON work_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update work history of their clients"
  ON work_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete work history of their clients"
  ON work_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients ON DELETE CASCADE NOT NULL,
  date timestamptz NOT NULL,
  title text NOT NULL,
  notes text,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointments of their clients"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert appointments for their clients"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments of their clients"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments of their clients"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Client feedback table
CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback of their clients"
  ON client_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feedback for their clients"
  ON client_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feedback of their clients"
  ON client_feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feedback of their clients"
  ON client_feedback FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = auth.uid()
    )
  );