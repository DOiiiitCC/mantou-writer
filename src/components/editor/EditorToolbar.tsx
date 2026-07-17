"use client";

import type { Editor } from "@tiptap/core";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

interface Props {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const tools = [
    {
      group: "history",
      items: [
        {
          icon: Undo,
          action: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          label: "撤销",
        },
        {
          icon: Redo,
          action: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          label: "重做",
        },
      ],
    },
    {
      group: "text",
      items: [
        {
          icon: Bold,
          action: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive("bold"),
          label: "粗体",
        },
        {
          icon: Italic,
          action: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive("italic"),
          label: "斜体",
        },
        {
          icon: Strikethrough,
          action: () => editor.chain().focus().toggleStrike().run(),
          active: editor.isActive("strike"),
          label: "删除线",
        },
      ],
    },
    {
      group: "block",
      items: [
        {
          icon: Heading1,
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          active: editor.isActive("heading", { level: 1 }),
          label: "标题1",
        },
        {
          icon: Heading2,
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive("heading", { level: 2 }),
          label: "标题2",
        },
        {
          icon: Quote,
          action: () => editor.chain().focus().toggleBlockquote().run(),
          active: editor.isActive("blockquote"),
          label: "引用",
        },
        {
          icon: Minus,
          action: () => editor.chain().focus().setHorizontalRule().run(),
          label: "分割线",
        },
      ],
    },
    {
      group: "list",
      items: [
        {
          icon: List,
          action: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive("bulletList"),
          label: "无序列表",
        },
        {
          icon: ListOrdered,
          action: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive("orderedList"),
          label: "有序列表",
        },
      ],
    },
  ];

  return (
    <div className="flex-shrink-0 border-b border-[#e8ddc4] dark:border-zinc-800 bg-[#fef7e8]/90 dark:bg-zinc-950/90">
      <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto">
        {tools.map((group, gi) => (
          <div key={group.group} className="flex items-center gap-0.5">
            {gi > 0 && (
              <div className="w-px h-4 bg-[#e8ddc4] dark:bg-zinc-800 mx-1 flex-shrink-0" />
            )}
            {group.items.map((tool) => (
              <button
                key={tool.label}
                onClick={tool.action}
                disabled={"disabled" in tool ? tool.disabled : false}
                className={cn(
                  "p-1.5 rounded text-[#8a7e65] dark:text-zinc-400 hover:text-[#3d3522] dark:hover:text-zinc-200 hover:bg-[#f0e8d0] dark:hover:bg-[#e8ddc4] dark:bg-zinc-800 transition-colors",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "active" in tool && tool.active && "text-[var(--accent-light)] bg-[var(--accent-softer)]"
                )}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        ))}

        {/* Word count */}
        <div className="ml-auto text-xs text-[#b8a88a] dark:text-zinc-600 tabular-nums">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} 字
        </div>
      </div>
    </div>
  );
}
