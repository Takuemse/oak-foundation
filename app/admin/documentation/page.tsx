"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

type Post = {
  id: string;
  event_date: string;
  title: string;
  content: string;
  is_published: boolean;
};

const EVENT_DATES = ["2026-11-09", "2026-11-10", "2026-11-11"];

export default function AdminDocumentationPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const [form, setForm] = useState({
    event_date: EVENT_DATES[0],
    title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserSupabaseClient();

  async function loadPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("documentation_posts")
      .select("id, event_date, title, content, is_published")
      .order("event_date", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

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
    await loadPosts();
  }

  async function handlePhotoUpload(postId: string, file: File) {
    setError(null);
    setUploadingFor(postId);

    try {
      const ext = file.name.split(".").pop();
      const path = `${postId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase
        .from("documentation_photos")
        .insert({ documentation_post_id: postId, storage_path: path });

      if (insertError) {
        setError(insertError.message);
      }
    } finally {
      setUploadingFor(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto">
      <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-6">
        <h1 className="text-lg font-semibold">Manage Documentation</h1>
        <p className="text-sm text-slate-300 mt-0.5">
          Publish daily event notes and photos
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
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
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] text-slate-400">{post.event_date}</p>
              <p className="text-sm font-semibold text-slate-800">{post.title}</p>
              <label className="inline-block mt-2 text-xs text-blue-600 cursor-pointer">
                {uploadingFor === post.id ? "Uploading…" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingFor === post.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(post.id, file);
                  }}
                />
              </label>
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
    </div>
  );
}