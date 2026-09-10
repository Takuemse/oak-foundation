"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

type Org = {
  id: string;
  name: string;
  logo_path: string | null;
  logoUrl: string | null;
};

export default function AdminPartnersPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto">
      <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-6">
        <h1 className="text-lg font-semibold">Manage Partner Logos</h1>
        <p className="text-sm text-slate-300 mt-0.5">
          Upload a logo for each partner organization
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {org.logoUrl ? (
                  <img src={org.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">No logo</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{org.name}</p>
                <label className="inline-block mt-1 text-xs text-blue-600 cursor-pointer">
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
            </div>
          ))}
        </div>
      )}

      <Link
        href="/partners"
        className="block text-center mt-6 border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-medium hover:bg-white transition"
      >
        View Public Partner Directory
      </Link>
    </div>
  );
}