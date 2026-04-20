import "./globals.css";

export const metadata = {
  title: "LinkLocker",
  description: "Bookmark manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}