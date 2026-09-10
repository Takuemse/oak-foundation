"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, ChevronDown } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

type SessionCategory = "plenary" | "breakout" | "workshop" | "social" | "break";

type Session = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  category: SessionCategory;
  presenter_name: string | null;
  presenter_org: string | null;
  is_featured: boolean;
};

type Day = {
  id: string;
  event_date: string;
  title: string;
  sessions: Session[];
};

const CATEGORY_STYLES: Record<
  Exclude<SessionCategory, "break">,
  { dot: string; badgeBg: string; badgeText: string; label: string }
> = {
  plenary: { dot: "bg-[#0f1e3d]", badgeBg: "bg-slate-100", badgeText: "text-slate-700", label: "Plenary" },
  breakout: { dot: "bg-amber-400", badgeBg: "bg-amber-50", badgeText: "text-amber-700", label: "Breakout" },
  workshop: { dot: "bg-violet-400", badgeBg: "bg-violet-50", badgeText: "text-violet-700", label: "Workshop" },
  social: { dot: "bg-orange-500", badgeBg: "bg-orange-50", badgeText: "text-orange-700", label: "Social" },
};

export default function ProgrammePage() {
  const [days, setDays] = useState<Day[]>([]);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/programme");
        const data = await res.json();
        if (!data.success) {
          setError(data.message ?? "Unable to load programme.");
          return;
        }
        setDays(data.days);
        if (data.days.length > 0) setActiveDay(data.days[0].id);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const current = days.find((d) => d.id === activeDay);
  const dayIndex = days.findIndex((d) => d.id === activeDay);
  const featured = current?.sessions.find((s) => s.is_featured);
  const rest = current?.sessions.filter((s) => !s.is_featured) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-900 mb-0.5">Programme</h1>
        <p className="text-sm text-slate-400 mb-5">OAK Partner Convening 2026</p>

        <div className="flex items-center gap-1 bg-slate-100/70 rounded-xl p-1 mb-5 w-fit">
          <button className="px-4 py-1.5 rounded-lg bg-white text-sm font-semibold text-slate-800 shadow-sm">
            Schedule
          </button>
          <Link
            href="/documentation"
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Docs
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <>
            <div className="flex gap-2 mb-5">
              {days.map((day, i) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-center transition ${
                    activeDay === day.id
                      ? "bg-[#0f1e3d] text-white"
                      : "bg-white border border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wide opacity-70">
                    {formatWeekday(day.event_date)}
                  </div>
                  <div className="text-sm font-bold">Day {i + 1}</div>
                  <div className="text-[11px] opacity-80">{formatShortDate(day.event_date)}</div>
                </button>
              ))}
            </div>

            {featured && (
              <div className="bg-[#0a1730] text-white rounded-2xl px-5 py-4 mb-5 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5" />
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-300 mb-2 relative z-10">
                  <Star size={12} className="fill-slate-300 text-slate-300" />
                  Featured · {formatTime(featured.start_time)}–{formatTime(featured.end_time)}
                </div>
                <h2 className="text-lg font-bold mb-2 relative z-10">{featured.title}</h2>
                {featured.presenter_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-200 mb-1.5 relative z-10">
                    <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-semibold">
                      {featured.presenter_name.charAt(0)}
                    </span>
                    {featured.presenter_name}
                    {featured.presenter_org && ` · ${featured.presenter_org}`}
                  </div>
                )}
                {featured.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 relative z-10">
                    <MapPin size={12} />
                    {featured.location}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-xs text-slate-500">
              {(Object.keys(CATEGORY_STYLES) as Array<keyof typeof CATEGORY_STYLES>).map((key) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[key].dot}`} />
                  {CATEGORY_STYLES[key].label}
                </span>
              ))}
            </div>

            {current && (rest.length > 0 || featured) ? (
              <div className="space-y-3">
                {rest.map((s) =>
                  s.category === "break" ? (
                    <BreakDivider key={s.id} time={formatTime(s.start_time)} label={s.title} />
                  ) : (
                    <SessionRow key={s.id} session={s} />
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                No sessions scheduled for this day yet.
              </p>
            )}
          </>
        )}

        <Link
          href="/register"
          className="block text-center mt-6 border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-medium hover:bg-white transition"
        >
          Back to Registration
        </Link>
      </main>
    </div>
  );
}

function BreakDivider({ time, label }: { time: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-slate-400 w-14 flex-shrink-0">{time}</span>
      <div className="flex-1 border-t border-dashed border-slate-200" />
      <span className="text-xs text-slate-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 border-t border-dashed border-slate-200" />
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const style = CATEGORY_STYLES[session.category as Exclude<SessionCategory, "break">];
  const hasDetails = Boolean(session.description);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full text-left flex gap-3 ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="text-xs text-slate-400 w-14 flex-shrink-0 pt-0.5">
          <div className="font-medium text-slate-600">{formatTime(session.start_time)}</div>
          <div>–{formatTime(session.end_time)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">{session.title}</p>
            {hasDetails && (
              <ChevronDown
                size={16}
                className={`text-slate-300 flex-shrink-0 mt-0.5 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
          {style && (
            <span
              className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${style.badgeBg} ${style.badgeText}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          )}
          {(session.presenter_name || session.presenter_org) && (
            <p className="text-xs text-slate-500 mt-1.5">
              {session.presenter_name}
              {session.presenter_name && session.presenter_org && " · "}
              {session.presenter_org}
            </p>
          )}
          {session.location && (
            <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <MapPin size={11} />
              {session.location}
            </p>
          )}
          {open && session.description && (
            <p className="text-xs text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-100">
              {session.description}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}

function formatWeekday(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function formatShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}