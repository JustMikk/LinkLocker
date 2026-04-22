"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  async function loadBookmarks(filter = tagFilter) {
    setLoading(true);
    setError("");

    try {
      const query = filter.trim()
        ? `?tag=${encodeURIComponent(filter.trim())}`
        : "";
      const response = await fetch(`/api/bookmarks${query}`, {
        cache: "no-store",
      });
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

  async function deleteBookmark(id, title) {
    const confirmed = window.confirm(`Delete \"${title || "this bookmark"}\"?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
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
    void loadBookmarks(tagFilter);
  }, [tagFilter]);

  const noResultsMessage = tagFilter.trim()
    ? "No bookmarks with this tag."
    : "No bookmarks yet. Add one to get started.";

  return (
    <main className="container-page">
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Your bookmarks
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Filter by tag, edit bookmarks, and keep one shared SQLite database
              across web and CLI.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-[280px]">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Filter by tag
              </label>
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="work, cbsd, important"
              />
            </div>
            <button
              type="button"
              onClick={() => setTagFilter("")}
              className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear filter
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600 shadow-sm">
          Loading bookmarks...
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && bookmarks.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          {noResultsMessage}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <article
            key={bookmark.id}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
              {bookmark.title || bookmark.url}
            </h2>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block truncate text-sm text-blue-700 underline decoration-blue-300 underline-offset-2"
              title={bookmark.url}
            >
              {bookmark.url}
            </a>

            <div className="mt-3 flex flex-wrap gap-2">
              {(bookmark.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={`${bookmark.id}-${tag}`}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-slate-600">
              {bookmark.notes || "No notes provided."}
            </p>

            <div className="mt-4 flex items-center gap-2 pt-2">
              <Link
                href={`/edit/${bookmark.id}`}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => void deleteBookmark(bookmark.id, bookmark.title)}
                className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
