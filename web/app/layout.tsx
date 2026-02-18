import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Natives Docs Viewer",
  description: "軽量な Next.js 製ネイティブ関数ドキュメントビューア",
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
