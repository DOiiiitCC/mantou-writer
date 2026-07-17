"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useStore } from "@/lib/store";
import { EditorToolbar } from "./EditorToolbar";

export function NovelEditor() {
  const activeChapterId = useStore((s) => s.activeChapterId);
  const chapterContents = useStore((s) => s.chapterContents);
  const setChapterContent = useStore((s) => s.setChapterContent);
  const setContent = useStore((s) => s.setContent);
  const setSelectedText = useStore((s) => s.setSelectedText);

  const currentContent = (activeChapterId && chapterContents[activeChapterId]) || "";
  const prevChapterRef = useRef(activeChapterId);

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: "开始创作你的故事…按 Ctrl+Enter 唤起 AI 助手",
        showOnlyWhenEditable: true,
      }),
    ],
    content: currentContent,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-zinc max-w-none focus:outline-none min-h-[60vh]",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (activeChapterId) {
        setChapterContent(activeChapterId, html);
      }
      setContent(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to);
        setSelectedText(text);
      } else {
        setSelectedText("");
      }
    },
  });

  // Switch chapter content when active chapter changes
  useEffect(() => {
    if (editor && activeChapterId && activeChapterId !== prevChapterRef.current) {
      prevChapterRef.current = activeChapterId;
      const newContent = chapterContents[activeChapterId] || "";
      editor.commands.setContent(newContent);
      setContent(newContent);
    }
  }, [editor, activeChapterId, chapterContents, setContent]);

  // Listen for insert-content event from AI panel
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      if (editor && detail) {
        editor.chain().focus().insertContent(detail).run();
      }
    };
    document.addEventListener("mantou-insert", handler);
    return () => document.removeEventListener("mantou-insert", handler);
  }, [editor]);

  // Keyboard shortcut: Ctrl+Enter to open AI panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        useStore.getState().toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 py-6">
        <div className="max-w-[720px] mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
