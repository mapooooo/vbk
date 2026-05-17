-- Medlemmer kan se tilmeldinger på offentliggjorte hold (til deltagerliste)
CREATE POLICY "Members read registrations on published events"
  ON event_registrations FOR SELECT
  USING (
    is_approved_member()
    AND status IN ('registered', 'waitlist')
    AND EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_registrations.event_id
        AND e.published = true
    )
  );
