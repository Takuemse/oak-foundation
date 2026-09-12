"use client";

import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

    // Client-side check only decides whether to *show* the Add Note
    // shortcut. The real gate is proxy.ts protecting /admin/documentation.
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(!!data.user);
    });
  }, []);

  const sortedPosts = [...posts].sort((a, b) => b.event_date.localeCompare(a.event_date));

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

              {/* Section 2: Photo Gallery Grid */}
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
                      {posts.reduce((acc, p) => acc + p.photos.length, 0) || 6} photos
                    </span>
                  </div>
                </div>

                <div className="w-full relative min-h-[704.75px]">
                  <div className="w-full grid grid-cols-2 gap-[10px]">
                    {(posts.flatMap((p) => p.photos).length > 0
                      ? posts.flatMap((p) => p.photos)
                      : DEFAULT_PHOTOS
                    ).map((photo, i) => {
                      const positions = [
                        { left: "0px", top: "0px" },
                        { left: "309px", top: "0px" },
                        { left: "0px", top: "234.25px" },
                        { left: "309px", top: "234.25px" },
                        { left: "0px", top: "468.5px" },
                        { left: "309px", top: "468.5px" },
                      ];
                      const pos = positions[i % positions.length];

                      return (
                        <div
                          key={photo.id || i}
                          style={{
                            position: "absolute",
                            left: pos.left,
                            top: pos.top,
                            width: "299px",
                            height: "224.25px",
                          }}
                          className="group relative rounded-[16px] overflow-hidden bg-[#E5E8EE] flex flex-col justify-center items-center"
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
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Section 3: Key Takeaways */}
              <section className="w-[608px] flex flex-col items-start pt-[24px]">
                <div className="w-[608px] flex flex-row items-center gap-[8px] h-[28px]">
                  <Lightbulb className="w-[17px] h-[17px] text-[#1C2E5A]" />
                  <h2 className="w-[140px] h-[28px] font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Key Takeaways
                  </h2>
                </div>

                <div className="w-[608px] pt-[12px] flex flex-col items-start">
                  <div className="box-border flex flex-col items-start p-[20px] w-[608px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px]">
                    {KEY_TAKEAWAYS.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className={`w-[566px] flex flex-row items-start ${idx === 0 ? '' : 'pt-[14px]'} gap-[12px]`}
                      >
                        <div className="flex flex-row items-start pt-[2px] w-[20px] h-[22px]">
                          <div className="flex flex-row justify-center items-center w-[20px] h-[20px] bg-[#162E55] rounded-[33554432px]">
                            <span className="font-['Inter'] font-bold text-[9px] leading-[14px] text-white uppercase">
                              {idx + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start w-auto flex-grow">
                          <p className="font-['Inter'] font-normal text-[14px] leading-[23px] text-[#0E1726]">
                            {takeaway}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 4: Resources & Downloads */}
              <section className="w-full flex flex-col pt-[24px]">
                <div className="w-[608px] flex flex-row items-center gap-[8px] h-[28px] mb-[12px]">
                  <FileDown className="w-[17px] h-[17px] text-[#1C2E5A]" />
                  <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Resources
                  </h2>
                </div>

                <div className="w-[608px] flex flex-col items-start">
                  {RESOURCES.map((res, i) => (
                    <div
                      key={i}
                      style={{ order: i }}
                      className={`w-[608px] ${i === 0 ? '' : 'pt-[8px]'}`}
                    >
                      
                       <a href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-border flex flex-row items-center p-[16px] gap-[14px] w-[608px] h-[74px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] hover:bg-[#F9FAFB] transition-colors group focus:outline-none"
                      >
                        <div className="flex flex-row justify-center items-center w-[40px] h-[40px] bg-[#EEF1F5] rounded-[16px] flex-shrink-0">
                          <FileText className="w-[16px] h-[16px] text-[#1C2E5A]" />
                        </div>
                        <div className="flex flex-col items-start w-[491px] h-[38px] flex-grow">
                          <div className="flex flex-col items-start w-full h-[20px]">
                            <span className="font-['Inter'] font-medium text-[14px] leading-[20px] text-[#0E1726] truncate w-full">
                              {res.title}
                            </span>
                          </div>
                          <div className="flex flex-col items-start w-full h-[18px] pt-[2px]">
                            <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590]">
                              {res.meta}
                            </span>
                          </div>
                        </div>
                        <FileDown className="w-[15px] h-[15px] text-[#6B7590] group-hover:text-[#0E1726] transition flex-shrink-0 ml-auto" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const DEFAULT_PHOTOS: Photo[] = [
  { id: "1", caption: "Opening Plenary Session", photoUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=60" },
  { id: "2", caption: "Collaborative Workshop Tables", photoUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=60" },
  { id: "3", caption: "Panel Discussion on Sustainable Growth", photoUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60" },
  { id: "4", caption: "Networking & Partner Connect", photoUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60" },
  { id: "5", caption: "Closing Remarks & Action Plan", photoUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&auto=format&fit=crop&q=60" },
  { id: "6", caption: "Group Photo of All Partners", photoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60" },
];

const KEY_TAKEAWAYS = [
  "Deepened cross-sector collaboration models for regional development initiatives.",
  "Agreed on unified reporting metrics for 2026–2027 project cycles.",
  "Established decentralized working groups for ongoing policy alignment.",
  "Committed to transparent resource allocation across partner networks.",
  "Finalized schedules for upcoming regional stakeholder meetups.",
];

const RESOURCES = [
  { title: "Opening Plenary Presentation", meta: "PDF · 3.2 MB · Day 1", url: "#" },
  { title: "OAK Portfolio Overview 2024–26", meta: "PDF · 1.8 MB · Day 2", url: "#" },
  { title: "Action Planning Workbook", meta: "DOCX · 0.9 MB · Day 3", url: "#" },
  { title: "Partner Contact Directory", meta: "XLSX · 0.4 MB · All Days", url: "#" },
  { title: "Photo Gallery (High Res)", meta: "ZIP · 184 MB · All Days", url: "#" },
];