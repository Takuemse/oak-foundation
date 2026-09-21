"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";
import AdminSidebar from "@/app/components/AdminSidebar";

type Org = {
  id: string;
  name: string;
  website_url: string | null;
  description: string | null;
  logo_path: string | null;
  logoUrl: string | null;
  region?: string;
  category?: string;
  year_joined?: string;
};

export default function AdminPartnersPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  async function load() {
    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      if (data.success) setOrgs(data.organizations);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(orgId: string, file: File) {
    setError(null);
    setUploadingId(orgId);

    try {
      const supabase = createBrowserSupabaseClient();
      const ext = file.name.split(".").pop();
      const path = `${orgId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { error: updateError } = await supabase
        .from("organizations")
        .update({ logo_path: path })
        .eq("id", orgId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await load();
    } finally {
      setUploadingId(null);
    }
  }

  const regions = [
    "All Regions",
    "Global",
    "Sub-Saharan Africa",
    "Northern Europe",
    "Middle East & North Africa",
    "East Africa",
    "Western Europe",
    "Europe",
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AdminSidebar />

      <div className="flex-1 flex justify-center">
        {/* pt-8/pb-[104px] on mobile: breathing room below the fixed
            header and clearance above the fixed bottom nav. */}
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-8 pb-[104px] md:px-8 md:py-10 flex flex-col items-start gap-[20px]">
          {/* Directory Header */}
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Partner Directory
            </h1>
            <p className="font-['Inter'] text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              {orgs.length} partner organizations
            </p>
          </div>

          {/* Filter and Search Container */}
          <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col items-start">
            <div className="relative w-full h-[52.5px]">
              <svg
                className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6B7590]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search organisations, focus areas…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-[#EEF1F5] rounded-[14px] pl-[46px] pr-[16px] font-['Inter'] text-[15px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
              />
            </div>

            {/* Region Selector Pills */}
            <div className="w-full flex items-center gap-[8px] overflow-x-auto pt-3 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`shrink-0 h-[28.5px] px-[12px] rounded-[12px] font-['Inter'] font-semibold text-[11px] whitespace-nowrap transition flex items-center justify-center ${
                    selectedRegion === region
                      ? "bg-[#162E55] text-white"
                      : "bg-[#EEF1F5] text-[#6B7590] hover:bg-[#E5E8EE]"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Error Output */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[16px] px-4 py-3">
              {error}
            </div>
          )}

          {/* Section header */}
          <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
            Sub-partners
          </span>

          {/* Organization List */}
          {loading ? (
            <p className="font-['Inter'] text-[14px] text-[#6B7590]">Loading partners…</p>
          ) : (
            <div className="w-full flex flex-col gap-[12px]">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 flex flex-col"
                >
                  <div className="flex items-start gap-4">
                    {/* Logo or Initials Block */}
                    <div className="w-12 h-12 rounded-[16px] bg-[#162E55] flex items-center justify-center overflow-hidden shrink-0">
                      {org.logoUrl ? (
                        <img
                          src={org.logoUrl}
                          alt={org.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-[14px] font-bold">
                          {org.name.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-['Inter'] font-semibold text-[14px] leading-[19px] text-[#0E1726] truncate">
                          {org.name}
                        </h3>

                        <label className="font-['Inter'] text-[12px] font-medium text-[#162E55] hover:underline cursor-pointer shrink-0">
                          {uploadingId === org.id ? "Uploading…" : "Upload logo"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingId === org.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(org.id, file);
                            }}
                          />
                        </label>
                      </div>

                      <p className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590] mt-[4px]">
                        {org.region || "Global"}
                      </p>

                      <div className="flex flex-wrap gap-[6px] mt-[8px]">
                        <span className="bg-[#EEF1F9] text-[#162E55] text-[11px] font-semibold leading-[16px] px-[10px] py-[4px] rounded-full tracking-[0.22px] font-['Inter']">
                          Foundation
                        </span>
                        <span className="bg-[#EEF1F5] text-[#6B7590] text-[11px] font-semibold leading-[16px] px-[10px] py-[4px] rounded-full tracking-[0.22px] font-['Inter']">
                          Democracy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(28,46,90,0.1)]">
                    <span className="font-['Inter'] text-[12px] leading-[16px] text-[#6B7590]">
                      Partner since {org.year_joined || "2020"}
                    </span>
                    {org.website_url && (
                      <a
                        href={org.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-['Inter'] font-medium text-[12px] text-[#162E55] inline-flex items-center gap-[4px] hover:underline"
                      >
                        {org.website_url.replace(/^https?:\/\//, "")}
                        <svg
                          className="w-[10px] h-[10px]"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Directory Link Button */}
          <Link
            href="/partners"
            className="w-full text-center border border-[rgba(28,46,90,0.1)] text-[#6B7590] bg-white rounded-[14px] py-3 font-['Inter'] text-[12px] font-semibold hover:bg-[#EEF1F5] transition"
          >
            View Public Partner Directory
          </Link>
        </main>
      </div>
    </div>
  );
}