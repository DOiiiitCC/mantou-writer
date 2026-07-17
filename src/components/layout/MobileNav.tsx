"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BookOpen, Bot, Pencil, List } from "lucide-react";

export function MobileNav() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-[#e8ddc4] dark:border-zinc-800 bg-[#fdf5e1]/95 dark:bg-zinc-950/95 backdrop-blur z-40">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-0.5 text-[var(--accent-light)]"
        >
          <Pencil className="w-5 h-5" />
          <span className="text-[10px]">写作</span>
        </button>

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex flex-col items-center gap-0.5",
            sidebarOpen ? "text-[var(--accent-light)]" : "text-[#8a7e65] dark:text-zinc-500"
          )}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px]">目录</span>
        </button>

        <button className="flex flex-col items-center gap-0.5 text-[#8a7e65] dark:text-zinc-500">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">作品</span>
        </button>

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex flex-col items-center gap-0.5",
            sidebarOpen ? "text-[var(--accent-light)]" : "text-[#8a7e65] dark:text-zinc-500"
          )}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px]">AI</span>
        </button>
      </div>
    </nav>
  );
}
