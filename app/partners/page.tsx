"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";

type Org = {
  id: string;
  name: string;
  organization_type: string;
  website_url: string | null;
  description: string | null;
  logoUrl: string | null;
};

export default function PartnersPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [query, setQuery] = useState("");
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
    if (!q) return orgs;
    return orgs.filter((o) => o.name.toLowerCase().includes(q));
  }, [orgs, query]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-900 mb-0.5">Partner Directory</h1>
        <p className="text-sm text-slate-400 mb-4">
          {orgs.length} partner organization{orgs.length !== 1 ? "s" : ""}
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organisations…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#0f1e3d]/20 focus:border-[#0f1e3d]"
        />

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No partners match your search.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((org) => (
              
            <Link
              key={org.id}
              href={`/partners/${org.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0f1e3d] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={`${org.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials(org.name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {org.name}
                    </p>
                    {org.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {org.description}
                      </p>
                    )}
                    {org.website_url && (
                      <p className="text-[11px] text-blue-600 mt-1 truncate">
                        {org.website_url.replace(/^https?:\/\//, "")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/register"
          className="block text-center mt-6 border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-medium hover:bg-white transition"
        >
          Back to Registration
        </Link>
      </main>
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