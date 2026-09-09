-- =========================================================
-- PROGRAMME SEED DATA
-- Day 1 content sourced directly from the Figma reference.
-- Days 2–3 are placeholders pending confirmed programme
-- content from the design/coordination team.
-- =========================================================

INSERT INTO public.programme_days (event_date, title, description)
VALUES
    ('2026-11-09', 'Day 1', 'Opening day of the OAK Partner Convening'),
    ('2026-11-10', 'Day 2', 'Placeholder — awaiting confirmed programme'),
    ('2026-11-11', 'Day 3', 'Placeholder — awaiting confirmed programme');

-- Day 1 sessions, in display order
INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Registration & Welcome Coffee', NULL, '08:00', '09:00', 'Main Hall', 1
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Opening Plenary: Pathways to Impact',
       'Dr. Helena Moreau · OAK Foundation',
       '09:00', '10:30', 'Main Hall A', 2
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Coffee Break', NULL, '10:30', '10:50', NULL, 3
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Thematic Dialogue: Climate Justice & Grantmaking',
       'Samuel Okafor · Africa Climate Alliance',
       '10:50', '12:00', 'Conference Room B2', 4
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Networking Lunch', NULL, '12:00', '13:30', NULL, 5
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Partner Spotlight: Rights-Based Approaches',
       'Fatima Zahra Benali · MENA Rights Group',
       '13:30', '14:30', 'Main Hall A', 6
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Digital Rights in Authoritarian Contexts',
       'Li Wei · Digital Frontiers Institute',
       '14:45', '16:00', 'Conference Room B1', 7
FROM public.programme_days WHERE event_date = '2026-11-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Welcome Reception & Dinner', NULL, '18:00', '20:00', 'Rooftop Terrace', 8
FROM public.programme_days WHERE event_date = '2026-11-09';

-- Day 2 / Day 3 placeholders — flagged clearly, not real content
INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Programme to be confirmed',
       'Full Day 2 schedule pending from the coordination team',
       '09:00', '17:00', NULL, 1
FROM public.programme_days WHERE event_date = '2026-11-10';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location, display_order
)
SELECT id, 'Programme to be confirmed',
       'Full Day 3 schedule pending from the coordination team',
       '09:00', '17:00', NULL, 1
FROM public.programme_days WHERE event_date = '2026-11-11';