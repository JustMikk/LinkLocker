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
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

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

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Failed to add bookmark");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-page">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Bookmark</h1>
        <Link href="/" className="text-blue-700 underline">
          Back
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded bg-white p-4 shadow">
        <div>
          <label className="mb-1 block font-medium">URL (required)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="https://example.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Bookmark title"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Tags (optional)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="work,important"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded border p-2"
            rows={4}
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Bookmark"}
        </button>
      </form>
    </main>
  );
}