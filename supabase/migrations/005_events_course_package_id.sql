-- Kobler events til kursushold i src/lib/content/kursushold.ts

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS course_package_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_events_course_package_id
  ON events(course_package_id)
  WHERE course_package_id IS NOT NULL;
