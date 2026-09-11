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
};

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
      <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-['Inter'] text-[14px] text-[#6B7590]">Loading partner details…</p>
        </div>
      </div>
    );
  }

  if (notFound || !org) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
        <AppSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-[32px] gap-[16px]">
          <div className="w-[56px] h-[56px] rounded-[16px] bg-[#F1F3F5] flex items-center justify-center text-[#ADB5BD]">
            <Globe size={24} strokeWidth={1.75} />
          </div>
          <p className="font-['Inter'] text-[16px] font-semibold text-[#0E1726]">Partner not found</p>
          <p className="font-['Inter'] text-[14px] text-[#6B7590] text-center max-w-[320px]">
            This organisation may not be part of the convening directory.
          </p>
          <Link
            href="/partners"
            className="px-[20px] py-[12px] bg-[#162E55] text-white rounded-[16px] font-['Inter'] font-semibold text-[14px] shadow-sm hover:bg-[#1c3a6b] transition"
          >
            Back to Partner Directory
          </Link>
        </div>
      </div>
    );
  }

  const initialsStr = initials(org.name);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        {/* PartnersScreen */}
        <main className="flex flex-col items-start px-[32px] py-[40px] w-[672px] max-w-[672px]">
          
          {/* Button (Back navigation) */}
          <div className="flex flex-row items-center p-0 gap-[8px] w-[142px] h-[20px] flex-none order-0 flex-grow-0">
            <Link href="/partners" className="flex items-center gap-[8px] group w-full h-full">
              <div className="flex flex-col items-start p-0 isolation-isolate w-[16px] h-[16px] flex-none order-0 flex-grow-0 relative">
                <div className="absolute w-[16px] h-[16px] left-0 top-0 transform rotate-180 flex items-center justify-center flex-none order-0 z-0">
                  <ChevronLeft className="w-[16px] h-[16px] text-[#1C2E5A]" />
                </div>
              </div>
              <span className="w-[118px] h-[20px] font-['Inter'] font-semibold text-[14px] leading-[20px] text-center text-[#1C2E5A] flex-none order-1 flex-grow-0 group-hover:underline">
                Partner Directory
              </span>
            </Link>
          </div>

          {/* Container:margin */}
          <div className="flex flex-col items-start pt-[20px] pr-0 pb-0 pl-0 w-[608px] h-[172.5px] flex-none order-1 self-stretch flex-grow-0">
            {/* Container (Hero Card) */}
            <div className="relative w-[608px] h-[152.5px] bg-[#162E55] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] overflow-hidden flex-none order-0 self-stretch flex-grow-0">
              {/* Decorative circle */}
              <div className="absolute w-[144px] h-[144px] left-[496px] top-[40.5px] bg-[rgba(255,255,255,0.1)] rounded-[33554400px]" />

              {/* Container */}
              <div className="absolute flex flex-col items-start p-0 w-[560px] h-[104.5px] left-[24px] top-[24px]">
                
                {/* Container (Logo & Title Group) */}
                <div className="flex flex-row items-start p-0 gap-[16px] w-[560px] h-[64px] flex-none order-0 self-stretch flex-grow-0">
                  
                  {/* Logo Container */}
                  <div className="flex flex-row justify-center items-center p-0 w-[64px] h-[64px] bg-[rgba(255,255,255,0.2)] rounded-[16px] flex-none order-0 flex-grow-0 overflow-hidden">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={`${org.name} logo`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-[32px] h-[20px] font-['Chillax'] font-bold text-[16px] leading-[20px] text-center text-[#FFFFFF] flex-none order-0 flex-grow-0">
                        {initialsStr}
                      </span>
                    )}
                  </div>

                  {/* Title Container */}
                  <div className="flex flex-col items-start p-0 w-[480px] h-[47px] flex-none order-1 flex-grow-0">
                    <div className="flex flex-col items-start p-0 w-full h-[15px] flex-none order-0 self-stretch flex-grow-0">
                      <span className="w-full h-[15px] font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[rgba(255,255,255,0.6)] flex-none order-0 flex-grow-0 truncate">
                        {org.organization_type ? `${org.organization_type} · OAK PARTNER` : "OAK PARTNER"} {parentName ? `· Part of ${parentName}` : ""}
                      </span>
                    </div>
                    <div className="flex flex-col items-start pt-[4px] pr-0 pb-0 pl-0 w-full h-[32px] flex-none order-1 flex-grow-0">
                      <h2 className="w-full h-[28px] font-['Chillax'] font-bold text-[20px] leading-[28px] text-[#FFFFFF] flex-none order-0 flex-grow-0 truncate">
                        {org.name}
                      </h2>
                    </div>
                  </div>

                </div>

                {/* Focus Areas / Badges Container */}
                <div className="flex flex-row items-start pt-[16px] pr-0 pb-0 pl-0 gap-[8px] w-[560px] h-[40.5px] flex-none order-1 flex-grow-0 overflow-x-auto">
                  {["Democracy", "Human Rights", "Justice"].map((fa, idx) => (
                    <div
                      key={idx}
                      className="flex flex-row items-center py-[4px] px-[10px] gap-[4px] h-[24.5px] bg-[rgba(255,255,255,0.2)] rounded-[100px] flex-none order-0 self-stretch flex-grow-0"
                    >
                      <span className="font-['Inter'] font-semibold text-[11px] leading-[16px] tracking-[0.22px] text-[#FFFFFF] flex-none order-0 flex-grow-0 whitespace-nowrap">
                        {fa}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Container:margin (About) */}
          <div className="flex flex-col items-start pt-[16px] pr-0 pb-0 pl-0 w-[608px] h-[131px] flex-none order-2 self-stretch flex-grow-0">
            <div className="box-border flex flex-col items-start p-[20px] w-[608px] h-[115px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex-none order-0 self-stretch flex-grow-0">
              <div className="flex flex-col items-start p-0 w-[566px] h-[15px] flex-none order-0 self-stretch flex-grow-0">
                <span className="w-[40px] h-[15px] font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] flex-none order-0 flex-grow-0">
                  About
                </span>
              </div>
              <div className="flex flex-col items-start pt-[12px] pr-0 pb-0 pl-0 w-[566px] h-[58px] flex-none order-1 self-stretch flex-grow-0">
                <p className="w-[566px] font-['Inter'] font-normal text-[14px] leading-[23px] text-[#0E1726] flex-none order-0 flex-grow-0 line-clamp-2">
                  {org.description ?? "This partner hasn't provided a description yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Container:margin (Contact at Convening) */}
          <div className="flex flex-col items-start pt-[16px] pr-0 pb-0 pl-0 w-[608px] h-[129px] flex-none order-3 self-stretch flex-grow-0">
            <div className="box-border flex flex-col items-start p-[20px] w-[608px] h-[113px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex-none order-0 self-stretch flex-grow-0">
              <div className="flex flex-col items-start p-0 w-[566px] h-[15px] flex-none order-0 self-stretch flex-grow-0">
                <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] whitespace-nowrap">
                  Contact at Convening
                </span>
              </div>
              <div className="flex flex-row items-center pt-[12px] pr-0 pb-0 pl-0 gap-[12px] w-[566px] h-[56px] flex-none order-1 flex-grow-0">
                <div className="flex flex-row justify-center items-center p-0 w-[44px] h-[44px] bg-[#162E55] rounded-[16px] flex-none order-0 flex-grow-0">
                  <span className="w-[22px] h-[20px] font-['Inter'] font-bold text-[14px] leading-[20px] text-center text-[#FFFFFF] flex-none order-0 flex-grow-0">
                    MS
                  </span>
                </div>
                <div className="flex flex-col items-start p-0 w-[110.34px] h-[36px] flex-none order-1 flex-grow-0">
                  <div className="flex flex-col items-start p-0 w-[110.34px] h-[20px] flex-none order-0 self-stretch flex-grow-0">
                    <span className="w-[98px] h-[20px] font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726] flex-none order-0 flex-grow-0 truncate">
                      Maria Schmidt
                    </span>
                  </div>
                  <div className="flex flex-col items-start p-0 w-[110.34px] h-[16px] flex-none order-1 self-stretch flex-grow-0">
                    <span className="w-[110px] h-[16px] font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590] flex-none order-0 flex-grow-0 truncate">
                      m.schmidt@osf.org
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Container:margin (Visit Website & Send Message Actions) */}
          <div className="flex flex-col items-start pt-[16px] pr-0 pb-0 pl-0 w-[608px] h-[132px] flex-none order-4 self-stretch flex-grow-0 gap-[10px]">
            
            {org.website_url && (
              <a
                href={org.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row justify-between items-center px-[20px] py-[16px] w-[608px] h-[52px] bg-[#162E55] shadow-[0px_4px_16px_rgba(0,0,0,0.15)] rounded-[16px] flex-none order-0 flex-grow-0 hover:bg-[#1c3a6b] transition"
              >
                <div className="flex flex-row items-center p-0 gap-[8px] w-[115px] h-[20px] flex-none order-0 flex-grow-0">
                  <Globe className="w-[15px] h-[15px] text-white flex-none order-0 flex-grow-0" />
                  <span className="w-[92px] h-[20px] font-['Chillax'] font-semibold text-[14px] leading-[20px] text-[#FFFFFF] flex-none order-1 flex-grow-0">
                    Visit Website
                  </span>
                </div>
                <ExternalLink className="w-[14px] h-[14px] text-white flex-none order-1 flex-grow-0" />
              </a>
            )}

            {/* Button:margin */}
            <div className="flex flex-col items-center pt-[10px] pr-0 pb-0 pl-0 w-[608px] h-[64px] flex-none order-1 self-stretch flex-grow-0">
              <button
                onClick={() => {
                  window.location.href = "mailto:m.schmidt@osf.org";
                }}
                className="box-border flex flex-row justify-between items-center px-[20px] py-[16px] w-[608px] h-[54px] bg-[#FFFFFF] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex-none order-0 flex-grow-0 hover:bg-[#F9FAFB] transition cursor-pointer"
              >
                <div className="flex flex-row items-center p-0 gap-[8px] w-[123px] h-[20px] flex-none order-0 flex-grow-0">
                  <Mail className="w-[15px] h-[15px] text-[#0E1726] flex-none order-0 flex-grow-0" />
                  <span className="w-[100px] h-[20px] font-['Inter'] font-semibold text-[14px] leading-[20px] text-center text-[#0E1726] flex-none order-1 flex-grow-0">
                    Send Message
                  </span>
                </div>
                <div className="w-[14px] h-[14px] flex-none order-1 flex-grow-0 flex items-center justify-center">
                  <ChevronLeft className="w-[14px] h-[14px] text-[#6B7590] transform rotate-180" />
                </div>
              </button>
            </div>

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