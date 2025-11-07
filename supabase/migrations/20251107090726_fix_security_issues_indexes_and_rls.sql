/*
  # Fix Security Issues - Indexes and RLS Optimization

  ## 1. Add Indexes for Foreign Keys
  
  Adding covering indexes for all foreign key columns to improve query performance:
  - appointments.client_id
  - businesses.user_id
  - client_feedback.client_id
  - clients.user_id
  - employees.business_id
  - employees.user_id
  - work_history.client_id

  ## 2. Optimize RLS Policies
  
  Replace all `auth.uid()` calls with `(select auth.uid())` to prevent 
  re-evaluation for each row, significantly improving query performance at scale.
  
  Tables affected:
  - businesses (4 policies)
  - employees (4 policies)
  - clients (4 policies)
  - work_history (4 policies)
  - appointments (4 policies)
  - client_feedback (4 policies)

  ## 3. Performance Impact
  
  These changes will:
  - Speed up foreign key lookups and joins
  - Reduce CPU usage on RLS policy evaluation
  - Improve overall database performance
*/

-- ============================================================================
-- PART 1: ADD INDEXES FOR FOREIGN KEYS
-- ============================================================================

-- Index for appointments.client_id
CREATE INDEX IF NOT EXISTS idx_appointments_client_id 
ON appointments(client_id);

-- Index for businesses.user_id
CREATE INDEX IF NOT EXISTS idx_businesses_user_id 
ON businesses(user_id);

-- Index for client_feedback.client_id
CREATE INDEX IF NOT EXISTS idx_client_feedback_client_id 
ON client_feedback(client_id);

-- Index for clients.user_id
CREATE INDEX IF NOT EXISTS idx_clients_user_id 
ON clients(user_id);

-- Index for employees.business_id
CREATE INDEX IF NOT EXISTS idx_employees_business_id 
ON employees(business_id);

-- Index for employees.user_id
CREATE INDEX IF NOT EXISTS idx_employees_user_id 
ON employees(user_id);

-- Index for work_history.client_id
CREATE INDEX IF NOT EXISTS idx_work_history_client_id 
ON work_history(client_id);

-- ============================================================================
-- PART 2: OPTIMIZE RLS POLICIES - BUSINESSES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON businesses;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own businesses"
  ON businesses FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 3: OPTIMIZE RLS POLICIES - EMPLOYEES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own contacts" ON employees;
DROP POLICY IF EXISTS "Users can insert own contacts" ON employees;
DROP POLICY IF EXISTS "Users can update own contacts" ON employees;
DROP POLICY IF EXISTS "Users can delete own contacts" ON employees;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view own contacts"
  ON employees FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own contacts"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own contacts"
  ON employees FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own contacts"
  ON employees FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 4: OPTIMIZE RLS POLICIES - CLIENTS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 5: OPTIMIZE RLS POLICIES - WORK_HISTORY TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view work history of their clients" ON work_history;
DROP POLICY IF EXISTS "Users can insert work history for their clients" ON work_history;
DROP POLICY IF EXISTS "Users can update work history of their clients" ON work_history;
DROP POLICY IF EXISTS "Users can delete work history of their clients" ON work_history;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view work history of their clients"
  ON work_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert work history for their clients"
  ON work_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update work history of their clients"
  ON work_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete work history of their clients"
  ON work_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = work_history.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 6: OPTIMIZE RLS POLICIES - APPOINTMENTS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view appointments of their clients" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments for their clients" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments of their clients" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments of their clients" ON appointments;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view appointments of their clients"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert appointments for their clients"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update appointments of their clients"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete appointments of their clients"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 7: OPTIMIZE RLS POLICIES - CLIENT_FEEDBACK TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view feedback of their clients" ON client_feedback;
DROP POLICY IF EXISTS "Users can insert feedback for their clients" ON client_feedback;
DROP POLICY IF EXISTS "Users can update feedback of their clients" ON client_feedback;
DROP POLICY IF EXISTS "Users can delete feedback of their clients" ON client_feedback;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view feedback of their clients"
  ON client_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert feedback for their clients"
  ON client_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update feedback of their clients"
  ON client_feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete feedback of their clients"
  ON client_feedback FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_feedback.client_id
      AND clients.user_id = (select auth.uid())
    )
  );
