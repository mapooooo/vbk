-- Offentlige ansøgninger om medlemskab (før invitation)

CREATE TYPE application_status AS ENUM ('pending', 'invited', 'rejected');

CREATE TABLE membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  dog_info TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  invite_id UUID REFERENCES invites(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_status ON membership_applications(status, created_at DESC);
CREATE INDEX idx_applications_email ON membership_applications(email);

ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Alle kan indsende ansøgning (kun som pending)
CREATE POLICY "Public can submit applications"
  ON membership_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Admin kan læse og opdatere
CREATE POLICY "Admins read applications"
  ON membership_applications FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins update applications"
  ON membership_applications FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
