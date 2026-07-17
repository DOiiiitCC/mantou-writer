"use client";

import dynamic from "next/dynamic";

const NovelEditor = dynamic(
  () => import("./NovelEditor").then((mod) => ({ default: mod.NovelEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500">
          <span className="inline-block w-3 h-3 rounded-full bg-[var(--accent-light)] animate-pulse" />
          加载编辑器中...
        </div>
      </div>
    ),
  }
);

export function NovelEditorWrapper() {
  return <NovelEditor />;
}
