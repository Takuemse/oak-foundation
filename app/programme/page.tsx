"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, MapPin, X, StickyNote, ChevronRight, NotebookPen, Images, ListChecks, FileText, Download, Plus, ImageIcon } from "lucide-react";
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

const CATEGORY_STYLES: Record<
  SessionCategory,
  { dot: string; badge: string; badgeBorder: string; badgeText: string; label: string }
> = {
  plenary: { dot: "bg-[#1C2E5A]", badge: "bg-[#EEF1F9]", badgeBorder: "border-[#C5CFDF]", badgeText: "text-[#1C2E5A]", label: "Plenary" },
  breakout: { dot: "bg-[#F59E0B]", badge: "bg-[#FEF3C7]", badgeBorder: "border-[#FDE68A]", badgeText: "text-[#92400E]", label: "Breakout" },
  workshop: { dot: "bg-[#8B5CF6]", badge: "bg-[#FAF5FF]", badgeBorder: "border-[#DDD6FE]", badgeText: "text-[#7C3AED]", label: "Workshop" },
  social: { dot: "bg-[#F97316]", badge: "bg-[#FFF7ED]", badgeBorder: "border-[#FED7AA]", badgeText: "text-[#C2410C]", label: "Social" },
  break: { dot: "bg-[#A8BBCE]", badge: "bg-[#EEF1F5]", badgeBorder: "border-transparent", badgeText: "text-[#6B7590]", label: "Break" },
};

const NOTE_PREFIX = "oak_note:";

type SessionNoteEntry = {
  id: string;
  initials: string;
  name: string;
  org: string;
  meta: string;
  text: string;
};

const SEED_SESSION_NOTES: SessionNoteEntry[] = [
  {
    id: "n1",
    initials: "MS",
    name: "Maria Schmidt",
    org: "Open Society Foundations",
    meta: "Day 1 · 14:32",
    text: "The rights-based approaches session surfaced strong demand for a shared learning platform. OSF will follow up with MENA Rights Group on joint programming opportunities in the Mediterranean region.",
  },
  {
    id: "n2",
    initials: "JO",
    name: "James Odhiambo",
    org: "OAK Foundation",
    meta: "Day 1 · 16:50",
    text: "Digital Rights breakout: participants want a working group to share tools for operating in restricted digital environments. Interested orgs: Digital Frontiers, Access Now, EFF.",
  },
  {
    id: "n3",
    initials: "AD",
    name: "Awa Diallo",
    org: "Geneva Secretariat",
    meta: "Day 2 · 11:15",
    text: "Strategic communications workshop highly rated. Rashida's adaptive messaging framework is directly applicable across 60% of the portfolio. Requesting follow-up toolkit.",
  },
  {
    id: "n4",
    initials: "PAD",
    name: "Prof. Amara Diallo",
    org: "Sciences Po Paris",
    meta: "Day 2 · 16:00",
    text: "Fishbowl revealed consensus: philanthropy needs to accept longer time horizons (10+ years) and better share learning. Key ask: OAK to publish failure cases alongside success stories.",
  },
];

const GALLERY_PHOTOS = [
  "Opening Plenary Session",
  "Roundtable Discussion",
  "Workshop In Progress",
  "Welcome Reception Dinner",
  "Keynote Speaker",
  "Breakout Group Discussion",
];

const KEY_TAKEAWAYS = [
  "Philanthropy needs to accept 10+ year time horizons for systemic change",
  "Shared learning infrastructure is the most requested resource across the portfolio",
  "Digital rights must be integrated into all programme areas, not siloed",
  "Rights-based framing significantly improves grantee advocacy effectiveness",
  "Peer exchange is rated more valuable than expert-led sessions (92% vs 74%)",
];

