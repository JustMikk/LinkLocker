"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBookmarkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const notesLimit = 250;

  function validateUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return "URL is required.";
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "URL must start with http:// or https://";
    }

    return "";
  }

  useEffect(() => {
    async function loadBookmark() {
      try {
        const response = await fetch(`/api/bookmarks/${id}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!result.success) {
          setError(result.error || "Bookmark not found");
          return;
        }

        setUrl(result.data.url || "");
        setTitle(result.data.title || "");
        setTags(result.data.tags || "");
        setNotes(result.data.notes || "");
      } catch (err) {
        setError("Failed to load bookmark");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void loadBookmark();
    }
  }, [id]);

  async function onSubmit(event) {
    event.preventDefault();
    const urlError = validateUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, tags, notes }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to update bookmark");
        return;
      }

      setSuccess("Bookmark updated. Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError("Failed to update bookmark");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="container-page">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading bookmark...
        </div>
      </main>
    );
  }

  return (
    <main className="container-page">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Bookmark</h1>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 underline underline-offset-4"
        >
          Cancel
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            URL (required)
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setError(validateUrl(url))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Tags (optional)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">
              Notes (optional)
            </label>
            <span className="text-xs text-slate-500">
              {notes.length}/{notesLimit}
            </span>
          </div>
          <textarea
            value={notes}
            maxLength={notesLimit}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            rows={5}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            {success}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Update Bookmark"}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
