"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddBookmarkPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
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
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, tags, notes }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to add bookmark");
        return;
      }

      setSuccess("Bookmark saved. Redirecting to the dashboard...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError("Failed to add bookmark");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-page">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Bookmark</h1>
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
            placeholder="https://example.com"
            required
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
            placeholder="Bookmark title"
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
            placeholder="work,important"
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
            rows={4}
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
            {saving ? "Saving..." : "Save Bookmark"}
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
