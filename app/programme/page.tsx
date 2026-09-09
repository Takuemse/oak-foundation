"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
};

type Day = {
  id: string;
  event_date: string;
  title: string;
  sessions: Session[];
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-56 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="px-5 pt-6 pb-4 border-b border-slate-100">
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              OAK <span className="font-normal text-slate-400">FOUNDATION</span>
            </div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mt-1">
              Partner Convening 2026
            </div>
          </div>
          <nav className="px-3 py-4 space-y-1">
            <SidebarLink label="Register" href="/register" />
            <SidebarLink label="Programme" href="/programme" active />
            <SidebarLink label="Partners" href="/partners" />
          </nav>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">
          Harare, Zimbabwe
          <br />
          9–11 November 2026
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-900 mb-0.5">Programme</h1>
        <p className="text-sm text-slate-400 mb-5">OAK Partner Convening 2026</p>

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
                  className={`flex-1 rounded-xl px-3 py-2 text-center transition ${
                    activeDay === day.id
                      ? "bg-[#0f1e3d] text-white"
                      : "bg-white border border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="text-sm font-semibold">Day {i + 1}</div>
                  <div className="text-[11px] opacity-80">
                    {formatShortDate(day.event_date)}
                  </div>
                </button>
              ))}
            </div>

            {current && current.sessions.length > 0 ? (
              <div className="space-y-3">
                {current.sessions.map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
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

function SessionRow({ session }: { session: Session }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
      <div className="text-xs text-slate-400 w-14 flex-shrink-0 pt-0.5">
        {formatTime(session.start_time)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{session.title}</p>
        {session.description && (
          <p className="text-xs text-slate-500 mt-0.5">{session.description}</p>
        )}
        {session.location && (
          <p className="text-[11px] text-slate-400 mt-1">📍 {session.location}</p>
        )}
      </div>
    </div>
  );
}

function SidebarLink({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm font-medium ${
        active ? "bg-[#0f1e3d] text-white" : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}

function formatShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}