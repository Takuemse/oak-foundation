"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Lightbulb,
  FileDown,
  Plus,
} from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

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

type Takeaway = {
  id: string;
  content: string;
};

type Resource = {
  id: string;
  title: string;
  meta: string | null;
  fileUrl: string;
};

function formatPostDate(dateStr: string) {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DocumentationPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [keyTakeaways, setKeyTakeaways] = useState<Takeaway[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/documentation");
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? "Unable to load documentation.");
        return;
      }
      setPosts(data.posts);
      setKeyTakeaways(data.keyTakeaways ?? []);
      setResources(data.resources ?? []);
      setError(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Client-side check only decides whether to *show* the Add Note
    // shortcut. The real gate is proxy.ts protecting /admin/documentation.
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(!!data.user);
    });

    // Live updates: when the Lead Organizer publishes a post or uploads a
    // photo from /admin/documentation, everyone already viewing this page
    // should see it appear without a manual refresh. Rather than merge
    // deltas by hand, just refetch the same /api/documentation payload on
    // any change — simplest correct option, and consistent with the
    // brief's "lean and reliable" scope. Requires documentation_posts and
    // documentation_photos to be added to the supabase_realtime
    // publication (Database → Replication in the Studio, or
    // `ALTER PUBLICATION supabase_realtime ADD TABLE documentation_posts, documentation_photos;`)
    // — this is a one-time project setting, not something this file can
    // turn on by itself.
    const channel = supabase
      .channel("public-documentation-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documentation_posts" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documentation_photos" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "key_takeaways" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resources" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const sortedPosts = [...posts].sort((a, b) => b.event_date.localeCompare(a.event_date));
  const allPhotos = posts.flatMap((p) => p.photos);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-[672px] max-w-[672px] min-h-screen px-[32px] py-[40px] flex flex-col items-start gap-[20px]">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Documentation
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              OAK Partner Convening 2026
            </p>
          </div>

          <div className="w-[608px] h-[40px] bg-[#E5E8EE] p-[4px] rounded-[16px] flex items-center justify-between">
            <Link
              href="/programme"
              className="w-[140px] h-[32px] rounded-[12px] text-[#6B7590] hover:text-[#0E1726] capitalize transition flex items-center justify-center text-[12px] font-semibold font-['Inter']"
            >
              Schedule
            </Link>

            <button
              type="button"
              className="w-[116px] h-[32px] bg-white rounded-[12px] shadow-[0px_1px_4px_rgba(0,0,0,0.08)] flex flex-col justify-center items-center font-['Inter'] font-semibold text-[12px] leading-[16px] text-[#0E1726] capitalize"
            >
              Docs
            </button>
          </div>

          {error && (
            <div className="w-[608px] bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-[16px] px-[16px] py-[12px]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="w-[608px] py-[40px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
              Loading documentation…
            </div>
          ) : (
            <div className="w-[608px] flex flex-col items-start gap-[28px]">
              {/* Section 1: Session Notes (real, admin-published) */}
              <section className="w-full flex flex-col gap-[12px]">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <FileText className="w-[17px] h-[17px] text-[#1C2E5A]" />
                    <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                      Session Notes
                    </h2>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin/documentation"
                      className="h-[32px] px-[14px] bg-[#162E55] shadow-[0px_4px_20px_rgba(28,46,90,0.3)] hover:bg-[#1C2E5A] text-white rounded-[12px] font-['Chillax'] font-semibold text-[12px] leading-[16px] flex items-center gap-[6px] transition"
                    >
                      <Plus className="w-[12px] h-[12px]" />
                      Add Note
                    </Link>
                  )}
                </div>

                {sortedPosts.length === 0 ? (
                  <div className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] py-[32px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
                    No updates published yet — check back during the event.
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-[12px]">
                    {sortedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] p-[16px] flex flex-col gap-[10px]"
                      >
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-[10px]">
                            <div className="w-[28px] h-[28px] rounded-[12px] bg-[#162E55] text-white flex items-center justify-center shrink-0">
                              <FileText className="w-[13px] h-[13px]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] text-[#0E1726]">
                                {post.title}
                              </span>
                              <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590]">
                                OAK Foundation Team
                              </span>
                            </div>
                          </div>
                          <div className="px-[8px] py-[4px] bg-[#EEF1F5] rounded-[8px] shrink-0">
                            <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590]">
                              {formatPostDate(post.event_date)}
                            </span>
                          </div>
                        </div>
                        <p className="font-['Inter'] font-normal text-[14px] leading-[23px] text-[#0E1726] pt-[10px]">
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 2: Photo Gallery Grid — real photos only, no
                  stock-photo fallback. Empty state shown when none exist
                  yet, matching the "Session Notes" empty state above. */}
              <section className="w-full flex flex-col gap-[12px] pt-[24px]">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <ImageIcon className="w-[17px] h-[17px] text-[#1C2E5A]" />
                    <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                      Photo Gallery
                    </h2>
                  </div>
                  <div className="px-[10px] py-[4px] bg-[#EEF1F5] rounded-[8px]">
                    <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590]">
                      {allPhotos.length} photos
                    </span>
                  </div>
                </div>

                {allPhotos.length === 0 ? (
                  <div className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] py-[32px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
                    No photos uploaded yet — check back during the event.
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-2 gap-[10px]">
                    {allPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-[16px] overflow-hidden bg-[#E5E8EE] aspect-[4/3] flex flex-col justify-center items-center"
                      >
                        <img
                          src={photo.photoUrl}
                          alt={photo.caption ?? "Convening photo"}
                          className="w-full h-full object-cover"
                        />
                        {photo.caption && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 p-[12px] flex items-end">
                            <p className="font-['Inter'] text-[11px] leading-[14px] text-white line-clamp-2">
                              {photo.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 3: Key Takeaways — real key_takeaways rows,
                  published by the Lead Organizer from
                  /admin/documentation. */}
              <section className="w-full flex flex-col items-start pt-[24px]">
                <div className="w-full flex flex-row items-center gap-[8px] h-[28px]">
                  <Lightbulb className="w-[17px] h-[17px] text-[#1C2E5A]" />
                  <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Key Takeaways
                  </h2>
                </div>

                <div className="w-full pt-[12px] flex flex-col items-start">
                  {keyTakeaways.length === 0 ? (
                    <div className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] py-[32px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
                      No takeaways published yet.
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-start p-[20px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px]">
                      {keyTakeaways.map((takeaway, idx) => (
                        <div
                          key={takeaway.id}
                          className={`w-full flex flex-row items-start ${idx === 0 ? "" : "pt-[14px]"} gap-[12px]`}
                        >
                          <div className="flex flex-row items-start pt-[2px] w-[20px] h-[22px]">
                            <div className="flex flex-row justify-center items-center w-[20px] h-[20px] bg-[#162E55] rounded-full">
                              <span className="font-['Inter'] font-bold text-[9px] leading-[14px] text-white uppercase">
                                {idx + 1}
                              </span>
                            </div>
                          </div>
                          <p className="font-['Inter'] font-normal text-[14px] leading-[23px] text-[#0E1726] flex-1">
                            {takeaway.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Section 4: Resources — real resources rows + uploaded
                  files from the "resources" storage bucket. */}
              <section className="w-full flex flex-col pt-[24px]">
                <div className="w-full flex flex-row items-center gap-[8px] h-[28px] mb-[12px]">
                  <FileDown className="w-[17px] h-[17px] text-[#1C2E5A]" />
                  <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Resources
                  </h2>
                </div>

                {resources.length === 0 ? (
                  <div className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] py-[32px] text-center font-['Inter'] text-[14px] text-[#6B7590]">
                    No resources uploaded yet.
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-start gap-[8px]">
                    {resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex flex-row items-center p-[16px] gap-[14px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] hover:bg-[#F9FAFB] transition-colors group"
                      >
                        <div className="flex flex-row justify-center items-center w-[40px] h-[40px] bg-[#EEF1F5] rounded-[16px] flex-shrink-0">
                          <FileText className="w-[16px] h-[16px] text-[#1C2E5A]" />
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="font-['Inter'] font-medium text-[14px] leading-[20px] text-[#0E1726] truncate w-full">
                            {res.title}
                          </span>
                          {res.meta && (
                            <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590]">
                              {res.meta}
                            </span>
                          )}
                        </div>
                        <FileDown className="w-[15px] h-[15px] text-[#6B7590] group-hover:text-[#0E1726] transition flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}