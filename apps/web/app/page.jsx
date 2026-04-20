"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookmarks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookmarks", { cache: "no-store" });
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to load bookmarks");
        setBookmarks([]);
      } else {
        setBookmarks(result.data || []);
      }
    } catch (err) {
      setError("Failed to load bookmarks");
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBookmark(id) {
    try {
      const response = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();

      if (!result.success) {
        alert(result.error || "Delete failed");
        return;
      }

      await loadBookmarks();
    } catch (err) {
      alert("Delete failed");
    }
  }

  useEffect(() => {
    void loadBookmarks();
  }, []);

  return (
    <main className="container-page">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">LinkLocker</h1>
        <Link
          href="/add"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Bookmark
        </Link>
      </div>

      {loading && <p>Loading bookmarks...</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {!loading && !error && bookmarks.length === 0 && (
        <p className="rounded bg-white p-4 shadow">No bookmarks yet.</p>
      )}

      <div className="grid gap-4">
        {bookmarks.map((bookmark) => (
          <article key={bookmark.id} className="rounded bg-white p-4 shadow">
            <h2 className="text-xl font-semibold">
              {bookmark.title || bookmark.url}
            </h2>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline"
            >
              {bookmark.url}
            </a>
            <p className="mt-2 text-sm text-slate-600">
              Tags: {bookmark.tags || ""}
            </p>
            <button
              type="button"
              onClick={() => void deleteBookmark(bookmark.id)}
              className="mt-3 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
