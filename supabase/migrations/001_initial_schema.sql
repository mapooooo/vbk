-- VBK Platform initial schema

CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
CREATE TYPE registration_status AS ENUM ('registered', 'cancelled', 'waitlist');
CREATE TYPE payment_status AS ENUM ('free', 'pending', 'paid', 'refunded');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'member',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invites
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invites_token ON invites(token);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  location TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = TRUE;

-- Post likes
CREATE TABLE post_likes (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Post comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id, created_at);

-- Conversations (1:1)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_ordered CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- Events (hold/arrangementer)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  capacity INTEGER,
  price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_starts_at ON events(starts_at);

-- Event registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'registered',
  payment_status payment_status NOT NULL DEFAULT 'free',
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- Helper: is approved member
CREATE OR REPLACE FUNCTION is_approved_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND approved_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_or_trainer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'trainer') AND approved_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND approved_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Updated_at trigger for posts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Approved members can view profiles"
  ON profiles FOR SELECT
  USING (is_approved_member() OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Invites: anyone can validate token (select by token only via function)
CREATE POLICY "Admins manage invites"
  ON invites FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Anyone can read unused valid invite by token"
  ON invites FOR SELECT
  USING (used_at IS NULL AND expires_at > NOW());

-- Posts
CREATE POLICY "Approved members read posts"
  ON posts FOR SELECT
  USING (is_approved_member());

CREATE POLICY "Approved members create posts"
  ON posts FOR INSERT
  WITH CHECK (is_approved_member() AND author_id = auth.uid());

CREATE POLICY "Authors update own posts"
  ON posts FOR UPDATE
  USING (is_approved_member() AND (author_id = auth.uid() OR is_admin()));

CREATE POLICY "Authors or admin delete posts"
  ON posts FOR DELETE
  USING (is_approved_member() AND (author_id = auth.uid() OR is_admin()));

-- Post likes
CREATE POLICY "Approved members manage likes"
  ON post_likes FOR ALL
  USING (is_approved_member())
  WITH CHECK (is_approved_member() AND user_id = auth.uid());

-- Post comments
CREATE POLICY "Approved members read comments"
  ON post_comments FOR SELECT
  USING (is_approved_member());

CREATE POLICY "Approved members create comments"
  ON post_comments FOR INSERT
  WITH CHECK (is_approved_member() AND user_id = auth.uid());

CREATE POLICY "Users delete own comments"
  ON post_comments FOR DELETE
  USING (is_approved_member() AND (user_id = auth.uid() OR is_admin()));

-- Conversations
CREATE POLICY "Participants read conversations"
  ON conversations FOR SELECT
  USING (is_approved_member() AND (user_a = auth.uid() OR user_b = auth.uid()));

CREATE POLICY "Approved members create conversations"
  ON conversations FOR INSERT
  WITH CHECK (is_approved_member() AND (user_a = auth.uid() OR user_b = auth.uid()));

-- Messages
CREATE POLICY "Participants read messages"
  ON messages FOR SELECT
  USING (
    is_approved_member() AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
    )
  );

CREATE POLICY "Participants send messages"
  ON messages FOR INSERT
  WITH CHECK (
    is_approved_member() AND sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
    )
  );

-- Events
CREATE POLICY "Approved members read published events"
  ON events FOR SELECT
  USING (is_approved_member() AND published = TRUE);

CREATE POLICY "Admin trainer manage events"
  ON events FOR ALL
  USING (is_admin_or_trainer())
  WITH CHECK (is_admin_or_trainer() AND created_by = auth.uid());

CREATE POLICY "Admin read all events"
  ON events FOR SELECT
  USING (is_admin());

-- Event registrations
CREATE POLICY "Users read own registrations"
  ON event_registrations FOR SELECT
  USING (is_approved_member() AND (user_id = auth.uid() OR is_admin()));

CREATE POLICY "Users manage own registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (is_approved_member() AND user_id = auth.uid());

CREATE POLICY "Users update own registrations"
  ON event_registrations FOR UPDATE
  USING (is_approved_member() AND (user_id = auth.uid() OR is_admin()));

-- Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Function to complete invite signup
CREATE OR REPLACE FUNCTION complete_invite_signup(
  p_invite_token TEXT,
  p_full_name TEXT
)
RETURNS profiles AS $$
DECLARE
  v_invite invites%ROWTYPE;
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_invite FROM invites
  WHERE token = p_invite_token
    AND used_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  IF v_invite.email IS NOT NULL AND v_invite.email != (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Invite is locked to a different email';
  END IF;

  INSERT INTO profiles (id, full_name, role, approved_at)
  VALUES (
    auth.uid(),
    p_full_name,
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE approved_at IS NOT NULL)
      THEN 'admin'::user_role
      ELSE 'member'::user_role
    END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    approved_at = COALESCE(profiles.approved_at, NOW())
  RETURNING * INTO v_profile;

  UPDATE invites SET used_at = NOW(), used_by = auth.uid()
  WHERE id = v_invite.id;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION complete_invite_signup TO authenticated;

-- Validate invite (public, no auth required for checking)
CREATE OR REPLACE FUNCTION validate_invite(p_token TEXT)
RETURNS TABLE (valid BOOLEAN, email TEXT, expires_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT TRUE, i.email, i.expires_at
  FROM invites i
  WHERE i.token = p_token AND i.used_at IS NULL AND i.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION validate_invite TO anon, authenticated;
