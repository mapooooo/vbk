-- Adgangskode efter første magic-link-login
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ;

-- Eksisterende godkendte medlemmer slipper for tvungen opsætning
UPDATE profiles
SET password_set_at = COALESCE(password_set_at, approved_at, NOW())
WHERE approved_at IS NOT NULL AND password_set_at IS NULL;
