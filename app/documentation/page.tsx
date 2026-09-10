"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Photo = {
  id: string;
  caption: string | null;
  photoUrl: string;
};

type Post = {
  id: string;
  event_date: string;
  title: string;
  content: string;
  photos: Photo[];
};

export default function DocumentationPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/documentation");
        const data = await res.json();
        if (!data.success) {
          setError(data.message ?? "Unable to load documentation.");
          return;
        }
        setPosts(data.posts);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-56 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="px-5 pt-6 pb-4 border-b border-slate-100">
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              OAK <span className="font-normal text-slate-400">FOUNDATION</span>
            </div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mt-1">
              Partner Convening 2026
            </div>
          </div>
          <nav className="px-3 py-4 space-y-1">
            <SidebarLink label="Register" href="/register" />
            <SidebarLink label="Programme" href="/programme" />
            <SidebarLink label="Partners" href="/partners" />
            <SidebarLink label="Documentation" href="/documentation" active />
          </nav>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">
          Harare, Zimbabwe
          <br />
          9–11 November 2026
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-900 mb-0.5">Event Documentation</h1>
        <p className="text-sm text-slate-400 mb-5">OAK Partner Convening 2026</p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No documentation has been published yet. Check back during the event.
          </p>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                  {formatDate(post.event_date)}
                </p>
                <h2 className="text-base font-semibold text-slate-800 mb-2">{post.title}</h2>
                <p className="text-sm text-slate-600 whitespace-pre-line">{post.content}</p>

                {post.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {post.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.photoUrl}
                        alt={photo.caption ?? ""}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </article>
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

function SidebarLink({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm font-medium ${
        active ? "bg-[#0f1e3d] text-white" : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}