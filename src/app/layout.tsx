import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "馒头写作 — AI 智能写作助手",
  description:
    "基于 Claude、DeepSeek、豆包等 AI 模型的智能写作平台，支持小说、故事、文章创作",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "馒头写作",
  },
  icons: {
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-[#fef7e8] dark:bg-zinc-950 text-[#3d3522] dark:text-zinc-200 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
