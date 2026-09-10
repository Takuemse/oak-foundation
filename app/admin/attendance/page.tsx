"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanLine, Users, RefreshCw } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

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
      <AppSidebar />

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
            <div className="text-left py-2">
              <p className="text-sm font-medium text-slate-700 mb-2">
                {summary.checked_in} of {summary.total_registered} attendees
                checked in
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <Users size={26} strokeWidth={1.75} />
              </div>
              <p className="text-base font-semibold text-slate-800">
                No check-ins yet
              </p>
              <p className="text-sm text-slate-400 mt-1 mb-5 max-w-xs mx-auto">
                Attendees will appear here once they have been scanned in at
                the event entrance.
              </p>
            </>
          )}

          <Link
            href="/admin/check-in"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#0f1e3d] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#16295c] transition"
          >
            <ScanLine size={16} />
            Go to Check-In Scanner
          </Link>
        </div>

        {summary && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Event Overview
            </p>
            <div className="grid grid-cols-3 gap-2">
              <StatCard value={summary.total_registered} label="Expected" />
              <StatCard value={summary.checked_in} label="Checked In" />
              <StatCard value={summary.pending} label="Pending" />
            </div>
          </div>
        )}

        <button
          onClick={loadSummary}
          className="flex items-center justify-center gap-1.5 w-full mt-4 border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-medium hover:bg-white transition"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </main>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-slate-50 rounded-lg py-4 text-center">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400 mt-1">{label}</div>
    </div>
  );
}