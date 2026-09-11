"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";
import {
  UserPlus,
  ScanLine,
  Calendar,
  Globe,
  LayoutGrid,
  FileText,
} from "lucide-react";

type Photo = {
  id: string;
  storage_path: string;
  photoUrl: string;
};

type Post = {
  id: string;
  event_date: string;
  title: string;
  content: string;
  is_published: boolean;
  photos: Photo[];
};

const EVENT_DATES = ["2026-11-09", "2026-11-10", "2026-11-11"];

export default function AdminDocumentationPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Bumped by mutation handlers to re-run the load effect below.
  const [refreshKey, setRefreshKey] = useState(0);

  const [form, setForm] = useState({
    event_date: EVENT_DATES[0],
    title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function loadPosts() {
      const { data: postRows, error: postErr } = await supabase
        .from("documentation_posts")
        .select("id, event_date, title, content, is_published")
        .order("event_date", { ascending: true });

      if (postErr) {
        setError(postErr.message);
        setLoading(false);
        return;
      }

      const ids = (postRows ?? []).map((p) => p.id);
      const { data: photoRows, error: photoErr } = await supabase
        .from("documentation_photos")
        .select("id, documentation_post_id, storage_path")
        .in("documentation_post_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"])
        .order("display_order", { ascending: true });

      if (photoErr) {
        setError(photoErr.message);
        setLoading(false);
        return;
      }

      const withPhotos = (postRows ?? []).map((post) => ({
        ...post,
        photos: (photoRows ?? [])
          .filter((ph) => ph.documentation_post_id === post.id)
          .map((ph) => ({
            id: ph.id,
            storage_path: ph.storage_path,
            photoUrl: supabase.storage.from("photos").getPublicUrl(ph.storage_path).data.publicUrl,
          })),
      }));

      setPosts(withPhotos);
      setLoading(false);
    }
    loadPosts();
  }, [refreshKey]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("documentation_posts").insert({
      event_date: form.event_date,
      title: form.title,
      content: form.content,
      is_published: true,
      published_at: new Date().toISOString(),
      created_by: user?.id ?? null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setForm({ event_date: EVENT_DATES[0], title: "", content: "" });
    setRefreshKey((k) => k + 1);
  }

  async function handlePhotoUpload(postId: string, file: File) {
    setError(null);
    setUploadingFor(postId);

    try {
      const ext = file.name.split(".").pop();
      const path = `${postId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase
        .from("documentation_photos")
        .insert({ documentation_post_id: postId, storage_path: path });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setRefreshKey((k) => k + 1);
    } finally {
      setUploadingFor(null);
    }
  }

  async function handleDeletePhoto(photo: Photo) {
    if (!confirm("Delete this photo?")) return;
    setDeletingId(photo.id);
    setError(null);

    const { error: dbError } = await supabase
      .from("documentation_photos")
      .delete()
      .eq("id", photo.id);

    if (dbError) {
      setError(dbError.message);
      setDeletingId(null);
      return;
    }

    await supabase.storage.from("photos").remove([photo.storage_path]);

    setDeletingId(null);
    setRefreshKey((k) => k + 1);
  }

  async function handleDeletePost(postId: string) {
    if (!confirm("Delete this post and all its photos? This cannot be undone.")) return;
    setDeletingId(postId);
    setError(null);

    const post = posts.find((p) => p.id === postId);

    const { error: dbError } = await supabase
      .from("documentation_posts")
      .delete()
      .eq("id", postId);

    if (dbError) {
      setError(dbError.message);
      setDeletingId(null);
      return;
    }

    if (post && post.photos.length > 0) {
      await supabase.storage.from("photos").remove(post.photos.map((p) => p.storage_path));
    }

    setDeletingId(null);
    setRefreshKey((k) => k + 1);
  }

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
            <SidebarLink icon={UserPlus} label="Register" href="/register" />
            <SidebarLink icon={ScanLine} label="Check In" href="/admin/check-in" />
            <SidebarLink icon={Calendar} label="Programme" href="/programme" />
            <SidebarLink icon={Globe} label="Partners" href="/partners" />
            <SidebarLink icon={LayoutGrid} label="Attendance" href="/admin/attendance" />
            <SidebarLink icon={FileText} label="Documentation" href="/admin/documentation" active />
          </nav>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">
          Harare, Zimbabwe
          <br />
          9–11 March 2026
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-6">
          <h1 className="text-lg font-semibold">Manage Documentation</h1>
          <p className="text-sm text-slate-300 mt-0.5">Publish daily event notes and photos</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">New Post</h2>

          <select
            value={form.event_date}
            onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {EVENT_DATES.map((d, i) => (
              <option key={d} value={d}>
                Day {i + 1} — {d}
              </option>
            ))}
          </select>

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />

          <textarea
            required
            placeholder="Notes / summary"
            rows={4}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0f1e3d] text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish Post"}
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-slate-400">{post.event_date}</p>
                    <p className="text-sm font-semibold text-slate-800">{post.title}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    {deletingId === post.id ? "Deleting…" : "Delete post"}
                  </button>
                </div>

                {post.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {post.photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.photoUrl}
                          alt=""
                          className="w-full aspect-square object-cover rounded-md"
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo)}
                          disabled={deletingId === photo.id}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center hover:bg-red-600"
                          title="Delete photo"
                        >
                          {deletingId === photo.id ? "…" : "✕"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <PhotoDropzone
                  postId={post.id}
                  uploading={uploadingFor === post.id}
                  onUpload={handlePhotoUpload}
                />
              </div>
            ))}
          </div>
        )}

        <Link
          href="/documentation"
          className="block text-center mt-6 border border-slate-200 text-slate-500 rounded-lg py-2 text-xs font-medium hover:bg-white transition"
        >
          View Public Documentation
        </Link>
      </main>
    </div>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
        active ? "bg-[#0f1e3d] text-white" : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      <Icon size={18} strokeWidth={2} />
      {label}
    </Link>
  );
}

function PhotoDropzone({
  postId,
  uploading,
  onUpload,
}: {
  postId: string;
  uploading: boolean;
  onUpload: (postId: string, file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(postId, file);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`mt-3 border-2 border-dashed rounded-lg px-3 py-4 text-center text-xs transition ${
        isDragging ? "border-[#0f1e3d] bg-slate-50 text-slate-700" : "border-slate-200 text-slate-400"
      }`}
    >
      {uploading ? (
        "Uploading…"
      ) : (
        <>
          Drag a photo here, or{" "}
          <label className="text-blue-600 cursor-pointer">
            browse
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(postId, file);
              }}
            />
          </label>
        </>
      )}
    </div>
  );
}