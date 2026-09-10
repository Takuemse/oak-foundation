-- =========================================================
-- PROGRAMME SEED DATA
-- Day 1 content sourced directly from the Figma reference.
-- Days 2–3 are placeholders pending confirmed programme content.
-- =========================================================

INSERT INTO public.programme_days (event_date, title, description)
VALUES
    ('2026-03-09', 'Day 1', 'Opening day of the OAK Partner Convening'),
    ('2026-03-10', 'Day 2', 'Placeholder — awaiting confirmed programme'),
    ('2026-03-11', 'Day 3', 'Placeholder — awaiting confirmed programme');

-- Day 1 sessions, in display order
INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Registration & Welcome Coffee', NULL, '08:00', '09:00', NULL,
       1, 'break', NULL, NULL, false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Opening Plenary: Pathways to Impact', NULL, '09:00', '10:30', 'Main Hall A',
       2, 'plenary', 'Dr. Helena Moreau', 'OAK Foundation', true
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Coffee Break', NULL, '10:30', '10:50', NULL,
       3, 'break', NULL, NULL, false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Thematic Dialogue: Climate Justice & Grantmaking', NULL, '10:50', '12:00', 'Conference Room B2',
       4, 'breakout', 'Samuel Okafor', 'Africa Climate Alliance', false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Workshop: Measuring Long-term Change', NULL, '10:50', '12:00', 'Workshop Room C',
       5, 'workshop', 'Dr. Ingrid Holm', 'Nordic Evaluation Centre', false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Networking Lunch', NULL, '12:00', '13:30', NULL,
       6, 'break', NULL, NULL, false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Partner Spotlight: Rights-Based Approaches', NULL, '13:30', '14:30', 'Main Hall A',
       7, 'plenary', 'Fatima Zahra Benali', 'MENA Rights Group', false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Digital Rights in Authoritarian Contexts', NULL, '14:45', '16:00', 'Conference Room B1',
       8, 'breakout', 'Li Wei', 'Digital Frontiers Institute', false
FROM public.programme_days WHERE event_date = '2026-03-09';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Welcome Reception & Dinner', NULL, '18:00', '20:00', 'Rooftop Terrace',
       9, 'social', NULL, NULL, false
FROM public.programme_days WHERE event_date = '2026-03-09';

-- Day 2 / Day 3 placeholders
INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Programme to be confirmed', 'Full Day 2 schedule pending from the coordination team',
       '09:00', '17:00', NULL, 1, 'plenary', NULL, NULL, false
FROM public.programme_days WHERE event_date = '2026-03-10';

INSERT INTO public.programme_sessions (
    programme_day_id, title, description, start_time, end_time, location,
    display_order, category, presenter_name, presenter_org, is_featured
)
SELECT id, 'Programme to be confirmed', 'Full Day 3 schedule pending from the coordination team',
       '09:00', '17:00', NULL, 1, 'plenary', NULL, NULL, false
FROM public.programme_days WHERE event_date = '2026-03-11';