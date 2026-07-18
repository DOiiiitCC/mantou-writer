"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ModelSelector } from "@/components/ai/ModelSelector";
import { WritingModes } from "@/components/ai/WritingModes";
import { writeModes, type WriteMode } from "@/lib/ai/prompts";
import type { ModelProvider } from "@/lib/ai/providers";
import { BunIcon } from "@/components/ui/BunIcon";
import {
  BookOpen,
  FileText,
  Sparkles,
  PanelLeftClose,
  Bot,
  Send,
  StopCircle,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  FilePlus2,
} from "lucide-react";
import { toast } from "sonner";
import { getPairCode, pairWithCode, getPairedUserId } from "@/lib/supabase";

export function Sidebar() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const provider = useStore((s) => s.provider);
  const modelId = useStore((s) => s.modelId);
  const writeMode = useStore((s) => s.writeMode);
  const setWriteMode = useStore((s) => s.setWriteMode);
  const content = useStore((s) => s.content);
  const selectedText = useStore((s) => s.selectedText);
  const aiResult = useStore((s) => s.aiResult);
  const setAiResult = useStore((s) => s.setAiResult);
  const isGenerating = useStore((s) => s.isGenerating);
  const setIsGenerating = useStore((s) => s.setIsGenerating);
  const works = useStore((s) => s.works);
  const activeWorkId = useStore((s) => s.activeWorkId);
  const activeChapterId = useStore((s) => s.activeChapterId);
  const addWork = useStore((s) => s.addWork);
  const addChapter = useStore((s) => s.addChapter);
  const deleteWork = useStore((s) => s.deleteWork);
  const deleteChapter = useStore((s) => s.deleteChapter);
  const setActiveWork = useStore((s) => s.setActiveWork);
  const setActiveChapter = useStore((s) => s.setActiveChapter);
  const [aiTabOpen, setAiTabOpen] = useState(true);
  const [worksOpen, setWorksOpen] = useState(true);
  const [workExpanded, setWorkExpanded] = useState(true);
  const [showPair, setShowPair] = useState(false);
  const [pairInput, setPairInput] = useState("");

  const handleNewWork = () => {
    const title = prompt("请输入作品名称：");
    if (title?.trim()) addWork(title.trim());
  };

  const handleNewChapter = (workId: string) => {
    const title = prompt("请输入章节名称：");
    if (title?.trim()) addChapter(workId, title.trim());
  };
  const [instruction, setInstruction] = useState("");
  const [copied, setCopied] = useState(false);
  const [resultExpanded, setResultExpanded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!sidebarOpen) return null;

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setAiResult("");
    setResultExpanded(true);

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

  const handleInsert = () => {
    // Strip HTML tags, keep plain text with line breaks
    const div = document.createElement("div");
    div.innerHTML = aiResult;
    const text = div.textContent || div.innerText || "";
    document.dispatchEvent(new CustomEvent("mantou-insert", { detail: text }));
    toast.success("已插入到正文");
  };

  const modeConfig = writeModes.find((m) => m.id === writeMode);

  return (
    <aside
      className={cn(
        "flex flex-col w-72 h-full border-r border-[#e8ddc4] dark:border-zinc-800 bg-[#fdf5e1]/95 dark:bg-zinc-950/90 flex-shrink-0",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-80 max-lg:shadow-2xl"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#e8ddc4] dark:border-zinc-800 flex-shrink-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#3d3522] dark:text-zinc-200">
          <BunIcon className="w-4 h-4 text-[var(--accent-light)]" />
          馒头写作
        </span>
        <Button variant="ghost" size="sm" onClick={toggleSidebar}>
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Works section */}
        <button
          onClick={() => setWorksOpen(!worksOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#8a7e65] dark:text-zinc-500 uppercase tracking-wider hover:text-[#5a4e35] dark:hover:text-zinc-300 transition-colors"
        >
          <span>我的作品</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform",
              worksOpen && "rotate-180"
            )}
          />
        </button>

        {worksOpen && (
        <div className="px-3 pb-2 space-y-0.5">

          {works.map((work) => (
          <div key={work.id}>
            {/* Work — collapsible */}
            <button
              onClick={() => {
                setActiveWork(work.id);
                setWorkExpanded(activeWorkId === work.id ? !workExpanded : true);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group",
                activeWorkId === work.id
                  ? "bg-[var(--accent-soft)] text-[var(--accent-light)]"
                  : "text-[#6b5f45] dark:text-zinc-400 hover:bg-[#f0e8d0] dark:hover:bg-zinc-800/50"
              )}
            >
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform flex-shrink-0",
                  activeWorkId === work.id && workExpanded && "rotate-180"
                )}
              />
              <BookOpen className="w-4 h-4" />
              <span className="truncate flex-1">{work.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`确定删除「${work.title}」及其所有章节？`)) deleteWork(work.id);
                }}
                className="p-0.5 rounded text-[#b8a88a] dark:text-zinc-600 hover:text-red-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>

            {/* Chapters */}
            {activeWorkId === work.id && workExpanded && (
            <div className="ml-4 space-y-0.5">
              {work.chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors group",
                    activeChapterId === ch.id
                      ? "text-[var(--accent-light)] bg-[var(--accent-soft)]"
                      : "text-[#6b5f45] dark:text-zinc-400 hover:text-[#3d3522] dark:hover:text-zinc-200 hover:bg-[#f0e8d0] dark:hover:bg-zinc-800/50"
                  )}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{ch.title}</span>
                  {ch.words > 0 && (
                    <span className="text-xs text-[#b8a88a] dark:text-zinc-600">
                      {ch.words > 1000
                        ? `${(ch.words / 1000).toFixed(1)}k`
                        : ch.words}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除「${ch.title}」？`)) deleteChapter(work.id, ch.id);
                    }}
                    className="p-0.5 rounded text-[#b8a88a] dark:text-zinc-600 hover:text-red-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))}
              <button
                onClick={() => handleNewChapter(work.id)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:hover:text-zinc-300 hover:bg-[#f0e8d0] dark:hover:bg-zinc-800/50 text-sm transition-colors"
              >
                + 新建章节
              </button>
            </div>
            )}
          </div>
          ))}

          <button
            onClick={handleNewWork}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:hover:text-zinc-300 hover:bg-[#f0e8d0] dark:hover:bg-zinc-800/50 text-sm transition-colors"
          >
            + 新建作品
          </button>
        </div>
        )}

      </div>

      {/* AI Assistant */}
      <div className="border-t border-[#e8ddc4] dark:border-zinc-800 flex-shrink-0">
        <button
          onClick={() => setAiTabOpen(!aiTabOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:text-zinc-300 hover:bg-[#f0e8d0] dark:bg-zinc-800/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-[var(--accent-light)]" />
            AI 写作助手
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform",
              aiTabOpen && "rotate-180"
            )}
          />
        </button>

        {aiTabOpen && (
          <div className="p-3 space-y-3 max-h-[55vh] overflow-y-auto border-t border-[#e8ddc4] dark:border-zinc-800">
            {/* Model selector */}
            <div>
              <div className="text-[10px] text-[#b8a88a] dark:text-zinc-600 uppercase tracking-wider mb-1.5">
                模型选择
              </div>
              <ModelSelector />
            </div>

            {/* Writing mode + Input — side by side */}
            <div className="flex gap-2">
              {/* Mode buttons — vertical strip */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                {writeModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setWriteMode(mode.id as WriteMode)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] transition-colors whitespace-nowrap",
                      writeMode === mode.id
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:text-zinc-300 hover:bg-[#f0e8d0] dark:bg-zinc-800/50"
                    )}
                    title={mode.description}
                  >
                    <span className="text-xs w-4 text-center">{mode.icon}</span>
                    <span className="text-[10px]">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Input textarea — resizable */}
              <textarea
                ref={textareaRef}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={modeConfig?.placeholder || "输入你的要求..."}
                rows={3}
                className="flex-1 min-w-0 rounded-lg border border-[#e0d5b8] dark:border-zinc-700 bg-[#f0e8d0] dark:bg-zinc-800/50 px-2.5 py-2 text-xs text-[#3d3522] dark:text-zinc-200 placeholder:text-[#b8a88a] dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-light)] focus:border-[var(--accent-light)]"
                style={{ resize: "vertical" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>

            {/* Selected text indicator */}
            {selectedText && (
              <div className="text-[10px] text-[var(--accent-light)] truncate">
                已选中：{selectedText.slice(0, 40)}...
              </div>
            )}

            {/* Generate / Stop */}
            <div className="flex gap-2">
              {isGenerating ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStop}
                  className="flex-1"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  停止
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  className="flex-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  生成
                </Button>
              )}
            </div>

            {/* Generating indicator */}
            {isGenerating && !aiResult && (
              <div className="flex items-center gap-2 text-xs text-[#8a7e65] dark:text-zinc-500 py-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-light)] animate-pulse" />
                AI 正在思考...
              </div>
            )}

            {/* Result */}
            {aiResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setResultExpanded(!resultExpanded)}
                    className="flex items-center gap-1 text-xs text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:text-zinc-300 transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform",
                        resultExpanded && "rotate-180"
                      )}
                    />
                    生成结果 · {aiResult.length} 字
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleInsert}
                      className="p-1 rounded text-[#8a7e65] dark:text-zinc-500 hover:text-[var(--accent-light)] transition-colors"
                      title="插入到正文"
                    >
                      <FilePlus2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:text-zinc-300 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => setAiResult("")}
                      className="p-1 rounded text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:text-zinc-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {resultExpanded && (
                  <div className="prose prose-invert prose-zinc text-xs max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-[#5a4e35] dark:text-zinc-300 max-h-80 overflow-y-auto rounded-lg border border-[#e8ddc4] dark:border-zinc-800 p-3 bg-[#f5edd8] dark:bg-zinc-900/50">
                      {aiResult}
                      {isGenerating && (
                        <span className="inline-block w-2 h-4 bg-[var(--accent-light)] animate-pulse ml-0.5 align-text-bottom" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Device pairing — at the very bottom */}
      <div className="border-t border-[#e8ddc4] dark:border-zinc-800 flex-shrink-0">
        <button
          onClick={() => setShowPair(!showPair)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-[#8a7e65] dark:text-zinc-500 hover:text-[#5a4e35] dark:hover:text-zinc-300 transition-colors"
        >
          <span>📱 设备同步</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showPair && "rotate-180")} />
        </button>

        {showPair && (
          <div className="px-4 pb-3 space-y-2">
            {getPairedUserId() ? (
              <>
                <p className="text-xs text-[#5a4e35] dark:text-zinc-300">✅ 已配对</p>
                <button
                  onClick={() => {
                    localStorage.removeItem("mantou-paired-id");
                    setShowPair(false);
                    toast.success("已解除配对");
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  解除配对
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-[#8a7e65] dark:text-zinc-500">
                  本机配对码：
                  <span className="font-mono text-[var(--accent-light)] ml-1">{getPairCode()}</span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={pairInput}
                    onChange={(e) => setPairInput(e.target.value.toUpperCase())}
                    placeholder="输入另一台设备的配对码"
                    maxLength={6}
                    className="flex-1 rounded border border-[#e0d5b8] dark:border-zinc-700 bg-[#f0e8d0] dark:bg-zinc-800/50 px-2 py-1 text-xs text-[#3d3522] dark:text-zinc-200 placeholder:text-[#b8a88a] focus:outline-none focus:ring-1 focus:ring-[var(--accent-light)]"
                  />
                  <button
                    onClick={() => {
                      if (pairInput.length === 6 && pairWithCode(pairInput)) {
                        toast.success("配对成功！即将同步数据");
                        setShowPair(false);
                        useStore.getState().syncCloud();
                      } else {
                        toast.error("请输入完整的 6 位码");
                      }
                    }}
                    className="px-2 py-1 rounded bg-[var(--accent)] text-white text-xs"
                  >
                    配对
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
