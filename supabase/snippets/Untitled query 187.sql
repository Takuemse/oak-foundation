SELECT d.title, d.event_date, count(s.id) AS session_count
FROM public.programme_days d
LEFT JOIN public.programme_sessions s ON s.programme_day_id = d.id
GROUP BY d.id, d.title, d.event_date
ORDER BY d.event_date;