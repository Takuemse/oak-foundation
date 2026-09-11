"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Image as ImageIcon, 
  Lightbulb, 
  FileDown, 
  Plus, 
  ArrowUpRight 
} from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

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
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-[672px] max-w-[672px] min-h-screen px-[32px] py-[40px] flex flex-col items-start gap-[20px]">
          
          {/* Header Section */}
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Programme
            </h1>
            <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              OAK Partner Convening 2026
            </p>
          </div>

          {/* Segmented Navigation Control */}
          <div className="w-[608px] h-[40px] bg-[#E5E8EE] p-[4px] rounded-[16px] flex items-center justify-between">
            <Link
              href="/programme"
              className="w-[140px] h-[32px] rounded-[12px] text-[#6B7590] hover:text-[#0E1726] capitalize transition flex items-center justify-center text-[12px] font-semibold font-['Avenir_Next_LT_Pro',sans-serif]"
            >
              Schedule
            </Link>
            
            <button
              type="button"
              className="w-[116px] h-[32px] bg-white rounded-[12px] shadow-[0px_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center font-['Avenir_Next_LT_Pro',sans-serif] font-semibold text-[12px] leading-[16px] text-[#0E1726] capitalize"
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
              
              {/* Section 1: Session Notes */}
              <section className="w-full flex flex-col gap-[12px]">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <FileText className="w-[17px] h-[17px] text-[#1C2E5A]" />
                    <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                      Session Notes
                    </h2>
                  </div>
                  <button className="h-[32px] px-[14px] bg-[#162E55] shadow-[0px_4px_20px_rgba(28,46,90,0.3)] hover:bg-[#1C2E5A] text-white rounded-[12px] font-['Chillax'] font-semibold text-[12px] leading-[16px] flex items-center gap-[6px] transition">
                    <Plus className="w-[12px] h-[12px]" />
                    Add Note
                  </button>
                </div>

                <div className="w-full flex flex-col gap-[12px]">
                  {SAMPLE_NOTES.map((note) => (
                    <div
                      key={note.id}
                      className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] p-[16px] flex flex-col gap-[10px]"
                    >
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                          <div className="w-[28px] h-[28px] rounded-[12px] bg-[#162E55] text-white font-['Inter'] font-bold text-[10px] leading-[15px] flex items-center justify-center uppercase">
                            {note.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] text-[#0E1726]">
                              {note.author_name}
                            </span>
                            <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590]">
                              {note.author_org}
                            </span>
                          </div>
                        </div>
                        <div className="px-[8px] py-[4px] bg-[#EEF1F5] rounded-[8px]">
                          <span className="font-['Inter'] font-normal text-[10px] leading-[15px] text-[#6B7590]">
                            {note.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className="font-['Inter'] font-normal text-[14px] leading-[23px] text-[#0E1726] pt-[10px]">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
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

                <div className="w-full grid grid-cols-2 gap-[10px]">
                  {(posts.flatMap((p) => p.photos).length > 0
                    ? posts.flatMap((p) => p.photos)
                    : DEFAULT_PHOTOS
                  ).map((photo, i) => (
                    <div
                      key={photo.id || i}
                      className="group relative w-full h-[224.25px] rounded-[16px] overflow-hidden bg-[#E5E8EE] flex flex-col justify-center items-center"
                    >
                      <img
                        src={photo.photoUrl}
                        alt={photo.caption ?? "Convening photo"}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
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
              </section>

              {/* Section 3: Key Takeaways */}
              <section className="w-full flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px]">
                  <Lightbulb className="w-[17px] h-[17px] text-[#1C2E5A]" />
                  <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Key Takeaways
                  </h2>
                </div>

                <div className="w-full p-5 bg-white border border-[rgba(28,46,90,0.1)] rounded-[24px] shadow-[0_1px_3px_rgba(28,46,90,0.05),0_4px_16px_rgba(28,46,90,0.07)] flex flex-col gap-3.5">
                  {KEY_TAKEAWAYS.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#162E55] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-['Inter'] font-normal text-sm leading-[23px] text-[#0E1726]">
                        {takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 4: Resources & Downloads */}
              <section className="w-full flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px]">
                  <FileDown className="w-[17px] h-[17px] text-[#1C2E5A]" />
                  <h2 className="font-chillax font-semibold text-[18px] leading-[28px] text-[#0E1726]">
                    Resources
                  </h2>
                </div>

                <div className="w-full flex flex-col gap-2">
                  {RESOURCES.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-[74px] p-4 bg-white border border-[rgba(28,46,90,0.1)] rounded-[24px] shadow-[0_1px_3px_rgba(28,46,90,0.05),0_4px_16px_rgba(28,46,90,0.07)] flex items-center gap-3.5 hover:bg-[#F9FAFB] transition-colors text-left group focus:outline-none"
                    >
                      <div className="w-10 h-10 bg-[#EEF1F5] rounded-[16px] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#1C2E5A]" />
                      </div>
                      <div className="flex flex-col flex-grow min-w-0">
                        <span className="font-['Inter'] font-medium text-sm leading-[20px] text-[#0E1726] truncate">
                          {res.title}
                        </span>
                        <span className="font-['Inter'] font-normal text-xs leading-[16px] text-[#6B7590] mt-[2px]">
                          {res.meta}
                        </span>
                      </div>
                      <ArrowUpRight className="w-[15px] h-[15px] text-[#6B7590] group-hover:text-[#0E1726] transition flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </section>

            </div>
          )}

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

const SAMPLE_NOTES = [
  {
    id: "1",
    initials: "MS",
    author_name: "Maria Schmidt",
    author_org: "Open Society Foundations",
    timestamp: "Day 1 · 14:32",
    content: "The rights-based approaches session surfaced strong demand for a shared learning platform. OSF will follow up with MENA Rights Group on joint programming opportunities in the Mediterranean region.",
  },
  {
    id: "2",
    initials: "JO",
    author_name: "James Odhiambo",
    author_org: "OAK Foundation",
    timestamp: "Day 1 · 16:50",
    content: "Digital Rights breakout: participants want a working group to share tools for operating in restricted digital environments. Interested orgs: Digital Frontiers, Access Now, EFF.",
  },
  {
    id: "3",
    initials: "AD",
    author_name: "Awa Diallo",
    author_org: "Geneva Secretariat",
    timestamp: "Day 2 · 11:15",
    content: "Strategic communications workshop highly rated. Rashida's adaptive messaging framework is directly applicable across 60% of the portfolio. Requesting follow-up toolkit.",
  },
  {
    id: "4",
    initials: "PAD",
    author_name: "Prof. Amara Diallo",
    author_org: "Sciences Po Paris",
    timestamp: "Day 2 · 16:00",
    content: "Fishbowl revealed consensus: philanthropy needs to accept longer time horizons (10+ years) and better share learning. Key ask: OAK to publish failure cases alongside success stories.",
  },
];

const DEFAULT_PHOTOS: Photo[] = [
  { id: "1", caption: "Opening plenary session", photoUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80" },
  { id: "2", caption: "Roundtable discussion", photoUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80" },
  { id: "3", caption: "Workshop in progress", photoUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80" },
  { id: "4", caption: "Welcome reception dinner", photoUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
  { id: "5", caption: "Keynote speaker", photoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" },
  { id: "6", caption: "Breakout group discussion", photoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80" },
];

const KEY_TAKEAWAYS = [
  "Philanthropy needs to accept 10+ year time horizon",
  "Shared learning infrastructure is the most requested element",
  "Digital rights must be integrated into all program strategies",
  "Flexible, core funding remains critical for grantee resilience",
  "Rights-based framing significantly improves grantee advocacy outcomes",
  "Peer exchange is rated more valuable than expert-led sessions",
];

const RESOURCES = [
  { title: "Opening Plenary Presentation", meta: "PDF · 3.2 MB · Day 1", url: "#" },
  { title: "OAK Portfolio Overview 2024–26", meta: "PDF · 1.8 MB · Day 2", url: "#" },
  { title: "Strategic Communications Toolkit", meta: "PDF · 4.5 MB · Day 2", url: "#" },
  { title: "Action Planning Workbook", meta: "DOCX · 0.9 MB · Day 3", url: "#" },
  { title: "Partner Contact Directory", meta: "XLSX · 0.4 MB · All Days", url: "#" },
  { title: "Photo Gallery (High Res)", meta: "ZIP · 184 MB · All Days", url: "#" },
];