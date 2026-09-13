"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ScanLine, BarChart3, Globe, FileText, LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

const ADMIN_LINKS = [
  { icon: ScanLine, label: "Check In", href: "/admin/check-in" },
  { icon: BarChart3, label: "Attendance", href: "/admin/attendance" },
  { icon: Globe, label: "Partners", href: "/admin/partners" },
  { icon: FileText, label: "Documentation", href: "/admin/documentation" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="md:hidden w-full h-[82px] bg-[#162E55] flex flex-row items-center px-[16px] gap-[12px] shrink-0 z-30">
        <Image
          src="/Logo-Oak-Foundation-White.svg"
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
                Coordination Admin
              </span>
            </div>
          </div>

          <nav className="p-4 flex flex-col gap-1">
            {ADMIN_LINKS.map(({ icon: Icon, label, href }) => {
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
    </>
  );
}