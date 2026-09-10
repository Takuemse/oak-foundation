"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Summary = {
  event_date: string;
  total_registered: number;
  checked_in: number;
  pending: number;
};

export default function AttendancePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? "Unable to load attendance.");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

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
  <SidebarLink label="Check In" href="/admin/check-in" />
  <SidebarLink label="Attendance" href="/admin/attendance" />
  <SidebarLink label="Documentation" href="/admin/documentation" />
  <SidebarLink label="Partners" href="/admin/partners" />
</nav>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">
          Harare, Zimbabwe
          <br />
          9–11 November 2026
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-6">
          <h1 className="text-lg font-semibold">Attendance</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Check-in tracking · 9–11 March 2026
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center mb-4">
          {loading ? (
            <p className="text-sm text-slate-400 py-6">Loading…</p>
          ) : summary && summary.checked_in > 0 ? (
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700 mb-2">
                {summary.checked_in} of {summary.total_registered} attendees
                checked in
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                <div
                  className="bg-[#0f1e3d] h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      summary.total_registered > 0
                        ? (summary.checked_in / summary.total_registered) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                ⛬
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No check-ins yet
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Attendees will appear here once they have been scanned in at
                the event entrance.
              </p>
            </>
          )}

          <Link
            href="/admin/check-in"
            className="mt-4 inline-block w-full bg-[#0f1e3d] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#16295c] transition"
          >
            Go to Check-In Scanner
          </Link>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard value={summary.total_registered} label="Expected" />
            <StatCard value={summary.checked_in} label="Checked In" />
            <StatCard value={summary.pending} label="Pending" />
          </div>
        )}

        <button
          onClick={loadSummary}
          className="w-full mt-4 border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-medium hover:bg-white transition"
        >
          Refresh
        </button>
      </main>
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

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 py-3 text-center">
      <div className="text-lg font-semibold text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}