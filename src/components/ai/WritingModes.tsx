"use client";

import { useStore } from "@/lib/store";
import { writeModes, type WriteMode } from "@/lib/ai/prompts";
import { cn } from "@/lib/utils";

export function WritingModes() {
  const writeMode = useStore((s) => s.writeMode);
  const setWriteMode = useStore((s) => s.setWriteMode);

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-zinc-800/50">
      {writeModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setWriteMode(mode.id as WriteMode)}
          className={cn(
            "flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-md text-xs transition-colors",
            writeMode === mode.id
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          )}
          title={mode.description}
        >
          <span className="text-base">{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
