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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadSummary() {
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
    loadSummary();
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="flex flex-col items-start px-[32px] py-[40px] w-[672px] max-w-[672px]">
          
          {/* Header */}
          <div className="flex flex-col items-start w-[608px] h-[54px] flex-none mb-[24px]">
            <h1 className="font-['Chillax'] font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Attendance
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              Check-in tracking · 9–11 March 2026
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 w-[608px]">
              {error}
            </div>
          )}

          {/* Main Card */}
          <div className="box-border flex flex-col items-center p-[40px] gap-[16px] w-[608px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex-none">
            {loading ? (
              <p className="font-['Inter'] text-[14px] text-[#6B7590] py-[40px]">Loading…</p>
            ) : summary && summary.checked_in > 0 ? (
              <div className="w-full py-[8px]">
                <p className="font-['Inter'] text-[14px] font-medium text-[#0E1726] mb-[12px]">
                  {summary.checked_in} of {summary.total_registered} attendees checked in
                </p>
                <div className="w-full bg-[#EEF1F5] rounded-full h-[8px] mb-[24px]">
                  <div
                    className="bg-[#1C2E5A] h-[8px] rounded-full transition-all"
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
                <div className="flex flex-row justify-center items-center w-[80px] h-[80px] bg-[#EEF1F5] rounded-[24px]">
                  <Users size={36} strokeWidth={1.75} className="text-[#A8BBCE]" />
                </div>
                <div className="flex flex-col items-center w-[320px]">
                  <h2 className="font-['Chillax'] font-bold text-[18px] leading-[28px] text-[#0E1726] text-center">
                    No check-ins yet
                  </h2>
                  <p className="font-['Inter'] font-normal text-[14px] leading-[23px] text-[#6B7590] text-center mt-[4px]">
                    Attendees will appear here once they have been scanned in at the event entrance.
                  </p>
                </div>
              </>
            )}

            <div className="pt-[8px]">
              <Link
                href="/admin/check-in"
                className="flex flex-row items-center justify-center gap-[8px] px-[24px] py-[14px] w-[262px] h-[52px] bg-gradient-to-br from-[#1C2E5A] to-[#2D4A82] shadow-[0px_4px_20px_rgba(28,46,90,0.3)] rounded-[16px] text-[#FFFFFF] font-['Chillax'] font-semibold text-[16px] leading-[24px] hover:opacity-95 transition"
              >
                <ScanLine size={16} />
                Go to Check-In Scanner
              </Link>
            </div>
          </div>

          {/* Event Overview Card */}
          {summary && (
            <div className="box-border flex flex-col items-start p-[20px] w-[608px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] mt-[16px]">
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] mb-[12px]">
                Event Overview
              </span>
              <div className="grid grid-cols-3 gap-[12px] w-full">
                <div className="bg-[#EEF1F5] rounded-[16px] p-[12px] flex flex-col items-center justify-center h-[73px]">
                  <span className="font-['Chillax'] font-bold text-[24px] leading-[32px] text-[#0E1726] text-center">
                    {summary.total_registered}
                  </span>
                  <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590] text-center mt-[2px]">
                    Expected
                  </span>
                </div>
                <div className="bg-[#EEF1F5] rounded-[16px] p-[12px] flex flex-col items-center justify-center h-[73px]">
                  <span className="font-['Chillax'] font-bold text-[24px] leading-[32px] text-[#1C2E5A] text-center">
                    {summary.checked_in}
                  </span>
                  <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590] text-center mt-[2px]">
                    Checked In
                  </span>
                </div>
                <div className="bg-[#EEF1F5] rounded-[16px] p-[12px] flex flex-col items-center justify-center h-[73px]">
                  <span className="font-['Chillax'] font-bold text-[24px] leading-[32px] text-[#6B7590] text-center">
                    {summary.pending}
                  </span>
                  <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590] text-center mt-[2px]">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setRefreshKey((k) => k + 1);
            }}
            className="flex items-center justify-center gap-1.5 w-[608px] mt-[16px] border border-slate-200 text-slate-500 rounded-xl py-2 text-xs font-medium hover:bg-white transition"
          >
            <RefreshCw size={13} />
            Refresh
          </button>

        </main>
      </div>
    </div>
  );
}