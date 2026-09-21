"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ScanLine, BarChart3, Globe, FileText, LogOut, LayoutDashboard, Users } from "lucide-react";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

// Coordination Team (either tier gets these — day-of operational tools)
const OPERATIONAL_LINKS = [
  { icon: ScanLine, label: "Check In", href: "/admin/check-in" },
  { icon: BarChart3, label: "Attendance", href: "/admin/attendance" },
];

// Lead Organizer only — sensitive data, publishing, partner management
const LEAD_ORGANIZER_LINKS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Globe, label: "Partners", href: "/admin/partners" },
  { icon: FileText, label: "Documentation", href: "/admin/documentation" },
  { icon: Users, label: "Accounts", href: "/admin/accounts" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [tier, setTier] = useState<"admin" | "super_admin" | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setTier(data.tier);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const links =
    tier === "super_admin"
      ? [LEAD_ORGANIZER_LINKS[0], ...OPERATIONAL_LINKS, ...LEAD_ORGANIZER_LINKS.slice(1)]
      : OPERATIONAL_LINKS;

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="md:hidden w-full h-[82px] bg-[#162E55] flex flex-row justify-center items-center px-[16px] gap-[12px] shrink-0 z-30">
        <Image
          src="/Logo-Oak-Foundation.svg2.svg"
          alt="Oak Foundation Logo"
          width={85}
          height={38}
          priority
          className="w-[85px] h-[38px] object-contain brightness-0 invert"
        />
        <div className="h-[28px] w-[1px] bg-white/20 my-auto" />
        <span className="font-['Inter',sans-serif] font-semibold text-[13px] leading-[18px] tracking-[1.2px] text-white uppercase">
          Admin
        </span>
      </header>

      <aside className="hidden md:flex w-[256px] h-screen sticky top-0 flex-col justify-between bg-white border-r border-[rgba(28,46,90,0.1)] flex-shrink-0 z-10 overflow-y-auto">
        <div>
          <div className="p-6 border-b border-[rgba(28,46,90,0.1)] flex flex-col justify-between">
            <Image
              src="/Logo-Oak-Foundation.svg.svg"
              alt="Oak Foundation Logo"
              width={85}
              height={53}
              priority
              className="w-[85px] h-[53px] object-contain"
            />
            <div className="pt-3">
              <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[1.2px] text-[#6B7590] uppercase block">
                {tier === "super_admin" ? "Lead Organizer" : "Coordination Team"}
              </span>
            </div>
          </div>

          <nav className="p-4 flex flex-col gap-1">
            {links.map(({ icon: Icon, label, href }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition duration-150 ${
                    active
                      ? "bg-[#162E55] text-white shadow-[0px_4px_20px_rgba(28,46,90,0.3)] font-['Inter',sans-serif] font-semibold text-[14px] leading-[20px]"
                      : "text-[#6B7590] hover:bg-[#EEF1F5] hover:text-[#0E1726] font-['Inter',sans-serif] font-medium text-[14px] leading-[20px]"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-[20px] border-t border-[rgba(28,46,90,0.1)] flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-[14px] text-[#6B7590] hover:bg-[#EEF1F5] hover:text-[#0E1726] font-['Inter',sans-serif] font-medium text-[13px] leading-[18px] transition"
          >
            <LogOut className="w-[16px] h-[16px]" strokeWidth={2} />
            Sign Out
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-[32px] h-[32px] rounded-[12px] bg-[#EEF1F5] flex items-center justify-center flex-shrink-0">
              <Globe className="w-[14px] h-[14px] text-[#A8BBCE]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] text-[#0E1726]">
                Harare, Zimbabwe
              </span>
              <span className="font-['Inter',sans-serif] font-normal text-[10px] leading-[15px] text-[#6B7590]">
                9–11 November 2026
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav — previously missing entirely (a known gap
          called out in the brief's own README). Matches AppSidebar's
          mobile nav exactly: same blur, same active-pill treatment, same
          icon+label layout, so the admin and public sides feel like one
          product on a phone rather than two different apps. Every page
          using AdminSidebar needs bottom padding at least this nav's
          height (~64px, plus the safe-area inset on notched phones) so
          the last card in a scrollable page never sits underneath it. */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-30 backdrop-blur-[24px] bg-[rgba(255,255,255,0.76)] border-t border-[rgba(255,255,255,0.55)]">
        <div className="flex items-center px-1 py-1.5">
          {links.map(({ icon: Icon, label, href }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center gap-[2px] px-0.5 py-1.5"
              >
                <div
                  className={`flex flex-col items-center justify-center gap-[2px] px-3 py-1.5 rounded-[16px] transition-colors ${
                    active ? "bg-[rgba(28,46,90,0.08)]" : ""
                  }`}
                >
                  <Icon
                    className="w-[19px] h-[19px]"
                    strokeWidth={2}
                    style={{ color: active ? "#1C2E5A" : "#6B7590" }}
                  />
                  <span
                    className="font-['Inter',sans-serif] font-semibold text-[9px] leading-[13.5px] tracking-[0.225px] text-center whitespace-nowrap"
                    style={{ color: active ? "#1C2E5A" : "#6B7590" }}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}