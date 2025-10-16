/*
  # Create Clients and Related Tables Schema

  ## Overview
  This migration creates the core database schema for a client management and calling system. It includes tables for clients, work history, appointments, and client feedback.

  ## New Tables

  ### 1. clients
  Main table for storing client/contact information.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each client
  - `user_id` (uuid, not null) - Reference to authenticated user who owns this client
  - `name` (text, not null) - Client's full name
  - `phone_number` (text, not null) - Primary contact phone number
  - `whatsapp_number` (text, nullable) - WhatsApp contact number if different
  - `email` (text, not null) - Client's email address
  - `position` (text, not null) - Client's job position/title
  - `department` (text, not null) - Client's department
  - `status` (text, not null) - Call status: 'pending', 'calling', 'answered', 'missed'
  - `call_attempts` (integer, default 0) - Number of times client has been called
  - `last_call_time` (timestamptz, nullable) - Timestamp of last call attempt
  - `priority` (text, nullable) - Priority level: 'high', 'follow-up', 'not-interested'
  - `work_status` (text, not null, default 'new') - Work relationship status
  - `is_urgent` (boolean, default false) - Flag for urgent clients
  - `business` (text, nullable) - Business category/industry
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  - `updated_at` (timestamptz, default now()) - Record last update timestamp

  ### 2. work_history
  Tracks work/project history with clients.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each work record
  - `user_id` (uuid, not null) - Reference to authenticated user
  - `client_id` (uuid, not null) - Foreign key to clients table
  - `work_type` (text, not null) - Type/category of work performed
  - `work_description` (text, nullable) - Detailed description of the work
  - `start_date` (timestamptz, nullable) - Work start date
  - `completion_date` (timestamptz, nullable) - Work completion date
  - `status` (text, not null) - Work status: 'planned', 'in_progress', 'completed', 'cancelled'
  - `amount` (numeric, nullable) - Financial amount associated with work
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  - `updated_at` (timestamptz, default now()) - Record last update timestamp

  ### 3. appointments
  Manages scheduled appointments with clients.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each appointment
  - `user_id` (uuid, not null) - Reference to authenticated user
  - `client_id` (uuid, not null) - Foreign key to clients table
  - `appointment_date` (timestamptz, not null) - Scheduled date and time
  - `appointment_type` (text, not null) - Type of appointment
  - `status` (text, not null) - Appointment status: 'scheduled', 'completed', 'cancelled', 'no_show'
  - `notes` (text, nullable) - Additional notes about the appointment
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  - `updated_at` (timestamptz, default now()) - Record last update timestamp

  ### 4. client_feedback
  Stores client feedback and ratings.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each feedback entry
  - `user_id` (uuid, not null) - Reference to authenticated user
  - `client_id` (uuid, not null) - Foreign key to clients table
  - `rating` (integer, not null) - Numeric rating (typically 1-5)
  - `feedback_text` (text, nullable) - Written feedback from client
  - `feedback_date` (timestamptz, not null) - Date feedback was received
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  - `updated_at` (timestamptz, default now()) - Record last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - RLS is enabled on all tables to ensure data isolation between users
  - Users can only access their own data (filtered by user_id)
  - Each table has four policies: SELECT, INSERT, UPDATE, DELETE
  - All policies require authentication and verify user_id ownership

  ### Policies Created

  **clients table:**
  - Users can view only their own clients
  - Users can insert clients linked to their account
  - Users can update only their own clients
  - Users can delete only their own clients

  **work_history table:**
  - Users can view work history for their own clients
  - Users can insert work history for their own clients
  - Users can update work history for their own clients
  - Users can delete work history for their own clients

  **appointments table:**
  - Users can view appointments for their own clients
  - Users can insert appointments for their own clients
  - Users can update appointments for their own clients
  - Users can delete appointments for their own clients

  **client_feedback table:**
  - Users can view feedback for their own clients
  - Users can insert feedback for their own clients
  - Users can update feedback for their own clients
  - Users can delete feedback for their own clients

  ## Indexes
  - Primary keys automatically indexed
  - Foreign key columns (client_id) indexed for join performance
  - user_id indexed on all tables for efficient user-specific queries

  ## Constraints
  - Foreign key constraints ensure referential integrity
  - CHECK constraints validate data (e.g., rating range)
  - NOT NULL constraints enforce required fields
  - DEFAULT values provide sensible defaults
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  whatsapp_number text,
  email text NOT NULL DEFAULT 'Not provided',
  position text NOT NULL DEFAULT 'Not specified',
  department text NOT NULL DEFAULT 'Not specified',
  status text NOT NULL DEFAULT 'pending',
  call_attempts integer NOT NULL DEFAULT 0,
  last_call_time timestamptz,
  priority text,
  work_status text NOT NULL DEFAULT 'new',
  is_urgent boolean NOT NULL DEFAULT false,
  business text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create work_history table
CREATE TABLE IF NOT EXISTS work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  work_type text NOT NULL,
  work_description text,
  start_date timestamptz,
  completion_date timestamptz,
  status text NOT NULL DEFAULT 'planned',
  amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  appointment_type text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create client_feedback table
CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  feedback_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone_number ON clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_work_history_client_id ON work_history(client_id);
CREATE INDEX IF NOT EXISTS idx_work_history_user_id ON work_history(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_client_id ON client_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_user_id ON client_feedback(user_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for clients table
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

-- Create RLS Policies for work_history table
CREATE POLICY "Users can view own work history"
  ON work_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work history"
  ON work_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work history"
  ON work_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own work history"
  ON work_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS Policies for appointments table
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS Policies for client_feedback table
CREATE POLICY "Users can view own client feedback"
  ON client_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client feedback"
  ON client_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client feedback"
  ON client_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client feedback"
  ON client_feedback FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);