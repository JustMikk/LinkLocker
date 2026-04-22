import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "LinkLocker",
  description: "Bookmark manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-100 text-slate-900">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="container-page flex items-center justify-between py-4">
              <Link
                href="/"
                className="text-xl font-black tracking-tight text-slate-900"
              >
                LinkLocker
              </Link>

              <div className="flex items-center gap-3">
                <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 sm:inline-flex">
                  Shared SQLite database
                </span>
                <Link
                  href="/add"
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Add Bookmark
                </Link>
              </div>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
