"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, MapPin, X, StickyNote, ChevronRight } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

type SessionCategory = "plenary" | "breakout" | "workshop" | "social" | "break";

type Session = {
  id: string;
  title: string;
  description: string | null;
  start_time: string; // "09:00:00"
  end_time: string;
  location: string | null;
  category: SessionCategory;
  presenter_name: string | null;
  presenter_org: string | null;
  is_featured: boolean;
};

type ProgrammeDay = {
  id: string;
  event_date: string; // "2026-11-09"
  title: string; // "Day 1"
  description: string | null;
  sessions: Session[];
};

const CATEGORY_STYLES: Record<SessionCategory, { dot: string; badge: string; label: string }> = {
  plenary: { dot: "bg-[#162E55]", badge: "bg-[#EEF1F5] text-[#162E55]", label: "Plenary" },
  breakout: { dot: "bg-[#E8A33D]", badge: "bg-[#FDF3E2] text-[#8A5D14]", label: "Breakout" },
  workshop: { dot: "bg-[#8B5CF6]", badge: "bg-[#F1EBFE] text-[#6027C9]", label: "Workshop" },
  social: { dot: "bg-[#E8622D]", badge: "bg-[#FDEAE2] text-[#B0410F]", label: "Social" },
  break: { dot: "bg-[#A8BBCE]", badge: "bg-[#EEF1F5] text-[#6B7590]", label: "Break" },
};

const NOTE_PREFIX = "oak_note:";

function formatTime(t: string) {
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}

function dayTabLabel(eventDate: string) {
  const d = new Date(`${eventDate}T00:00:00`);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
  const dayMonth = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { weekday, dayMonth };
}

