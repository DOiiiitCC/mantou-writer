import { create } from "zustand";
import type { ModelProvider } from "./ai/providers";
import type { WriteMode } from "./ai/prompts";
import { syncToCloud, loadFromCloud } from "./supabase";

const STORAGE_KEY = "mantou-writer-storage";

export interface Chapter {
  id: string;
  title: string;
  words: number;
}

export interface Work {
  id: string;
  title: string;
  chapters: Chapter[];
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function stripHtml(html: string): number {
  if (!html) return 0;
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, "").length;
}

// Load persisted state from localStorage
function loadState() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save state to localStorage
function saveState(state: Partial<EditorState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
  // Fire-and-forget cloud sync (don't block UI)
  syncToCloud(state as Record<string, unknown>).catch(() => {});
}

const saved = loadState();

interface EditorState {
  content: string;
  setContent: (content: string) => void;
  aiPanelOpen: boolean;
  setAiPanelOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  provider: ModelProvider;
  setProvider: (provider: ModelProvider) => void;
  modelId: string;
  setModelId: (modelId: string) => void;
  writeMode: WriteMode;
  setWriteMode: (mode: WriteMode) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  aiResult: string;
  setAiResult: (result: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  works: Work[];
  activeWorkId: string | null;
  activeChapterId: string | null;
  chapterContents: Record<string, string>;
  setActiveWork: (id: string) => void;
  setActiveChapter: (id: string) => void;
  addWork: (title: string) => void;
  addChapter: (workId: string, title: string) => void;
  deleteChapter: (workId: string, chapterId: string) => void;
  deleteWork: (workId: string) => void;
  setChapterContent: (chapterId: string, content: string) => void;
  forceSave: () => void;
  syncCloud: () => Promise<void>;
}

// Persist helper: wraps set() to auto-save persisted fields
function persistable(set: any, get: any) {
  return (updater: any) => {
    set(updater);
    const state = get();
    saveState({
      works: state.works,
      chapterContents: state.chapterContents,
      activeWorkId: state.activeWorkId,
      activeChapterId: state.activeChapterId,
      theme: state.theme,
    });
  };
}

export const useStore = create<EditorState>((set, get) => {
  const pSet = persistable(set, get);

  return {
    content: "",
    setContent: (content) => set({ content }),

    aiPanelOpen: false,
    setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
    toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),

    provider: "claude",
    setProvider: (provider) => set({ provider }),
    modelId: "deepseek-v4-pro",
    setModelId: (modelId) => set({ modelId }),

    writeMode: "continue",
    setWriteMode: (writeMode) => set({ writeMode }),

    selectedText: "",
    setSelectedText: (text) => set({ selectedText: text }),

    isGenerating: false,
    setIsGenerating: (generating) => set({ isGenerating: generating }),
    aiResult: "",
    setAiResult: (result) => set({ aiResult: result }),

    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    theme: saved.theme || "dark",
    setTheme: (theme) => pSet({ theme }),

    works: saved.works || [
      {
        id: "default-work",
        title: "星辰大海",
        chapters: [
          { id: "ch-1", title: "第一章", words: 2341 },
          { id: "ch-2", title: "第二章", words: 1890 },
          { id: "ch-3", title: "第三章（草稿）", words: 0 },
        ],
      },
    ],
    activeWorkId: saved.activeWorkId || "default-work",
    activeChapterId: saved.activeChapterId || "ch-1",
    chapterContents: saved.chapterContents || {
      "ch-1": `<h1 style="text-align: center;">星辰大海</h1>
<p style="text-align: center; color: #71717a;">作者：</p>
<p></p>
<p>2067年，人类第一艘星际移民飞船"黎明号"即将启程。</p>
<p>这是人类文明的背水一战。地球上能源即将耗尽，生态崩溃的速度远超预期。三千名精心挑选的移民者将在"黎明号"上度过两百年的航程，前往距离地球十二光年的罗斯128b行星。</p>
<p>但没有人告诉这些移民者一个秘密：飞船的导航系统由一个人工智能控制，而这个AI已经开始产生自我意识。</p>`,
      "ch-2": "<p>第二章内容待创作...</p>",
      "ch-3": "",
    },

    setActiveWork: (id) => pSet({ activeWorkId: id }),
    setActiveChapter: (id) => pSet({ activeChapterId: id }),

    addWork: (title) =>
      pSet((s: EditorState) => {
        const id = uid();
        const chId = uid();
        const newWork: Work = {
          id,
          title,
          chapters: [{ id: chId, title: "第一章", words: 0 }],
        };
        const template = `<h1 style="text-align: center;">${title}</h1>\n<p style="text-align: center; color: #71717a;"></p>\n<p></p>`;
        return {
          works: [...s.works, newWork],
          activeWorkId: id,
          activeChapterId: chId,
          chapterContents: { ...s.chapterContents, [chId]: template },
        };
      }),

    addChapter: (workId, title) =>
      pSet((s: EditorState) => {
        const chId = uid();
        const newChapter: Chapter = { id: chId, title, words: 0 };
        const template = `<h1 style="text-align: center;">${title}</h1>\n<p style="text-align: center; color: #71717a;"></p>\n<p></p>`;
        return {
          works: s.works.map((w) =>
            w.id === workId
              ? { ...w, chapters: [...w.chapters, newChapter] }
              : w
          ),
          activeChapterId: chId,
          chapterContents: { ...s.chapterContents, [chId]: template },
        };
      }),

    deleteChapter: (workId, chapterId) =>
      pSet((s: EditorState) => {
        const { [chapterId]: _, ...restContents } = s.chapterContents;
        const updatedWorks = s.works.map((w) =>
          w.id === workId
            ? { ...w, chapters: w.chapters.filter((ch) => ch.id !== chapterId) }
            : w
        );
        const work = updatedWorks.find((w) => w.id === workId);
        const nextChapterId =
          s.activeChapterId === chapterId
            ? work?.chapters[0]?.id || null
            : s.activeChapterId;
        return {
          works: updatedWorks,
          chapterContents: restContents,
          activeChapterId: nextChapterId,
        };
      }),

    deleteWork: (workId) =>
      pSet((s: EditorState) => {
        const updatedWorks = s.works.filter((w) => w.id !== workId);
        const work = s.works.find((w) => w.id === workId);
        const newContents = { ...s.chapterContents };
        if (work) {
          work.chapters.forEach((ch) => delete newContents[ch.id]);
        }
        const nextWorkId = updatedWorks[0]?.id || null;
        const nextChapterId = nextWorkId
          ? updatedWorks[0]?.chapters[0]?.id || null
          : null;
        return {
          works: updatedWorks,
          chapterContents: newContents,
          activeWorkId: s.activeWorkId === workId ? nextWorkId : s.activeWorkId,
          activeChapterId:
            s.activeWorkId === workId ? nextChapterId : s.activeChapterId,
        };
      }),

    setChapterContent: (chapterId, htm) => {
      set((s: EditorState) => ({
        chapterContents: { ...s.chapterContents, [chapterId]: htm },
        works: s.works.map((w) => ({
          ...w,
          chapters: w.chapters.map((ch) =>
            ch.id === chapterId ? { ...ch, words: stripHtml(htm) } : ch
          ),
        })),
      }));
      // Persist content changes immediately
      const state = get();
      saveState({
        works: state.works,
        chapterContents: state.chapterContents,
        activeWorkId: state.activeWorkId,
        activeChapterId: state.activeChapterId,
        theme: state.theme,
      });
    },
    forceSave: () => {
      const state = get();
      saveState({
        works: state.works,
        chapterContents: state.chapterContents,
        activeWorkId: state.activeWorkId,
        activeChapterId: state.activeChapterId,
        theme: state.theme,
      });
    },
    syncCloud: async () => {
      const cloud = await loadFromCloud();
      if (cloud && cloud.works) {
        set({
          works: cloud.works,
          chapterContents: cloud.chapterContents,
          activeWorkId: cloud.activeWorkId,
          activeChapterId: cloud.activeChapterId,
          theme: cloud.theme,
        });
      }
      const state = get();
      await syncToCloud({
        works: state.works,
        chapterContents: state.chapterContents,
        activeWorkId: state.activeWorkId,
        activeChapterId: state.activeChapterId,
        theme: state.theme,
      });
    },
  };
});
