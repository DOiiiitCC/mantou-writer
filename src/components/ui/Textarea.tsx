"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[#e0d5b8] dark:border-zinc-700",
        "bg-[#f0e8d0] dark:bg-zinc-800/50 px-3 py-2 text-sm",
        "text-[#3d3522] dark:text-zinc-200",
        "placeholder:text-[#b8a88a] dark:placeholder:text-zinc-500",
        "focus:outline-none focus:ring-1 focus:ring-[var(--accent-light)] focus:border-[var(--accent-light)]",
        "resize-none",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