export default function ProgrammePage() {
  const [days, setDays] = useState<ProgrammeDay[]>([]);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [notedSessionIds, setNotedSessionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/programme");
        const data = await res.json();

        if (!data.success || !Array.isArray(data.days)) {
          setError(data.message ?? "Unable to load the programme.");
          return;
        }

        setDays(data.days);
        setActiveDayId(data.days[0]?.id ?? null);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeDay = useMemo(
    () => days.find((d) => d.id === activeDayId) ?? days[0],
    [days, activeDayId]
  );

  const featuredSession = activeDay?.sessions.find((s) => s.is_featured);
  const sortedSessions = useMemo(
    () =>
      [...(activeDay?.sessions ?? [])].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      ),
    [activeDay]
  );

  function refreshNotedIds() {
    if (!activeDay) return;
    const found = new Set<string>();
    for (const s of activeDay.sessions) {
      const val = localStorage.getItem(`${NOTE_PREFIX}${s.id}`);
      if (val && val.trim()) found.add(s.id);
    }
    setNotedSessionIds(found);
  }

  useEffect(() => {
    refreshNotedIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay]);

  function openSession(session: Session) {
    setSelectedSession(session);
    setNoteDraft(localStorage.getItem(`${NOTE_PREFIX}${session.id}`) ?? "");
    setNoteSaved(false);
  }

  function closeSession() {
    setSelectedSession(null);
    setNoteDraft("");
    setNoteSaved(false);
  }

  function saveNote() {
    if (!selectedSession) return;
    const key = `${NOTE_PREFIX}${selectedSession.id}`;
    if (noteDraft.trim()) {
      localStorage.setItem(key, noteDraft);
    } else {
      localStorage.removeItem(key);
    }
    setNoteSaved(true);
    refreshNotedIds();
    setTimeout(() => setNoteSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-[672px] max-w-[672px] min-h-screen px-[32px] py-[40px] flex flex-col items-start gap-[20px]">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Programme
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              OAK Partner Convening 2026
            </p>
          </div>

          <div className="w-[608px] h-[40px] bg-[#E5E8EE] p-[4px] rounded-[16px] flex items-center justify-between">
            <button
              type="button"
              className="w-[140px] h-[32px] bg-white rounded-[12px] shadow-[0px_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center font-['Inter'] font-semibold text-[12px] leading-[16px] text-[#0E1726] capitalize"
            >
              Schedule
            </button>
            <Link
              href="/documentation"
              className="w-[116px] h-[32px] rounded-[12px] text-[#6B7590] hover:text-[#0E1726] capitalize transition flex items-center justify-center text-[12px] font-semibold font-['Inter']"
            >
              Docs
            </Link>
          </div>

          {error && (
            <div className="w-[608px] bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-[16px] px-[16px] py-[12px]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="w-[608px] py-[40px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
              Loading programme…
            </div>
          ) : !activeDay ? (
            <div className="w-[608px] py-[40px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
              No programme has been published yet.
            </div>
          ) : (
            <div className="w-[608px] flex flex-col items-start gap-[16px]">
              <div className="w-full flex items-center gap-[10px]">
                {days.map((day) => {
                  const { weekday, dayMonth } = dayTabLabel(day.event_date);
                  const active = day.id === activeDay.id;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setActiveDayId(day.id)}
                      className={`flex-1 rounded-[16px] px-[14px] py-[10px] text-left transition ${
                        active
                          ? "bg-[#162E55] text-white shadow-[0px_4px_20px_rgba(28,46,90,0.25)]"
                          : "bg-white border border-[rgba(28,46,90,0.1)] text-[#0E1726] hover:border-[rgba(28,46,90,0.25)]"
                      }`}
                    >
                      <div
                        className={`font-['Inter'] font-semibold text-[10px] leading-[14px] tracking-[0.5px] ${
                          active ? "text-white/60" : "text-[#6B7590]"
                        }`}
                      >
                        {weekday}
                      </div>
                      <div className="font-chillax font-bold text-[16px] leading-[22px]">
                        {day.title}
                      </div>
                      <div
                        className={`font-['Inter'] text-[11px] leading-[15px] ${
                          active ? "text-white/60" : "text-[#6B7590]"
                        }`}
                      >
                        {dayMonth}
                      </div>
                    </button>
                  );
                })}
              </div>

              {featuredSession && (
                <button
                  type="button"
                  onClick={() => openSession(featuredSession)}
                  className="w-full text-left bg-[#162E55] rounded-[24px] p-5 text-white flex flex-col gap-2 hover:opacity-95 transition"
                >
                  <div className="flex items-center gap-[6px] font-['Inter'] font-semibold text-[10px] leading-[14px] tracking-[0.5px] uppercase text-white/60">
                    <Star className="w-[12px] h-[12px] fill-current" />
                    Featured · {formatTime(featuredSession.start_time)}–{formatTime(featuredSession.end_time)}
                  </div>
                  <div className="font-chillax font-semibold text-[18px] leading-[24px]">
                    {featuredSession.title}
                  </div>
                  {(featuredSession.presenter_name || featuredSession.location) && (
                    <div className="font-['Inter'] text-[12px] leading-[18px] text-white/70">
                      {featuredSession.presenter_name}
                      {featuredSession.presenter_org ? ` · ${featuredSession.presenter_org}` : ""}
                      {featuredSession.location ? ` · ${featuredSession.location}` : ""}
                    </div>
                  )}
                </button>
              )}

              <div className="flex items-center gap-[14px] flex-wrap">
                {(Object.keys(CATEGORY_STYLES) as SessionCategory[]).map((cat) => (
                  <div key={cat} className="flex items-center gap-[6px]">
                    <span className={`w-[7px] h-[7px] rounded-full ${CATEGORY_STYLES[cat].dot}`} />
                    <span className="font-['Inter'] text-[11px] leading-[15px] text-[#6B7590] capitalize">
                      {CATEGORY_STYLES[cat].label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full flex flex-col gap-[10px]">
                {sortedSessions.map((session) => {
                  const style = CATEGORY_STYLES[session.category];
                  if (session.category === "break") {
                    return (
                      <div
                        key={session.id}
                        className="w-full flex items-center gap-3 py-1 text-[#A0AEC0]"
                      >
                        <span className="font-['Inter'] text-[11px] w-[42px] shrink-0">
                          {formatTime(session.start_time)}
                        </span>
                        <span className="flex-1 h-px bg-[rgba(28,46,90,0.08)]" />
                        <span className="font-['Inter'] text-[11px] uppercase tracking-[0.5px]">
                          {session.title}
                        </span>
                        <span className="flex-1 h-px bg-[rgba(28,46,90,0.08)]" />
                      </div>
                    );
                  }
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => openSession(session)}
                      className="w-full text-left bg-white rounded-[20px] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05)] p-4 flex gap-4 hover:border-[rgba(28,46,90,0.25)] transition"
                    >
                      <div className="w-[52px] shrink-0 font-['Inter'] text-[12px] leading-[16px] text-[#6B7590]">
                        <div className="font-semibold text-[#0E1726]">
                          {formatTime(session.start_time)}
                        </div>
                        <div>–{formatTime(session.end_time)}</div>
                      </div>
                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726] truncate">
                            {session.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {notedSessionIds.has(session.id) && (
                              <StickyNote className="w-[13px] h-[13px] text-[#E8A33D]" />
                            )}
                            <span
                              className={`px-[8px] py-[2px] rounded-[8px] font-['Inter'] font-medium text-[10px] leading-[14px] ${style.badge}`}
                            >
                              {style.label}
                            </span>
                          </div>
                        </div>
                        {(session.presenter_name || session.location) && (
                          <span className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590] truncate">
                            {session.presenter_name}
                            {session.presenter_org ? ` · ${session.presenter_org}` : ""}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-0.5">
                          {session.location ? (
                            <span className="flex items-center gap-1 font-['Inter'] text-[11px] leading-[15px] text-[#A0AEC0]">
                              <MapPin className="w-[11px] h-[11px]" />
                              {session.location}
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="flex items-center gap-0.5 font-['Inter'] text-[11px] text-[#A0AEC0]">
                            Details <ChevronRight className="w-[12px] h-[12px]" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="w-[608px] mt-[8px]">
            <Link
              href="/register"
              className="w-full h-[48px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05)] rounded-[16px] font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#6B7590] hover:text-[#0E1726] hover:bg-slate-50 transition flex items-center justify-center"
            >
              Back to Registration
            </Link>
          </div>
        </main>
      </div>

      {selectedSession && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={closeSession}
        >
          <div
            className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-white rounded-[24px] shadow-[0px_20px_60px_rgba(14,23,38,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span
                    className={`self-start px-[8px] py-[2px] rounded-[8px] font-['Inter'] font-medium text-[10px] leading-[14px] ${
                      CATEGORY_STYLES[selectedSession.category].badge
                    }`}
                  >
                    {CATEGORY_STYLES[selectedSession.category].label}
                  </span>
                  <h2 className="font-chillax font-bold text-[20px] leading-[26px] text-[#0E1726]">
                    {selectedSession.title}
                  </h2>
                  <span className="font-['Inter'] text-[13px] text-[#6B7590]">
                    {formatTime(selectedSession.start_time)}–{formatTime(selectedSession.end_time)}
                    {selectedSession.location ? ` · ${selectedSession.location}` : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeSession}
                  className="shrink-0 w-8 h-8 rounded-full bg-[#EEF1F5] flex items-center justify-center hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4 text-[#6B7590]" />
                </button>
              </div>

              {(selectedSession.presenter_name || selectedSession.presenter_org) && (
                <div className="bg-[#EEF1F5] rounded-[16px] p-3.5">
                  <span className="font-['Inter'] font-semibold text-[10px] leading-[14px] tracking-[0.5px] uppercase text-[#6B7590]">
                    Speaker
                  </span>
                  <div className="font-['Inter'] font-medium text-[14px] text-[#0E1726] mt-0.5">
                    {selectedSession.presenter_name}
                  </div>
                  {selectedSession.presenter_org && (
                    <div className="font-['Inter'] text-[12px] text-[#6B7590]">
                      {selectedSession.presenter_org}
                    </div>
                  )}
                </div>
              )}

              {selectedSession.description && (
                <div>
                  <span className="font-['Inter'] font-semibold text-[10px] leading-[14px] tracking-[0.5px] uppercase text-[#6B7590]">
                    About this session
                  </span>
                  <p className="font-['Inter'] text-[13px] leading-[20px] text-[#0E1726] mt-1.5">
                    {selectedSession.description}
                  </p>
                </div>
              )}

              <div className="border-t border-[rgba(28,46,90,0.1)] pt-4">
                <label className="font-['Inter'] font-semibold text-[10px] leading-[14px] tracking-[0.5px] uppercase text-[#6B7590]">
                  My Notes
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Jot down thoughts, questions, or follow-ups for this session…"
                  rows={4}
                  className="w-full mt-2 rounded-[14px] bg-[#EEF1F5] px-4 py-3 font-['Inter'] text-[13px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 resize-none border-0"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="font-['Inter'] text-[11px] text-[#A0AEC0]">
                    Only visible to you, saved on this device
                  </span>
                  <button
                    type="button"
                    onClick={saveNote}
                    className="px-4 py-2 bg-[#162E55] text-white rounded-[10px] font-['Inter'] font-semibold text-[12px] hover:bg-[#0f213f] transition"
                  >
                    {noteSaved ? "Saved ✓" : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}