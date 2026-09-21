"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, FileText, Globe, Download, ShieldAlert, ArrowRight, Users } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";

type Tier = "admin" | "super_admin" | null;

export default function AdminDashboardPage() {
  const [tier, setTier] = useState<Tier>(null);
  const [checking, setChecking] = useState(true);
  const [summary, setSummary] = useState<{
    total_registered?: number;
    checked_in?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setTier(data.success ? data.tier : null))
      .finally(() => setChecking(false));

    fetch("/api/attendance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSummary(data.summary ?? null);
      })
      .catch(() => {});
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-['Inter'] text-[14px] text-[#6B7590]">Loading...</p>
        </div>
      </div>
    );
  }

  if (tier !== "super_admin") {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-14 h-14 rounded-[16px] bg-[#EEF1F5] flex items-center justify-center text-[#6B7590]">
            <ShieldAlert size={24} strokeWidth={1.75} />
          </div>
          <p className="font-['Inter'] font-semibold text-[16px] text-[#0E1726]">
            Lead Organizer access required
          </p>
          <p className="font-['Inter'] text-[14px] text-[#6B7590] max-w-[340px]">
            This dashboard is restricted to Lead Organizers. As a Coordination
            Team member, use Check In and Attendance from the sidebar.
          </p>
          <Link
            href="/admin/attendance"
            className="px-5 py-3 bg-[#162E55] text-white rounded-[16px] font-['Inter'] font-semibold text-[14px] hover:bg-[#1c3a6b] transition"
          >
            Go to Attendance
          </Link>
        </div>
      </div>
    );
  }

  const cards = [
    {
      icon: BarChart3,
      title: "Attendance Analytics",
      description: "Live headcount, role breakdown, and the full participant list.",
      href: "/admin/attendance",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Publish daily notes and curated photos for the programme.",
      href: "/admin/documentation",
    },
    {
      icon: Globe,
      title: "Partner Directory",
      description: "Manage partner organizations, logos, and sub-partners.",
      href: "/admin/partners",
    },
    {
      icon: Download,
      title: "Sensitive Data Export",
      description:
        "Dietary, accessibility, and travel details for logistics — visible only here.",
      href: "/admin/dashboard/export",
    },
    {
      icon: Users,
      title: "Admin Accounts",
      description: "Create Coordination Team and Lead Organizer sign-ins.",
      href: "/admin/accounts",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AdminSidebar />

      <div className="flex-1 flex justify-center">
        {/* pt-8/pb-[104px] on mobile: breathing room below the fixed
            header and enough clearance above the new fixed bottom nav so
            the last card is never covered by it. Desktop unaffected. */}
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-8 pb-[104px] md:px-8 md:py-10 flex flex-col items-start gap-[20px]">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Lead Organizer Dashboard
            </h1>
            <p className="font-['Inter'] text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              OAK Partner Convening 2026
            </p>
          </div>

          {summary && (
            <div className="w-full grid grid-cols-2 gap-[10px]">
              <div className="bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col">
                <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                  Registered
                </span>
                <span className="font-chillax font-bold text-[24px] leading-[30px] text-[#0E1726] mt-1">
                  {summary.total_registered ?? "—"}
                </span>
              </div>
              <div className="bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col">
                <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                  Checked In Today
                </span>
                <span className="font-chillax font-bold text-[24px] leading-[30px] text-[#0E1726] mt-1">
                  {summary.checked_in ?? "—"}
                </span>
              </div>
            </div>
          )}

          <div className="w-full flex flex-col gap-[10px] pt-1">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex items-center gap-4 hover:border-[rgba(28,46,90,0.25)] transition group"
              >
                <div className="w-11 h-11 rounded-[14px] bg-[#EEF1F5] flex items-center justify-center shrink-0">
                  <card.icon className="w-[18px] h-[18px] text-[#162E55]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726]">
                    {card.title}
                  </p>
                  <p className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590] mt-0.5">
                    {card.description}
                  </p>
                </div>
                <ArrowRight className="w-[16px] h-[16px] text-[#A8BBCE] group-hover:text-[#6B7590] transition shrink-0" />
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}