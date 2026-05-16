-- Bootstrap/dev invites uden RLS-blokering (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION create_system_invite(
  p_token TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS invites
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result invites;
BEGIN
  INSERT INTO invites (token, expires_at)
  VALUES (p_token, p_expires_at)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION create_system_invite(TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_system_invite(TEXT, TIMESTAMPTZ) TO service_role;
