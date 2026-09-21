"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ExternalLink, Globe, Mail } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

type Org = {
  id: string;
  name: string;
  organization_type: string;
  parent_organization_id: string | null;
  website_url: string | null;
  description: string | null;
  logoUrl: string | null;
  focus_areas?: string[];
  partner_since?: string;
};

const isAcademic = (type: string | undefined) => type === "Academic";

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [org, setOrg] = useState<Org | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/partners");
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message ?? "Unable to load partner.");
        }
        const organizations: Org[] = data.organizations ?? [];
        const found = organizations.find((o) => o.id === id);
        if (cancelled) return;
        if (!found) {
          setNotFound(true);
          return;
        }
        setOrg(found);
        if (found.parent_organization_id) {
          const parent = organizations.find((o) => o.id === found.parent_organization_id);
          if (parent) setParentName(parent.name);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center pb-[104px] md:pb-0">
          <p className="font-['Inter'] text-[14px] text-[#6B7590]">Loading partner details…</p>
        </div>
      </div>
    );
  }

  if (notFound || !org) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
        <AppSidebar />
        {/* pb-[104px] on mobile: clearance above AppSidebar's fixed
            bottom nav so this centered state isn't covered by it. */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 pb-[104px] md:pb-8 gap-4 text-center">
          <div className="w-14 h-14 rounded-[16px] bg-[#F1F3F5] flex items-center justify-center text-[#ADB5BD]">
            <Globe size={24} strokeWidth={1.75} />
          </div>
          <p className="font-['Inter'] text-[16px] font-semibold text-[#0E1726]">Partner not found</p>
          <p className="font-['Inter'] text-[14px] text-[#6B7590] max-w-[320px]">
            This organisation may not be part of the convening directory.
          </p>
          <Link
            href="/partners"
            className="px-5 py-3 bg-[#162E55] text-white rounded-[16px] font-['Inter'] font-semibold text-[14px] shadow-sm hover:bg-[#1c3a6b] transition"
          >
            Back to Partner Directory
          </Link>
        </div>
      </div>
    );
  }

  const initialsStr = initials(org.name);
  const focusAreas = org.focus_areas && org.focus_areas.length > 0 ? org.focus_areas : ["Democracy", "Human Rights", "Justice"];
  const contactInitials = "OT";

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        {/* pt-8/pb-[104px] on mobile: breathing room below the fixed
            header and clearance above AppSidebar's fixed bottom nav. */}
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-8 pb-[104px] md:px-8 md:py-10 flex flex-col items-start gap-0">
          {/* Back navigation */}
          <Link href="/partners" className="flex items-center gap-2 group">
            <ChevronLeft className="w-4 h-4 text-[#1C2E5A]" />
            <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#1C2E5A] group-hover:underline">
              Partner Directory
            </span>
          </Link>

          {/* Hero Card */}
          <div className="w-full pt-5">
            <div className="relative w-full bg-[#162E55] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] overflow-hidden p-6">
              <div
                className="absolute w-36 h-36 rounded-full pointer-events-none"
                style={{ right: "-24px", top: "-20px", background: "rgba(255,255,255,0.1)" }}
              />
              <div className="relative z-10 flex flex-col items-start">
                <div className="flex items-start gap-4 w-full">
                  <div
                    className={`w-16 h-16 rounded-[16px] flex items-center justify-center shrink-0 overflow-hidden ${
                      isAcademic(org.organization_type) ? "" : "bg-white/20"
                    }`}
                    style={
                      isAcademic(org.organization_type)
                        ? { backgroundImage: "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)" }
                        : undefined
                    }
                  >
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={`${org.name} logo`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-chillax font-bold text-[16px] text-white">{initialsStr}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-white/60 truncate">
                      {org.organization_type || "Partner"}
                      {org.partner_since ? ` · Partner since ${org.partner_since}` : ""}
                      {parentName ? ` · Part of ${parentName}` : ""}
                    </p>
                    <h2 className="font-chillax font-bold text-[20px] leading-[27.5px] text-white pt-1 truncate">
                      {org.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-4">
                  {focusAreas.map((fa, idx) => (
                    <span
                      key={idx}
                      className="px-[10px] py-[4px] bg-white/20 rounded-full font-['Inter'] font-semibold text-[11px] tracking-[0.22px] text-white"
                    >
                      {fa}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="w-full pt-4">
            <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-5 flex flex-col items-start">
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                About
              </span>
              <p className="font-['Inter'] font-normal text-[14px] leading-[22.75px] text-[#0E1726] pt-3">
                {org.description ?? "This partner hasn't provided a description yet."}
              </p>
            </div>
          </div>

          {/* Contact at Convening */}
          <div className="w-full pt-4">
            <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-5 flex flex-col items-start">
              <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                Contact at Convening
              </span>
              <div className="flex items-center gap-3 pt-3 min-w-0 w-full">
                <div className="w-11 h-11 bg-[#162E55] rounded-[16px] flex items-center justify-center shrink-0">
                  <span className="font-['Inter'] font-bold text-[14px] text-white">{contactInitials}</span>
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726] truncate w-full">
                    OAK Coordination Team
                  </span>
                  <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590] truncate w-full">
                    partnerships@oakfnd.org
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-[10px] pt-4">
            {org.website_url && (
              <a
                href={org.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-5 py-4 bg-[#162E55] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] rounded-[16px] hover:bg-[#1c3a6b] transition"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-[15px] h-[15px] text-white" />
                  <span className="font-chillax font-semibold text-[14px] leading-[20px] text-white">
                    Visit Website
                  </span>
                </div>
                <ExternalLink className="w-[14px] h-[14px] text-white" />
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                window.location.href = "mailto:partnerships@oakfnd.org";
              }}
              className="w-full flex items-center justify-between px-5 py-4 bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-[15px] h-[15px] text-[#0E1726]" />
                <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726]">
                  Send Message
                </span>
              </div>
              <ChevronLeft className="w-[14px] h-[14px] text-[#6B7590] rotate-180" />
            </button>
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