"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { NovelEditorWrapper } from "@/components/editor/NovelEditorWrapper";

export function MainLayout() {
  return (
    <div className="h-dvh flex flex-col">
      <Header />

      <div className="flex-1 flex min-h-0">
        <Sidebar />

        {/* Editor — takes all remaining space */}
        <div className="flex-1 flex min-w-0">
          <NovelEditorWrapper />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
