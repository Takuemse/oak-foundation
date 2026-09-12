"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ScanLine, Users, RefreshCw, Search } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

type Summary = {
  event_date: string;
  total_registered: number;
  checked_in: number;
  pending: number;
};

type Participant = {
  attendee_id: string;
  first_name: string;
  last_name: string;
  organization_name: string | null;
  role: string | null;
  registered_at: string;
  checked_in: boolean;
  checked_in_at: string | null;
};

const ROLE_ORDER = ["Partner", "OAK Staff", "Coordination Team", "Presenter", "Observer"];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function AttendancePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Checked In" | "Pending">("All");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/attendance");
        const data = await res.json();
        if (!data.success) {
          setError(data.message ?? "Unable to load attendance.");
          return;
        }
        setSummary(data.summary);
        setParticipants(data.participants ?? []);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshKey]);

  const roleBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const role of ROLE_ORDER) counts[role] = 0;
    for (const p of participants) {
      if (p.role && counts[p.role] !== undefined) counts[p.role] += 1;
    }
    return counts;
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    const term = search.trim().toLowerCase();
    return participants.filter((p) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      const org = (p.organization_name ?? "").toLowerCase();
      const matchesSearch = !term || fullName.includes(term) || org.includes(term);
      const matchesRole = roleFilter === "All" || p.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Checked In" && p.checked_in) ||
        (statusFilter === "Pending" && !p.checked_in);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [participants, search, roleFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="flex flex-col items-start px-[32px] py-[40px] w-[672px] max-w-[672px]">
          {/* Header */}
          <div className="flex flex-col items-start w-[608px] mb-[24px]">
            <h1 className="font-['Chillax'] font-bold text-[24px] leading-[32px] tracking-[0px] text-[#0E1726]">
              Attendance
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] tracking-[0px] text-[#6B7590] mt-[2px]">
              Check-in tracking · 9–11 November 2026
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 w-[608px]">
              {error}
            </div>
          )}

          {/* Summary Card */}
          <div className="box-border flex flex-col items-center p-[40px] gap-[16px] w-[608px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex-none">
            {loading ? (
              <p className="font-['Inter'] font-normal text-[14px] leading-[20px] tracking-[0px] text-[#6B7590] py-[40px]">
                Loading…
              </p>
            ) : summary && summary.checked_in > 0 ? (
              <div className="w-full py-[8px]">
                <p className="font-['Inter'] font-medium text-[14px] leading-[20px] tracking-[0px] text-[#0E1726] mb-[12px]">
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
                  <h2 className="font-['Chillax'] font-bold text-[18px] leading-[28px] tracking-[0px] text-[#0E1726] text-center">
                    No check-ins yet
                  </h2>
                  <p className="font-['Inter'] font-normal text-[14px] leading-[22.75px] tracking-[0px] text-[#6B7590] text-center mt-[4px]">
                    Attendees will appear here once they have been scanned in at the event entrance.
                  </p>
                </div>
              </>
            )}

            <div className="pt-[8px]">
              <Link
                href="/admin/check-in"
                className="flex flex-row items-center justify-center gap-[8px] px-[24px] py-[14px] w-[262px] h-[52px] bg-gradient-to-br from-[#1C2E5A] to-[#2D4A82] shadow-[0px_4px_20px_rgba(28,46,90,0.3)] rounded-[16px] text-[#FFFFFF] font-['Chillax'] font-semibold text-[16px] leading-[24px] tracking-[0px] text-center hover:opacity-95 transition"
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
                  <span className="font-['Inter'] font-semibold text-[24px] leading-[32px] tracking-[1px] text-[#0E1726] text-center">
                    {summary.total_registered}
                  </span>
                  <span className="font-['Inter'] font-normal text-[10px] leading-[15px] tracking-[0px] text-[#6B7590] text-center mt-[2px]">
                    Expected
                  </span>
                </div>
                <div className="bg-[#EEF1F5] rounded-[16px] p-[12px] flex flex-col items-center justify-center h-[73px]">
                  <span className="font-['Inter'] font-semibold text-[24px] leading-[32px] tracking-[1px] text-[#1C2E5A] text-center">
                    {summary.checked_in}
                  </span>
                  <span className="font-['Inter'] font-normal text-[10px] leading-[15px] tracking-[0px] text-[#6B7590] text-center mt-[2px]">
                    Checked In
                  </span>
                </div>
                <div className="bg-[#EEF1F5] rounded-[16px] p-[12px] flex flex-col items-center justify-center h-[73px]">
                  <span className="font-['Inter'] font-semibold text-[24px] leading-[32px] tracking-[1px] text-[#6B7590] text-center">
                    {summary.pending}
                  </span>
                  <span className="font-['Inter'] font-normal text-[10px] leading-[15px] tracking-[0px] text-[#6B7590] text-center mt-[2px]">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Role Breakdown */}
          {!loading && participants.length > 0 && (
            <div className="box-border flex flex-col items-start p-[20px] w-[608px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] mt-[16px]">
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] mb-[12px]">
                Role Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-[10px] w-full">
                {ROLE_ORDER.map((role) => (
                  <div
                    key={role}
                    className="bg-[#EEF1F5] rounded-[16px] p-[10px] flex flex-col items-center justify-center h-[66px]"
                  >
                    <span className="font-['Inter'] font-semibold text-[18px] leading-[24px] text-[#0E1726]">
                      {roleBreakdown[role]}
                    </span>
                    <span className="font-['Inter'] font-normal text-[10px] leading-[13px] text-[#6B7590] text-center mt-[2px]">
                      {role === "OAK Staff" ? "OAK Staff" : `${role}s`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filters */}
          {!loading && participants.length > 0 && (
            <div className="w-[608px] flex flex-col sm:flex-row gap-[10px] mt-[16px]">
              <div className="flex-1 h-[48px] bg-white border border-[rgba(28,46,90,0.1)] rounded-[14px] px-[14px] flex items-center gap-2">
                <Search size={15} className="text-[#A0AEC0] shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or organisation…"
                  className="w-full bg-transparent font-['Inter'] text-[13px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none border-0"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-[48px] bg-white border border-[rgba(28,46,90,0.1)] rounded-[14px] px-[14px] font-['Inter'] text-[13px] text-[#0E1726] focus:outline-none"
              >
                <option value="All">All Roles</option>
                {ROLE_ORDER.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-[48px] bg-white border border-[rgba(28,46,90,0.1)] rounded-[14px] px-[14px] font-['Inter'] text-[13px] text-[#0E1726] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Checked In">Checked In</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          )}

          {/* Participant List */}
          {!loading && participants.length > 0 && (
            <div className="w-[608px] flex flex-col gap-[8px] mt-[16px]">
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                Participants ({filteredParticipants.length})
              </span>

              {filteredParticipants.length === 0 ? (
                <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] rounded-[16px] py-[24px] text-center font-['Inter'] text-[13px] text-[#6B7590]">
                  No participants match your search.
                </div>
              ) : (
                filteredParticipants.map((p) => (
                  <div
                    key={p.attendee_id}
                    className="w-full bg-white border border-[rgba(28,46,90,0.1)] rounded-[16px] p-[14px] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter'] font-semibold text-[13px] text-[#0E1726] truncate">
                          {p.first_name} {p.last_name}
                        </span>
                        {p.role && (
                          <span className="shrink-0 px-[8px] py-[1px] bg-[#EEF1F5] rounded-[8px] font-['Inter'] font-medium text-[10px] text-[#6B7590]">
                            {p.role}
                          </span>
                        )}
                      </div>
                      <div className="font-['Inter'] text-[11px] text-[#A0AEC0] truncate mt-[2px]">
                        {p.organization_name ?? "No organisation"} · Registered {formatDate(p.registered_at)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {p.checked_in ? (
                        <>
                          <span className="inline-block px-[8px] py-[2px] bg-[#ECFDF5] text-[#065F46] rounded-full font-['Inter'] font-semibold text-[10px]">
                            Checked In
                          </span>
                          {p.checked_in_at && (
                            <div className="font-['Inter'] text-[10px] text-[#A0AEC0] mt-[3px]">
                              {formatTime(p.checked_in_at)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="inline-block px-[8px] py-[2px] bg-[#EEF1F5] text-[#6B7590] rounded-full font-['Inter'] font-semibold text-[10px]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
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