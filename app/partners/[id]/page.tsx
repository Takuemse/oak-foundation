"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ExternalLink, Globe } from "lucide-react";
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
        // No dedicated /api/partners/[id] endpoint exists — the directory
        // list endpoint is the single source of truth, so resolve locally.
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <Link
          href="/partners"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition mb-4"
        >
          <ChevronLeft size={16} />
          Partner Directory
        </Link>

        {loading ? (
          <p className="text-sm text-slate-400 py-8">Loading…</p>
        ) : notFound || !org ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
              <Globe size={24} strokeWidth={1.75} />
            </div>
            <p className="text-base font-semibold text-slate-800">Partner not found</p>
            <p className="text-sm text-slate-400 mt-1 mb-5">
              This organisation may not be part of the convening directory.
            </p>
            <Link
              href="/partners"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#0f1e3d] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#16295c] transition"
            >
              Back to Partner Directory
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#0f1e3d] to-[#0a1730] text-white rounded-2xl px-6 py-6 mb-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden mb-4">
                  {org.logoUrl ? (
                    <img
                      src={org.logoUrl}
                      alt={`${org.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#0f1e3d] text-lg font-bold">{initials(org.name)}</span>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-300 font-semibold">
                  {org.organization_type
                    ? `${org.organization_type.toUpperCase()} · OAK PARTNER`
                    : "OAK PARTNER"}
                </p>
                <h1 className="text-xl font-bold mt-1">{org.name}</h1>
                {parentName && (
                  <span className="inline-flex items-center mt-3 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium">
                    Part of {parentName}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">About</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {org.description ?? "This partner hasn't provided a description yet."}
              </p>
            </div>

            {org.website_url && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  Website
                </p>
                <p className="text-sm text-slate-600 truncate">
                  {org.website_url.replace(/^https?:\/\//, "")}
                </p>
                <a
                  href={org.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-[#0f1e3d] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#16295c] transition"
                >
                  <ExternalLink size={15} />
                  Visit Website
                </a>
              </div>
            )}

            <Link
              href="/partners"
              className="block text-center border border-slate-200 text-slate-500 rounded-lg py-2.5 text-xs font-medium hover:bg-white transition"
            >
              Back to Partner Directory
            </Link>
          </>
        )}
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
