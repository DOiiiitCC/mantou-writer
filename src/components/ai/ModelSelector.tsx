"use client";

import { useStore } from "@/lib/store";
import { modelConfigs, type ModelProvider } from "@/lib/ai/providers";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const btn = "px-2.5 py-1.5 rounded-lg text-xs transition-colors";
const btnLight = "bg-[#f0e8d0] dark:bg-zinc-800/50 border border-[#e0d5b8] dark:border-zinc-700";
const btnHover = "hover:border-[#c4b896] dark:hover:border-zinc-600";
const textMain = "text-[#5a4e35] dark:text-zinc-300";
const textSub = "text-[#8a7e65] dark:text-zinc-500";
const textDim = "text-[#b8a88a] dark:text-zinc-600";
const popupBg = "bg-[#fdf5e1] dark:bg-zinc-900";
const popupBorder = "border-[#e8ddc4] dark:border-zinc-700";
const itemHover = "hover:bg-[#f0e8d0] dark:hover:bg-zinc-800";
const selectedBg = "bg-[var(--accent-soft)] border border-[var(--accent-light)]/20";
const tagBg = "bg-[#e8ddc4] dark:bg-zinc-800";

export function ModelSelector() {
  const provider = useStore((s) => s.provider);
  const modelId = useStore((s) => s.modelId);
  const setProvider = useStore((s) => s.setProvider);
  const setModelId = useStore((s) => s.setModelId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const config = modelConfigs[provider];
  const currentModel = config.models.find((m) => m.id === modelId) || config.models[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn("w-full flex items-center gap-1.5", btn, btnLight, btnHover, textMain)}
      >
        <Sparkles className="w-3 h-3 text-[var(--accent-light)] flex-shrink-0" />
        <span className="truncate">{config.name}</span>
        <span className={textDim}>·</span>
        <span className={cn("truncate", textSub)}>{currentModel.name}</span>
        <ChevronDown className={cn("w-3 h-3 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn("absolute top-full mt-1 left-0 w-64 rounded-xl border shadow-2xl overflow-hidden z-50", popupBg, popupBorder)}>
          <div className="p-2 space-y-1">
            {Object.entries(modelConfigs).map(([key, cfg]) => (
              <div key={key}>
                <button
                  onClick={() => {
                    setProvider(key as ModelProvider);
                    setModelId(cfg.models[0].id);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    provider === key ? selectedBg : itemHover
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", textMain)}>{cfg.name}</span>
                      {provider === key && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn("text-xs mt-0.5", textSub)}>{cfg.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cfg.strengths.map((s) => (
                        <span key={s} className={cn("text-[10px] px-1.5 py-0.5 rounded", tagBg, textSub)}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>

                {provider === key && (
                  <div className="ml-6 mt-1 mb-1 space-y-0.5">
                    {cfg.models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModelId(m.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors",
                          modelId === m.id
                            ? "text-[var(--accent-light)] bg-[var(--accent-soft)]"
                            : cn(textSub, "hover:text-[#5a4e35] dark:hover:text-zinc-300")
                        )}
                      >
                        <span>{m.name}</span>
                        <span className={textDim}>·</span>
                        <span className={textDim}>{m.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={cn("px-3 py-2 border-t text-[10px]", popupBorder, textDim)}>
            数据仅发送到你配置的 API 服务商，不会经过第三方服务器
          </div>
        </div>
      )}
    </div>
  );
}
