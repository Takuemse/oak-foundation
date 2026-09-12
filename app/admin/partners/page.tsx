"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-10 max-w-[672px] mx-auto font-sans">
      {/* Directory Header */}
      <div className="mb-5">
        <h2 className="text-[24px] leading-[32px] font-bold text-[#0E1726] font-chillax">
          Partner Directory
        </h2>
        <p className="text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
          {orgs.length} partner organizations
        </p>
      </div>

      {/* Filter and Search Container */}
      <div className="bg-white rounded-[24px] border border-[#1C2E5A]/10 p-4 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] mb-4">
        <div className="relative mb-3">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6B7590]"
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
            className="w-full bg-[#EEF1F5] rounded-[14px] pl-10 pr-4 py-[14px] text-[15px] leading-[18px] text-[#0E1726] placeholder-[#6B7590] border-none outline-none focus:ring-2 focus:ring-[#162E55]"
          />
        </div>

        {/* Region Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`whitespace-nowrap px-3 py-[6px] rounded-[12px] text-[11px] font-semibold leading-[16px] transition-colors ${
                selectedRegion === region
                  ? "bg-[#162E55] text-white"
                  : "bg-[#EEF1F5] text-[#6B7590] hover:bg-[#e2e6ec]"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-4 border border-red-100">
          {error}
        </div>
      )}

      {/* Featured / Sub-partners Section Header */}
      <div className="mt-4 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#6B7590]">
          Sub-partners
        </span>
      </div>

      {/* Organization List Grid */}
      {loading ? (
        <p className="text-sm text-[#6B7590]">Loading partners…</p>
      ) : (
        <div className="space-y-[12px]">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-[24px] border border-[#1C2E5A]/10 p-[17px] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] flex flex-col justify-between"
            >
              <div className="flex items-start gap-[16px]">
                {/* Logo or Initials Block */}
                <div className="w-[48px] h-[48px] rounded-[16px] bg-[#162E55] flex items-center justify-center overflow-hidden shrink-0">
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

                {/* Details Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[14px] font-semibold leading-[19px] text-[#0E1726] truncate font-sans">
                      {org.name}
                    </h3>

                    {/* Logo Upload Trigger */}
                    <label className="text-xs text-[#162E55] hover:underline cursor-pointer font-medium">
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

                  <p className="text-[12px] leading-[16px] text-[#6B7590] mt-[4px]">
                    {org.region || "Global"}
                  </p>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap gap-[6px] mt-[8px]">
                    <span className="bg-[#EEF1F9] text-[#162E55] text-[11px] font-semibold leading-[16px] px-[10px] py-[4px] rounded-full tracking-[0.22px]">
                      Foundation
                    </span>
                    <span className="bg-[#EEF1F5] text-[#6B7590] text-[11px] font-semibold leading-[16px] px-[10px] py-[4px] rounded-full tracking-[0.22px]">
                      Democracy
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Info Bar */}
              <div className="mt-[12px] pt-[12px] border-t border-[#1C2E5A]/10 flex justify-between items-center text-[12px] leading-[16px]">
                <span className="text-[#6B7590]">
                  Partner since {org.year_joined || "2020"}
                </span>
                {org.website_url && (
                  <a
                    href={org.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#162E55] font-medium inline-flex items-center gap-[4px] hover:underline"
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
        className="block text-center mt-6 border border-[#1C2E5A]/10 text-[#6B7590] bg-white rounded-[14px] py-3 text-xs font-semibold hover:bg-[#EEF1F5] transition"
      >
        View Public Partner Directory
      </Link>
    </div>
  );
}