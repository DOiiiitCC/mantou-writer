"use client";

import { useStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { Bot, Sun, Moon, Download, PanelLeft } from "lucide-react";
import { toast } from "sonner";

export function Header() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const content = useStore((s) => s.content);
  const { theme, setTheme } = useTheme();

  const handleExport = () => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.textContent || div.innerText || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "星辰大海.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已导出 TXT 文件");
  };

  return (
    <header className="flex items-center justify-between h-14 px-3 md:px-4 border-b border-[#e8ddc4] dark:border-zinc-800 bg-[#fef7e8]/90 dark:bg-zinc-950/90 backdrop-blur flex-shrink-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={toggleSidebar}>
          <PanelLeft className="w-4 h-4" />
        </Button>
        <div className="hidden sm:flex items-center gap-1.5 text-sm">
          <span className="text-[#8a7e65] dark:text-zinc-500">星辰大海</span>
          <span className="text-[#c4b896] dark:text-zinc-600">/</span>
          <span className="text-[#5a4e35] dark:text-zinc-300">第一章</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span className="hidden sm:inline text-xs text-[#b8a88a] dark:text-zinc-600 mr-2 tabular-nums">
          2,341 字
        </span>

        <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4" />
        </Button>

        <Button
          variant={sidebarOpen ? "primary" : "ghost"}
          size="sm"
          onClick={toggleSidebar}
          className="gap-1.5"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI 助手</span>
        </Button>
      </div>
    </header>
  );
}
