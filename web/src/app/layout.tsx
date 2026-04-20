import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MNSU Honors — Plan of Study Dashboard",
  description: "Minnesota State University Mankato Honors Program student plan of study tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-mnsu-maroon text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <Link href="/" className="flex items-center gap-3 hover:opacity-90">
                <div className="w-10 h-10 bg-mnsu-gold rounded flex items-center justify-center font-serif font-bold text-mnsu-maroon text-lg">
                  M
                </div>
                <div>
                  <div className="font-serif font-bold text-lg leading-tight">MNSU Honors Program</div>
                  <div className="text-mnsu-gold-light text-xs leading-tight">Plan of Study Dashboard</div>
                </div>
              </Link>
            </div>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-mnsu-gold transition-colors">Overview</Link>
              <Link href="/issues" className="hover:text-mnsu-gold transition-colors">Parse Issues</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 mt-16 py-6 text-center text-xs text-gray-400">
          Minnesota State University Mankato Honors Program — Internal Tool
        </footer>
      </body>
    </html>
  );
}
