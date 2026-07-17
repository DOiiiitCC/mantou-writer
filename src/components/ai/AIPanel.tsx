"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { writeModes, type WriteMode } from "@/lib/ai/prompts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { WritingModes } from "./WritingModes";
import { X, Copy, Check, Sparkles, StopCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AIPanel() {
  const aiPanelOpen = useStore((s) => s.aiPanelOpen);
  const toggleAiPanel = useStore((s) => s.toggleAiPanel);
  const provider = useStore((s) => s.provider);
  const modelId = useStore((s) => s.modelId);
  const writeMode = useStore((s) => s.writeMode);
  const content = useStore((s) => s.content);
  const selectedText = useStore((s) => s.selectedText);
  const isGenerating = useStore((s) => s.isGenerating);
  const setIsGenerating = useStore((s) => s.setIsGenerating);
  const aiResult = useStore((s) => s.aiResult);
  const setAiResult = useStore((s) => s.setAiResult);

  const [instruction, setInstruction] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-focus when AI panel opens
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (aiPanelOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [aiPanelOpen]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setAiResult("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          modelId,
          mode: writeMode,
          content,
          selectedText: selectedText || undefined,
          instruction: instruction || undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "请求失败");
      }

      // Stream response — plain text from toTextStreamResponse()
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setAiResult(fullText);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  };

  const modeConfig = writeModes.find((m) => m.id === writeMode);

  if (!aiPanelOpen) return null;

  return (
    <aside
      className={cn(
        "fixed xl:relative right-0 top-14 bottom-0 xl:bottom-auto",
        "w-full sm:w-96 xl:w-80",
        "border-l border-zinc-800 bg-zinc-950 z-30",
        "flex flex-col",
        // Mobile: full screen overlay
        "max-sm:fixed max-sm:inset-0 max-sm:top-0 max-sm:w-full max-sm:z-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800 flex-shrink-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI 写作助手
        </h2>
        <button
          onClick={toggleAiPanel}
          className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode selector */}
      <div className="px-4 py-2.5 border-b border-zinc-800 flex-shrink-0">
        <WritingModes />
      </div>

      {/* Instruction input */}
      <div className="px-4 py-3 flex-shrink-0">
        {modeConfig && (
          <div className="text-xs text-zinc-500 mb-2">{modeConfig.description}</div>
        )}
        <Textarea
          ref={textareaRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={modeConfig?.placeholder || "输入你的要求..."}
          rows={3}
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />

        {/* Selected text indicator */}
        {selectedText && (
          <div className="mt-2 text-xs text-indigo-400 truncate">
            已选中文本：{selectedText.slice(0, 50)}...
          </div>
        )}

        {/* Generate / Stop buttons */}
        <div className="flex gap-2 mt-2.5">
          {isGenerating ? (
            <Button variant="secondary" size="sm" onClick={handleStop} className="flex-1">
              <StopCircle className="w-3.5 h-3.5" />
              停止生成
            </Button>
          ) : (
            <Button size="sm" onClick={handleGenerate} className="flex-1">
              <Sparkles className="w-3.5 h-3.5" />
              {modeConfig?.label || "生成"}
            </Button>
          )}

          {aiResult && !isGenerating && (
            <>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAiResult("")}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Result area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isGenerating && !aiResult && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI 正在思考...
          </div>
        )}

        {aiResult && (
          <div className="prose prose-invert prose-zinc text-sm max-w-none">
            <div className="text-xs text-zinc-500 mb-2">
              {isGenerating ? "生成中..." : "生成结果"} · {aiResult.length} 字
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-zinc-300">
              {aiResult}
            </div>
            {isGenerating && (
              <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}

        {!isGenerating && !aiResult && (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-600">
            <Sparkles className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">选择模式和模型，输入你的要求，</p>
            <p className="text-sm">AI 将帮你创作。</p>
            <p className="text-xs mt-3 text-zinc-700">
              快捷键：Ctrl+Enter 切换面板
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
