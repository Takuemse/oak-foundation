"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserPlus, Calendar, Globe, ScanLine, BarChart3 } from "lucide-react";

type NavRole = "Partner" | "OAK Staff" | "Coordination Team" | "Presenter" | "Observer";

const PROGRAMME_ROLES: NavRole[] = ["OAK Staff", "Presenter", "Observer", "Coordination Team"];
const COORDINATION_ONLY: NavRole[] = ["Coordination Team"];

const ALL_LINKS: {
  icon: typeof UserPlus;
  label: string;
  href: string;
  exact: boolean;
  roles: NavRole[] | null; // null = always visible
}[] = [
  { icon: UserPlus, label: "Register", href: "/register", exact: true, roles: null },
  { icon: Calendar, label: "Programme", href: "/programme", exact: true, roles: PROGRAMME_ROLES },
  { icon: Globe, label: "Partners", href: "/partners", exact: false, roles: PROGRAMME_ROLES },
  { icon: ScanLine, label: "Check In", href: "/admin/check-in", exact: false, roles: COORDINATION_ONLY },
  { icon: BarChart3, label: "Attendance", href: "/admin/attendance", exact: false, roles: COORDINATION_ONLY },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      setHasRegistered(localStorage.getItem("oak_registered") === "true");
      setRole(localStorage.getItem("oak_role"));
    }
    sync();
    window.addEventListener("oak-registration-changed", sync);
    return () => window.removeEventListener("oak-registration-changed", sync);
  }, [pathname]);

  const visibleLinks = ALL_LINKS.filter((link) => {
    if (link.roles === null) return true;
    if (!hasRegistered || !role) return false;
    return link.roles.includes(role as NavRole);
  });

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
          Partner Convening 2026
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
                Partner Convening 2026
              </span>
            </div>
          </div>

          <nav className="p-4 flex flex-col gap-1">
            {visibleLinks.map(({ icon: Icon, label, href, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
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

        <div className="p-[20px] border-t border-[rgba(28,46,90,0.1)] flex items-center gap-2.5">
          <div className="w-[32px] h-[32px] rounded-[12px] bg-[#EEF1F5] flex items-center justify-center flex-shrink-0">
            <Globe className="w-[14px] h-[14px] text-[#A8BBCE]" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0px] text-[#0E1726]">
              Harare, Zimbabwe
            </span>
            <span className="font-['Inter',sans-serif] font-normal text-[10px] leading-[15px] tracking-[0px] text-[#6B7590]">
              9–11 November 2026
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}