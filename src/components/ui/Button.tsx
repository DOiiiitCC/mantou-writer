"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm",
  secondary:
    "bg-[#f0e8d0] dark:bg-zinc-800 text-[#5a4e35] dark:text-zinc-200 hover:bg-[#e8ddc4] dark:hover:bg-zinc-700 border border-[#e0d5b8] dark:border-zinc-700",
  ghost:
    "text-[#8a7e65] dark:text-zinc-400 hover:text-[#5a4e35] dark:hover:text-zinc-200 hover:bg-[#f0e8d0] dark:hover:bg-zinc-800",
  outline:
    "border border-[#e0d5b8] dark:border-zinc-700 text-[#5a4e35] dark:text-zinc-300 hover:bg-[#f0e8d0] dark:hover:bg-zinc-800",
};

const sizes = {
  sm: "px-2.5 py-1 text-xs rounded-md",
  md: "px-3.5 py-1.5 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-sm rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-light)] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
