import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SR Events – E-postassistent (demo)",
  description:
    "Demo av en e-postassistent for SR Events. Lim inn en kundeforespørsel og se hvordan AI-en svarer.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
