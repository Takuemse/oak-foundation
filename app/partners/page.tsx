"use client";



import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { Search, ChevronRight, MapPin, Calendar, Clock, Globe, ExternalLink } from "lucide-react";

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



  const regions = ["All Regions", "Global", "Sub-Saharan Africa", "Northern Europe", "Middle East & North Africa"];



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

    return orgs.filter((o) => o.parent_organization_id || ["OSF", "ACA", "NEC"].includes(o.id.toUpperCase()) || o.name.includes("Open Society") || o.name.includes("Africa Climate Alliance") || o.name.includes("Nordic Evaluation Centre")).slice(0, 3);

  }, [orgs]);



  return (

    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">

      <AppSidebar />



      <div className="flex-1 flex justify-center">

        <main className="flex flex-col items-start px-[32px] py-[40px] gap-[10px] w-[672px] max-w-[672px] min-h-[1181px]">

         

          {/* Header */}

          <div className="flex flex-col items-start p-0 w-[195.23px] h-[54px]">

            <div className="flex flex-col items-start p-0 w-[195.23px] h-[32px] self-stretch">

              <h1 className="w-[143px] h-[32px] font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">

                Programme

              </h1>

            </div>

            <div className="flex flex-col items-start pt-[2px] pr-0 pb-0 pl-0 w-[195.23px] h-[22px]">

              <p className="w-[195px] h-[20px] font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590]">

                OAK Partner Convening 2026

              </p>

            </div>

          </div>



          {error && (

            <div className="w-[608px] bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-[16px] px-[16px] py-[12px]">

              {error}

            </div>

          )}



          {/* Search and Filters */}

          <div className="w-[608px] flex flex-col gap-[12px]">

            <div className="relative w-full">

              <Search className="absolute left-[16px] top-[14px] w-[18px] h-[18px] text-[#6B7590]" />

              <input

                type="text"

                value={query}

                onChange={(e) => setQuery(e.target.value)}

                placeholder="Search organisations, focus areas…"

                className="w-full h-[46px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[16px] pl-[46px] pr-[16px] text-[14px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20"

              />

            </div>



            {/* Region Filter Pills */}

            <div className="flex items-center gap-[8px] overflow-x-auto w-full pb-[2px]">

              {regions.map((reg) => (

                <button

                  key={reg}

                  onClick={() => setSelectedRegion(reg)}

                  className={`h-[32px] px-[12px] rounded-[12px] font-['Inter'] font-semibold text-[12px] whitespace-nowrap transition flex items-center justify-center ${

                    selectedRegion === reg

                      ? "bg-[#162E55] text-white shadow-[0px_4px_12px_rgba(28,46,90,0.2)]"

                      : "bg-white text-[#6B7590] border border-[rgba(28,46,90,0.1)] hover:bg-[#F9FAFB]"

                  }`}

                >

                  {reg}

                </button>

              ))}

            </div>

          </div>



          {/* Sub-Partners Section */}

          {!query && selectedRegion === "All Regions" && subPartners.length > 0 && (

            <div className="w-[608px] flex flex-col gap-[10px] pt-[4px]">

              <span className="font-chillax font-semibold text-[12px] leading-[16px] text-[#6B7590] uppercase tracking-wider">

                Sub-Partners

              </span>

              <div className="grid grid-cols-3 gap-[10px]">

                {subPartners.map((sub) => (

                  <Link

                    key={sub.id}

                    href={`/partners/${sub.id}`}

                    className="bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[20px] p-[14px] flex flex-col items-center text-center hover:bg-[#F9FAFB] transition group"

                  >

                    <div className="w-[36px] h-[36px] rounded-[12px] bg-[#162E55] text-white flex items-center justify-center font-bold text-[12px] mb-[8px] overflow-hidden">

                      {sub.logoUrl ? (

                        <img src={sub.logoUrl} alt="" className="w-full h-full object-cover" />

                      ) : (

                        initials(sub.name)

                      )}

                    </div>

                    <span className="font-['Inter'] font-semibold text-[12px] text-[#0E1726] truncate w-full">

                      {sub.name.split(" ")[0]}

                    </span>

                    <span className="font-['Inter'] text-[10px] text-[#6B7590] truncate w-full mt-[2px]">

                      {sub.region || "Global"}

                    </span>

                  </Link>

                ))}

              </div>

            </div>

          )}



          {/* All Partners List */}

          <div className="w-[608px] flex flex-col gap-[12px] pt-[4px]">

            {!query && selectedRegion === "All Regions" && (

              <span className="font-chillax font-semibold text-[12px] leading-[16px] text-[#6B7590] uppercase tracking-wider">

                All Partners

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

              <div className="flex flex-col gap-[12px] w-full">

                {filtered.map((org) => (

                  <Link

                    key={org.id}

                    href={`/partners/${org.id}`}

                    className="box-border flex flex-row items-center p-[16px] gap-[14px] w-[608px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] hover:bg-[#F9FAFB] transition group"

                  >

                    <div className="flex flex-row justify-center items-center w-[40px] h-[40px] bg-[#162E55] rounded-[16px] flex-shrink-0 text-white font-bold text-[12px] overflow-hidden">

                      {org.logoUrl ? (

                        <img src={org.logoUrl} alt="" className="w-full h-full object-cover" />

                      ) : (

                        initials(org.name)

                      )}

                    </div>



                    <div className="flex flex-col items-start flex-grow min-w-0">

                      <div className="flex items-center justify-between w-full">

                        <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726] truncate">

                          {org.name}

                        </span>

                        <ChevronRight className="w-[16px] h-[16px] text-[#6B7590] group-hover:text-[#0E1726] transition flex-shrink-0" />

                      </div>



                      <div className="flex items-center gap-[6px] mt-[2px]">

                        <MapPin className="w-[11px] h-[11px] text-[#6B7590]" />

                        <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590]">

                          {org.region || "Global"}

                        </span>

                      </div>



                      <div className="flex items-center gap-[6px] mt-[8px] flex-wrap">

                        <span className="px-[8px] py-[2px] bg-[#EEF1F5] rounded-[6px] font-['Inter'] font-medium text-[10px] text-[#162E55]">

                          {org.organization_type || "NGO"}

                        </span>

                        {(org.focus_areas || ["Democracy", "Human Rights"]).slice(0, 2).map((fa, idx) => (

                          <span key={idx} className="px-[8px] py-[2px] bg-[#EEF1F5] rounded-[6px] font-['Inter'] font-medium text-[10px] text-[#6B7590]">

                            {fa}

                          </span>

                        ))}

                      </div>



                      <div className="flex items-center justify-between w-full mt-[10px] pt-[8px] border-t border-[rgba(28,46,90,0.06)]">

                        <span className="font-['Inter'] text-[11px] text-[#6B7590]">

                          {org.partner_since ? `Partner since ${org.partner_since}` : "Partner since 2020"}

                        </span>

                        {org.website_url && (

                          <span className="flex items-center gap-[4px] font-['Inter'] text-[11px] text-[#162E55] truncate max-w-[200px]">

                            <Globe className="w-[11px] h-[11px]" />

                            {org.website_url.replace(/^https?:\/\//, "")}

                            <ExternalLink className="w-[10px] h-[10px] opacity-60" />

                          </span>

                        )}

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>



          {/* Footer Back Link */}

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

