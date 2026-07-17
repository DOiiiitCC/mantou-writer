import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TipTap / ProseMirror need to be external in server components
  serverExternalPackages: ["@tiptap/pm", "@tiptap/core"],
};

export default nextConfig;
