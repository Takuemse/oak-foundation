"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, MapPin, Globe, ExternalLink } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

type Org = {
  id: string;
  name: string;
  organization_type: string;
  parent_organization_id: string | null;
  website_url: string | null;
  description: string | null;
  logoUrl: string | null;
  region?: string;
  focus_areas?: string[];
  partner_since?: string;
};

const REGIONS = [
  "All Regions",
  "Global",
  "Sub-Saharan Africa",
  "Northern Europe",
  "Middle East & North Africa",
  "Global / East Africa",
  "Western Europe",
  "Europe",
];

const TYPE_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  Foundation: { bg: "bg-[#EEF1F9]", text: "text-[#1C2E5A]" },
  NGO: { bg: "bg-[#ECFDF5]", text: "text-[#162E55]" },
  Academic: { bg: "bg-[#F1F5F9]", text: "text-[#334155]" },
  Network: { bg: "bg-[#FFF7ED]", text: "text-[#162E55]" },
};
const DEFAULT_TYPE_BADGE = { bg: "bg-[#EEF1F5]", text: "text-[#6B7590]" };

const isAcademic = (type: string | undefined) => type === "Academic";

export default function PartnersPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/partners");
        const data = await res.json();
        if (!data.success) {
          setError(data.message ?? "Unable to load partners.");
          return;
        }
        setOrgs(data.organizations);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter((o) => {
      const matchesQuery =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.organization_type?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.focus_areas?.some((fa) => fa.toLowerCase().includes(q));

      const matchesRegion =
        selectedRegion === "All Regions" || o.region === selectedRegion;

      return matchesQuery && matchesRegion;
    });
  }, [orgs, query, selectedRegion]);

  const subPartners = useMemo(() => {
    return orgs.filter((o) => o.parent_organization_id).slice(0, 3);
  }, [orgs]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        {/* pt-8/pb-[104px] on mobile: breathing room below the fixed
            header and clearance above AppSidebar's fixed bottom nav. */}
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-8 pb-[104px] md:px-8 md:py-10 flex flex-col items-start gap-[14px]">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Partner Directory
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              {orgs.length > 0 ? `${orgs.length} partner organisations` : "OAK Partner Convening 2026"}
            </p>
          </div>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-[16px] px-[16px] py-[12px]">
              {error}
            </div>
          )}

          <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col items-start">
            <div className="relative w-full h-[52.5px]">
              <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6B7590]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search organisations, focus areas…"
                className="w-full h-full bg-[#EEF1F5] rounded-[14px] pl-[46px] pr-[16px] font-['Inter'] text-[15px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
              />
            </div>

            <div className="w-full flex items-center gap-[8px] overflow-x-auto pt-3 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {REGIONS.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={`shrink-0 h-[28.5px] px-[12px] rounded-[12px] font-['Inter'] font-semibold text-[11px] whitespace-nowrap transition flex items-center justify-center ${
                    selectedRegion === reg
                      ? "bg-[#162E55] text-white"
                      : "bg-[#EEF1F5] text-[#6B7590] hover:bg-[#E5E8EE]"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {!query && selectedRegion === "All Regions" && subPartners.length > 0 && (
            <div className="w-full flex flex-col items-start pt-1">
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                Sub-partners
              </span>
              <div className="w-full grid grid-cols-3 gap-[10px] pt-3">
                {subPartners.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/partners/${sub.id}`}
                    className="bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-[14px] flex flex-col items-center gap-2 text-center hover:border-[rgba(28,46,90,0.25)] transition"
                  >
                    <div
                      className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-white font-bold text-[12px] overflow-hidden shrink-0 ${
                        isAcademic(sub.organization_type) ? "" : "bg-[#162E55]"
                      }`}
                      style={
                        isAcademic(sub.organization_type)
                          ? { backgroundImage: "linear-gradient(135deg, #374151 0%, #6B7280 100%)" }
                          : undefined
                      }
                    >
                      {sub.logoUrl ? (
                        <img src={sub.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initials(sub.name)
                      )}
                    </div>
                    <span className="font-['Inter'] font-semibold text-[11px] leading-[13.75px] text-[#0E1726] truncate w-full">
                      {sub.name.split(" ")[0]}
                    </span>
                    <span className="font-['Inter'] font-normal text-[10px] leading-[12.5px] text-[#6B7590] truncate w-full">
                      {sub.region || "Global"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="w-full flex flex-col items-start gap-3 pt-1">
            {!query && selectedRegion === "All Regions" && (
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                all partners
              </span>
            )}

            {loading ? (
              <div className="w-full py-[40px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
                Loading partners…
              </div>
            ) : filtered.length === 0 ? (
              <div className="w-full py-[40px] bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] text-center">
                <p className="font-['Inter'] text-[14px] text-[#6B7590]">
                  No partners match your search.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-[10px] w-full">
                {filtered.map((org) => {
                  const badge = TYPE_BADGE_STYLES[org.organization_type] ?? DEFAULT_TYPE_BADGE;
                  return (
                    <Link
                      key={org.id}
                      href={`/partners/${org.id}`}
                      className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col hover:border-[rgba(28,46,90,0.25)] transition group"
                    >
                      <div className="flex items-start gap-4 w-full">
                        <div
                          className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-white font-bold text-[14px] overflow-hidden shrink-0 ${
                            isAcademic(org.organization_type) ? "" : "bg-[#162E55]"
                          }`}
                          style={
                            isAcademic(org.organization_type)
                              ? { backgroundImage: "linear-gradient(135deg, #374151 0%, #6B7280 100%)" }
                              : undefined
                          }
                        >
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            initials(org.name)
                          )}
                        </div>

                        <div className="flex-1 flex flex-col items-start min-w-0">
                          <div className="flex items-start justify-between w-full gap-2">
                            <span className="font-['Inter'] font-semibold text-[14px] leading-[19.25px] text-[#0E1726] truncate">
                              {org.name}
                            </span>
                            <ChevronRight className="w-[14px] h-[14px] text-[#A8BBCE] group-hover:text-[#6B7590] transition shrink-0 mt-0.5" />
                          </div>

                          <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590] pt-1">
                            {org.region || "Global"}
                          </span>

                          <div className="flex items-center gap-[6px] flex-wrap pt-2">
                            <span
                              className={`px-[10px] py-[4px] rounded-full font-['Inter'] font-semibold text-[11px] tracking-[0.22px] ${badge.bg} ${badge.text}`}
                            >
                              {org.organization_type || "NGO"}
                            </span>
                            {(org.focus_areas || []).slice(0, 2).map((fa, idx) => (
                              <span
                                key={idx}
                                className="px-[10px] py-[4px] bg-[#EEF1F5] rounded-full font-['Inter'] font-semibold text-[11px] tracking-[0.22px] text-[#6B7590]"
                              >
                                {fa}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-[rgba(28,46,90,0.1)]">
                        <span className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590]">
                          {org.partner_since ? `Partner since ${org.partner_since}` : "Partner since 2020"}
                        </span>
                        {org.website_url && (
                          <span className="flex items-center gap-[4px] font-['Inter'] font-medium text-[12px] leading-[16px] text-[#162E55] truncate max-w-[45%]">
                            {org.website_url.replace(/^https?:\/\//, "")}
                            <ExternalLink className="w-[10px] h-[10px] shrink-0" />
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

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
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}