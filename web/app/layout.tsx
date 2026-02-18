import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Natives Docs Viewer",
  description: "Lightweight Next.js native function documentation explorer",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
