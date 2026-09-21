"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";
import AdminSidebar from "@/app/components/AdminSidebar";

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

type Takeaway = {
  id: string;
  content: string;
  display_order: number;
};

type Resource = {
  id: string;
  title: string;
  meta: string | null;
  storage_path: string;
  display_order: number;
  fileUrl: string;
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

  // --- Key Takeaways ---
  const [takeaways, setTakeaways] = useState<Takeaway[]>([]);
  const [newTakeaway, setNewTakeaway] = useState("");
  const [savingTakeaway, setSavingTakeaway] = useState(false);

  // --- Resources ---
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceForm, setResourceForm] = useState({ title: "", meta: "" });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [savingResource, setSavingResource] = useState(false);

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

      const { data: takeawayRows, error: takeawayErr } = await supabase
        .from("key_takeaways")
        .select("id, content, display_order")
        .order("display_order", { ascending: true });

      if (takeawayErr) {
        setError(takeawayErr.message);
        setLoading(false);
        return;
      }
      setTakeaways(takeawayRows ?? []);

      const { data: resourceRows, error: resourceErr } = await supabase
        .from("resources")
        .select("id, title, meta, storage_path, display_order")
        .order("display_order", { ascending: true });

      if (resourceErr) {
        setError(resourceErr.message);
        setLoading(false);
        return;
      }
      setResources(
        (resourceRows ?? []).map((r) => ({
          ...r,
          fileUrl: supabase.storage.from("resources").getPublicUrl(r.storage_path).data.publicUrl,
        }))
      );

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

  // --- Key Takeaways handlers ---

  async function handleAddTakeaway(e: React.FormEvent) {
    e.preventDefault();
    if (!newTakeaway.trim()) return;
    setSavingTakeaway(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const nextOrder = takeaways.length > 0 ? Math.max(...takeaways.map((t) => t.display_order)) + 1 : 0;

    const { error } = await supabase.from("key_takeaways").insert({
      content: newTakeaway.trim(),
      display_order: nextOrder,
      created_by: user?.id ?? null,
    });

    setSavingTakeaway(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNewTakeaway("");
    setRefreshKey((k) => k + 1);
  }

  async function handleDeleteTakeaway(id: string) {
    if (!confirm("Delete this takeaway?")) return;
    setDeletingId(id);
    setError(null);

    const { error } = await supabase.from("key_takeaways").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    setRefreshKey((k) => k + 1);
  }

  // --- Resources handlers ---

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!resourceForm.title.trim() || !resourceFile) return;
    setSavingResource(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ext = resourceFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(path, resourceFile);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const nextOrder = resources.length > 0 ? Math.max(...resources.map((r) => r.display_order)) + 1 : 0;

      const { error: insertError } = await supabase.from("resources").insert({
        title: resourceForm.title.trim(),
        meta: resourceForm.meta.trim() || null,
        storage_path: path,
        display_order: nextOrder,
        created_by: user?.id ?? null,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setResourceForm({ title: "", meta: "" });
      setResourceFile(null);
      setRefreshKey((k) => k + 1);
    } finally {
      setSavingResource(false);
    }
  }

  async function handleDeleteResource(resource: Resource) {
    if (!confirm("Delete this resource?")) return;
    setDeletingId(resource.id);
    setError(null);

    const { error: dbError } = await supabase.from("resources").delete().eq("id", resource.id);

    if (dbError) {
      setError(dbError.message);
      setDeletingId(null);
      return;
    }

    await supabase.storage.from("resources").remove([resource.storage_path]);

    setDeletingId(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AdminSidebar />

      <div className="flex-1 flex justify-center">
        {/* pt-8/pb-[104px] on mobile: breathing room below the fixed
            header and clearance above the fixed bottom nav. */}
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-8 pb-[104px] md:px-8 md:py-10 flex flex-col items-start gap-[20px]">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Manage Documentation
            </h1>
            <p className="font-['Inter'] text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              Publish daily event notes and photos
            </p>
          </div>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[16px] px-4 py-3">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-5 flex flex-col gap-3"
          >
            <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
              New Post
            </span>

            <select
              value={form.event_date}
              onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
              className="w-full h-[44px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[14px] text-[#0E1726] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
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
              className="w-full h-[44px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
            />

            <textarea
              required
              placeholder="Notes / summary"
              rows={4}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full rounded-[12px] bg-[#EEF1F5] px-3 py-2.5 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 resize-none border-0"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full h-[48px] mt-1 bg-[#162E55] text-white rounded-[14px] font-chillax font-semibold text-[14px] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] hover:opacity-95 disabled:opacity-50 transition"
            >
              {saving ? "Publishing…" : "Publish Post"}
            </button>
          </form>

          {loading ? (
            <p className="font-['Inter'] text-[13px] text-[#6B7590]">Loading…</p>
          ) : (
            <div className="w-full flex flex-col gap-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-['Inter'] text-[11px] text-[#A0AEC0]">{post.event_date}</p>
                      <p className="font-['Inter'] font-semibold text-[14px] text-[#0E1726]">{post.title}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="font-['Inter'] text-[12px] font-medium text-red-500 hover:text-red-700 flex-shrink-0"
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
                            className="w-full aspect-square object-cover rounded-[12px]"
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

          {/* Key Takeaways */}
          <div className="w-full flex flex-col items-start pt-2">
            <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] mb-2">
              Key Takeaways
            </span>
            <form
              onSubmit={handleAddTakeaway}
              className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 mb-3 flex flex-col gap-3"
            >
              <textarea
                required
                placeholder="Add a takeaway…"
                rows={2}
                value={newTakeaway}
                onChange={(e) => setNewTakeaway(e.target.value)}
                className="w-full rounded-[12px] bg-[#EEF1F5] px-3 py-2.5 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 resize-none border-0"
              />
              <button
                type="submit"
                disabled={savingTakeaway}
                className="w-full h-[44px] bg-[#162E55] text-white rounded-[14px] font-chillax font-semibold text-[13px] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] hover:opacity-95 disabled:opacity-50 transition"
              >
                {savingTakeaway ? "Adding…" : "Add Takeaway"}
              </button>
            </form>

            {!loading && takeaways.length > 0 && (
              <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] rounded-[24px] divide-y divide-[rgba(28,46,90,0.08)]">
                {takeaways.map((t, i) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 p-4">
                    <p className="font-['Inter'] text-[14px] text-[#0E1726]">
                      <span className="text-[#A0AEC0] mr-1.5">{i + 1}.</span>
                      {t.content}
                    </p>
                    <button
                      onClick={() => handleDeleteTakeaway(t.id)}
                      disabled={deletingId === t.id}
                      className="font-['Inter'] text-[12px] font-medium text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      {deletingId === t.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="w-full flex flex-col items-start pt-2">
            <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] mb-2">
              Resources
            </span>
            <form
              onSubmit={handleAddResource}
              className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-4 mb-3 flex flex-col gap-3"
            >
              <input
                required
                placeholder="Title (e.g. Opening Plenary Presentation)"
                value={resourceForm.title}
                onChange={(e) => setResourceForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full h-[44px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
              />
              <input
                placeholder="Meta (e.g. PDF · 3.2 MB · Day 1) — optional"
                value={resourceForm.meta}
                onChange={(e) => setResourceForm((f) => ({ ...f, meta: e.target.value }))}
                className="w-full h-[44px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
              />
              <input
                required
                type="file"
                onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
                className="w-full font-['Inter'] text-[13px] text-[#6B7590]"
              />
              <button
                type="submit"
                disabled={savingResource}
                className="w-full h-[44px] bg-[#162E55] text-white rounded-[14px] font-chillax font-semibold text-[13px] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] hover:opacity-95 disabled:opacity-50 transition"
              >
                {savingResource ? "Uploading…" : "Add Resource"}
              </button>
            </form>

            {!loading && resources.length > 0 && (
              <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] rounded-[24px] divide-y divide-[rgba(28,46,90,0.08)]">
                {resources.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-['Inter'] font-medium text-[14px] text-[#162E55] hover:underline truncate block"
                      >
                        {r.title}
                      </a>
                      {r.meta && (
                        <p className="font-['Inter'] text-[11px] text-[#A0AEC0] mt-0.5">{r.meta}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteResource(r)}
                      disabled={deletingId === r.id}
                      className="font-['Inter'] text-[12px] font-medium text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      {deletingId === r.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/documentation"
            className="w-full text-center border border-[rgba(28,46,90,0.1)] text-[#6B7590] bg-white rounded-[14px] py-3 font-['Inter'] text-[12px] font-semibold hover:bg-[#EEF1F5] transition"
          >
            View Public Documentation
          </Link>
        </main>
      </div>
    </div>
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
      className={`mt-3 border-2 border-dashed rounded-[16px] px-3 py-4 text-center font-['Inter'] text-[12px] transition ${
        isDragging ? "border-[#162E55] bg-[#EEF1F5] text-[#0E1726]" : "border-[rgba(28,46,90,0.15)] text-[#A0AEC0]"
      }`}
    >
      {uploading ? (
        "Uploading…"
      ) : (
        <>
          Drag a photo here, or{" "}
          <label className="text-[#162E55] font-medium cursor-pointer">
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