const RESOURCES = [
  { title: "Opening Plenary Presentation", meta: "PDF · 3.2 MB · Day 1" },
  { title: "OAK Portfolio Overview 2024–26", meta: "PDF · 1.8 MB · Day 2" },
  { title: "Action Planning Workbook", meta: "DOCX · 0.9 MB · Day 3" },
  { title: "Partner Contact Directory", meta: "XLSX · 0.4 MB · All Days" },
  { title: "Photo Gallery (High Res)", meta: "ZIP · 184 MB · All Days" },
];

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  const [activeTab, setActiveTab] = useState<"schedule" | "docs">("schedule");

  const [sessionNotes, setSessionNotes] = useState<SessionNoteEntry[]>(SEED_SESSION_NOTES);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");
  const [newNoteOrg, setNewNoteOrg] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  function submitNewNote() {
    if (!newNoteName.trim() || !newNoteText.trim()) return;
    const entry: SessionNoteEntry = {
      id: `local-${Date.now()}`,
      initials: initialsFrom(newNoteName),
      name: newNoteName.trim(),
      org: newNoteOrg.trim() || "OAK Partner Convening",
      meta: `Day ${activeDay?.title.replace(/\D/g, "") || "1"} · ${new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      text: newNoteText.trim(),
    };
    setSessionNotes((prev) => [entry, ...prev]);
    setNewNoteName("");
    setNewNoteOrg("");
    setNewNoteText("");
    setShowAddNote(false);
  }

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
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-6 pb-10 md:px-8 md:py-10 flex flex-col items-start gap-[20px]">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Programme
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              OAK Partner Convening 2026
            </p>
          </div>

          <div className="w-full h-[40px] bg-[#E5E8EE] p-[4px] rounded-[16px] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`w-[140px] h-[32px] rounded-[12px] flex items-center justify-center font-['Inter'] font-semibold text-[12px] leading-[16px] capitalize transition ${
                activeTab === "schedule"
                  ? "bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.08)] text-[#0E1726]"
                  : "text-[#6B7590] hover:text-[#0E1726]"
              }`}
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("docs")}
              className={`w-[116px] h-[32px] rounded-[12px] flex items-center justify-center font-['Inter'] font-semibold text-[12px] leading-[16px] capitalize transition ${
                activeTab === "docs"
                  ? "bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.08)] text-[#0E1726]"
                  : "text-[#6B7590] hover:text-[#0E1726]"
              }`}
            >
              Docs
            </button>
          </div>

          {activeTab === "schedule" && (
            <>
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-[16px] px-[16px] py-[12px]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="w-full py-[40px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
              Loading programme…
            </div>
          ) : !activeDay ? (
            <div className="w-full py-[40px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
              No programme has been published yet.
            </div>
          ) : (
            <div className="w-full flex flex-col items-start gap-[16px]">
              <div className="w-full flex items-center gap-[10px]">
                {days.map((day) => {
                  const { weekday, dayMonth } = dayTabLabel(day.event_date);
                  const active = day.id === activeDay.id;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setActiveDayId(day.id)}
                      className={`flex-1 rounded-[24px] p-[14px] text-left transition ${
                        active
                          ? "bg-[#162E55] text-white shadow-[0px_4px_10px_rgba(28,46,90,0.3)]"
                          : "bg-white border border-[rgba(28,46,90,0.1)] text-[#0E1726] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] hover:border-[rgba(28,46,90,0.25)]"
                      }`}
                    >
                      <div
                        className={`font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase ${
                          active ? "text-white/60" : "text-[#6B7590]"
                        }`}
                      >
                        {weekday}
                      </div>
                      <div className="font-chillax font-bold text-[18px] leading-[18px] pt-[2px]">
                        {day.title}
                      </div>
                      <div
                        className={`font-['Inter'] text-[12px] leading-[16px] pt-[4px] ${
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
                  className="w-full text-left rounded-[24px] p-5 text-white flex flex-col relative overflow-hidden shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] hover:opacity-95 transition"
                  style={{ backgroundImage: "linear-gradient(165deg, #0E1726 0%, #1A2A4A 100%)" }}
                >
                  <div
                    className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(168,187,206,0.18) 0%, rgba(168,187,206,0) 70%)",
                    }}
                  />
                  <div className="relative z-10 flex flex-col">
                    <div className="flex items-center gap-[8px] font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px]">
                      <Star className="w-[11px] h-[11px] fill-current text-[#A8BBCE]" />
                      <span className="text-[#A8BBCE] uppercase">Featured</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/40 normal-case tracking-normal">
                        {formatTime(featuredSession.start_time)}–{formatTime(featuredSession.end_time)}
                      </span>
                    </div>
                    <div className="font-chillax font-bold text-[20px] leading-[27.5px] pt-[12px]">
                      {featuredSession.title}
                    </div>
                    {featuredSession.presenter_name && (
                      <div className="flex items-center gap-[6px] pt-[12px]">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <span className="font-['Inter'] font-bold text-[9px] text-white">
                            {featuredSession.presenter_name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-['Inter'] text-[14px] leading-[20px] text-[rgba(168,187,206,0.7)]">
                          {featuredSession.presenter_name}
                          {featuredSession.presenter_org ? ` · ${featuredSession.presenter_org}` : ""}
                        </span>
                      </div>
                    )}
                    {featuredSession.location && (
                      <div className="flex items-center gap-[4px] pt-[12px]">
                        <MapPin className="w-[11px] h-[11px] text-[rgba(168,187,206,0.45)]" />
                        <span className="font-['Inter'] text-[12px] leading-[16px] text-[rgba(168,187,206,0.45)]">
                          {featuredSession.location}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              )}

              <div className="flex items-center gap-[12px] flex-wrap">
                {(Object.keys(CATEGORY_STYLES) as SessionCategory[])
                  .filter((cat) => cat !== "break")
                  .map((cat) => (
                    <div key={cat} className="flex items-center gap-[6px]">
                      <span className={`w-[8px] h-[8px] rounded-full ${CATEGORY_STYLES[cat].dot}`} />
                      <span className="font-['Inter'] text-[11px] leading-[16.5px] text-[#6B7590] capitalize">
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
                        className="w-full flex items-center gap-3 py-1.5 text-[#A0AEC0]"
                      >
                        <span className="font-['Consolas',monospace] text-[12px] leading-[16px] w-[40px] shrink-0">
                          {formatTime(session.start_time)}
                        </span>
                        <span className="flex-1 h-px bg-[rgba(28,46,90,0.1)]" />
                        <span className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590]">
                          {session.title}
                        </span>
                        <span className="flex-1 h-px bg-[rgba(28,46,90,0.1)]" />
                      </div>
                    );
                  }
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => openSession(session)}
                      className="w-full text-left bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] p-4 flex gap-3 hover:border-[rgba(28,46,90,0.25)] transition"
                    >
                      <div className="w-[56px] shrink-0 pt-0.5">
                        <div className="font-['Consolas',monospace] font-bold text-[12px] leading-[16px] text-[#0E1726] text-right">
                          {formatTime(session.start_time)}
                        </div>
                        <div className="font-['Inter'] text-[10px] leading-[15px] text-[#6B7590] text-right">
                          –{formatTime(session.end_time)}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-['Inter'] font-semibold text-[14px] leading-[19.25px] text-[#0E1726] truncate">
                            {session.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {notedSessionIds.has(session.id) && (
                              <StickyNote className="w-[13px] h-[13px] text-[#E8A33D]" />
                            )}
                            <span
                              className={`flex items-center gap-1 px-[10px] py-[4px] rounded-full border font-['Inter'] font-semibold text-[11px] leading-[16.5px] tracking-[0.22px] ${style.badge} ${style.badgeBorder} ${style.badgeText}`}
                            >
                              <span className={`w-[6px] h-[6px] rounded-full ${style.dot}`} />
                              {style.label}
                            </span>
                          </div>
                        </div>
                        {(session.presenter_name || session.location) && (
                          <span className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590] truncate pt-1.5">
                            {session.presenter_name}
                            {session.presenter_org ? ` · ${session.presenter_org}` : ""}
                          </span>
                        )}
                        {session.location && (
                          <span className="flex items-center gap-1 font-['Inter'] text-[12px] leading-[16px] text-[#6B7590] pt-1">
                            <MapPin className="w-[10px] h-[10px]" />
                            {session.location}
                          </span>
                        )}
                      </div>
                      <div className="pt-0.5 shrink-0">
                        <ChevronRight className="w-[14px] h-[14px] text-[#A8BBCE]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
            </>
          )}

          {activeTab === "docs" && (
            <div className="w-full flex flex-col items-start gap-[24px] pb-[24px]">
              {/* Session Notes */}
              <div className="w-full flex flex-col items-start">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <NotebookPen className="w-[17px] h-[17px] text-[#0E1726]" />
                    <span className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                      Session Notes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddNote((v) => !v)}
                    className="flex items-center gap-1 bg-[#162E55] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] px-[14px] py-[8px] rounded-[12px] font-chillax font-semibold text-[12px] leading-[16px] text-white hover:opacity-95 transition"
                  >
                    <Plus className="w-[12px] h-[12px]" />
                    Add Note
                  </button>
                </div>

                {showAddNote && (
                  <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] rounded-[24px] p-4 mt-3 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={newNoteName}
                        onChange={(e) => setNewNoteName(e.target.value)}
                        placeholder="Your name"
                        className="h-[40px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[13px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                      />
                      <input
                        value={newNoteOrg}
                        onChange={(e) => setNewNoteOrg(e.target.value)}
                        placeholder="Organization"
                        className="h-[40px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[13px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                      />
                    </div>
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Jot down a takeaway, follow-up, or connection to make…"
                      rows={3}
                      className="w-full rounded-[12px] bg-[#EEF1F5] px-3 py-2.5 font-['Inter'] text-[13px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 resize-none border-0"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddNote(false)}
                        className="px-3 py-1.5 font-['Inter'] text-[12px] font-semibold text-[#6B7590] hover:text-[#0E1726] transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitNewNote}
                        className="px-4 py-1.5 bg-[#162E55] text-white rounded-[10px] font-['Inter'] font-semibold text-[12px] hover:bg-[#0f213f] transition"
                      >
                        Post Note
                      </button>
                    </div>
                  </div>
                )}

                <div className="w-full flex flex-col items-start pt-3 gap-3">
                  {sessionNotes.map((note) => (
                    <div
                      key={note.id}
                      className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col"
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-[10px]">
                          <div className="bg-[#162E55] rounded-[12px] w-7 h-7 flex items-center justify-center shrink-0">
                            <span className="font-['Inter'] font-bold text-[10px] text-white">
                              {note.initials}
                            </span>
                          </div>
                          <div>
                            <p className="font-['Inter'] font-semibold text-[12px] leading-[16px] text-[#0E1726]">
                              {note.name}
                            </p>
                            <p className="font-['Inter'] text-[10px] leading-[15px] text-[#6B7590]">
                              {note.org}
                            </p>
                          </div>
                        </div>
                        <span className="bg-[#EEF1F5] text-[#6B7590] px-2 py-1 rounded-[8px] font-['Inter'] text-[10px] leading-[15px] shrink-0">
                          {note.meta}
                        </span>
                      </div>
                      <p className="font-['Inter'] text-[14px] leading-[22.75px] text-[#0E1726] pt-2.5">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="w-full flex flex-col items-start pt-[8px]">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <Images className="w-[17px] h-[17px] text-[#0E1726]" />
                    <span className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                      Photo Gallery
                    </span>
                  </div>
                  <span className="bg-[#EEF1F5] text-[#6B7590] px-2.5 py-1 rounded-[8px] font-['Inter'] text-[12px] leading-[16px]">
                    {GALLERY_PHOTOS.length} photos
                  </span>
                </div>
                <div className="w-full grid grid-cols-2 gap-[10px] pt-3">
                  {GALLERY_PHOTOS.map((caption) => (
                    <div
                      key={caption}
                      className="bg-[#E5E8EE] rounded-[16px] aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden"
                    >
                      <ImageIcon className="w-6 h-6 text-[#A8BBCE]" />
                      <span className="font-['Inter'] text-[11px] text-[#6B7590] px-3 text-center">
                        {caption}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="w-full flex flex-col items-start pt-[8px]">
                <div className="flex items-center gap-[8px]">
                  <ListChecks className="w-[17px] h-[17px] text-[#0E1726]" />
                  <span className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Key Takeaways
                  </span>
                </div>
                <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-5 flex flex-col mt-3">
                  {KEY_TAKEAWAYS.map((point, i) => (
                    <div
                      key={point}
                      className={`flex gap-3 items-start w-full ${i > 0 ? "pt-3.5" : ""}`}
                    >
                      <div className="bg-[#162E55] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="font-['Inter'] font-bold text-[9px] text-white">{i + 1}</span>
                      </div>
                      <p className="font-['Inter'] text-[14px] leading-[22.75px] text-[#0E1726]">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="w-full flex flex-col items-start pt-[8px]">
                <div className="flex items-center gap-[8px]">
                  <FileText className="w-[17px] h-[17px] text-[#0E1726]" />
                  <span className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Resources
                  </span>
                </div>
                <div className="w-full flex flex-col gap-2 pt-3">
                  {RESOURCES.map((res) => (
                    <button
                      key={res.title}
                      type="button"
                      className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex items-center gap-[14px] hover:border-[rgba(28,46,90,0.25)] transition"
                    >
                      <div className="bg-[#EEF1F5] rounded-[16px] w-10 h-10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#6B7590]" />
                      </div>
                      <div className="flex-1 flex flex-col items-start min-w-0 text-left">
                        <span className="font-['Inter'] font-medium text-[14px] leading-[20px] text-[#0E1726] truncate w-full">
                          {res.title}
                        </span>
                        <span className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590]">
                          {res.meta}
                        </span>
                      </div>
                      <Download className="w-[15px] h-[15px] text-[#6B7590] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="w-full mt-[8px]">
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
                    className={`self-start flex items-center gap-1 px-[10px] py-[4px] rounded-full border font-['Inter'] font-semibold text-[11px] leading-[16.5px] tracking-[0.22px] ${
                      CATEGORY_STYLES[selectedSession.category].badge
                    } ${CATEGORY_STYLES[selectedSession.category].badgeBorder} ${
                      CATEGORY_STYLES[selectedSession.category].badgeText
                    }`}
                  >
                    <span className={`w-[6px] h-[6px] rounded-full ${CATEGORY_STYLES[selectedSession.category].dot}`} />
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