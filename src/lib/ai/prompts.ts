export type WriteMode = "continue" | "rewrite" | "outline" | "free" | "correct";

export interface WriteModeConfig {
  id: WriteMode;
  label: string;
  icon: string;
  description: string;
  placeholder: string;
}

export const writeModes: WriteModeConfig[] = [
  {
    id: "continue",
    label: "续写",
    icon: "→",
    description: "基于当前内容继续往下写",
    placeholder: "可指定续写方向、风格、字数等要求...",
  },
  {
    id: "rewrite",
    label: "改写",
    icon: "✏️",
    description: "润色或改变当前段落的风格",
    placeholder: "可指定想要的风格，如：更简洁、更有悬疑感、更口语化...",
  },
  {
    id: "correct",
    label: "纠错",
    icon: "🔍",
    description: "检查错别字、语法错误和标点",
    placeholder: "可指定需要重点检查的内容...",
  },
  {
    id: "outline",
    label: "大纲",
    icon: "📋",
    description: "生成章节大纲或情节规划",
    placeholder: "描述你想要的故事走向、章节数量等...",
  },
  {
    id: "free",
    label: "自由",
    icon: "💬",
    description: "自由提问或头脑风暴",
    placeholder: "描述你的想法或问题...",
  },
];

export function buildSystemPrompt(mode: WriteMode): string {
  const basePrompt = `你是一位专业的小说写作助手，兼具作家、编辑和文学顾问的能力。你的回复应该：
1. 贴合用户已有的文风和设定
2. 保持情节连贯性和人物一致性
3. 语言文字优美流畅，中文功底扎实
4. 适当提供创作建议，帮助用户提升作品质量`;

  const modePrompts: Record<WriteMode, string> = {
    continue: `${basePrompt}

【续写模式】
- 仔细阅读用户提供的前文，理解文风、人物、情节走向
- 按照前文的风格和节奏无缝续写
- 默认续写 300-800 字，用户指定字数时按要求
- 如果用户指定了方向，按指定方向展开
- 续写内容用 --- 分隔线隔开，方便用户对比查看`,

    rewrite: `${basePrompt}

【改写模式】
- 保留原文核心内容和情节不变
- 根据用户要求调整文风、语调、节奏
- 如果没有指定风格，默认提升文学性和流畅度
- 同时输出改写后的版本和简短的改写说明`,

    correct: `你是一位专业的文字校对编辑。你的任务是检查文本中的以下问题：

【纠错模式】
**检查内容：**
1. 错别字（同音字、形近字错误）
2. 语法错误（搭配不当、成分残缺、语序混乱）
3. 标点符号错误（中英文标点混用、缺失、错用）
4. 重复用词（同一段落内过度重复的词语）
5. "的地得"用法错误

**输出格式：**
- 先列出发现的具体问题，每条标注出原文错误位置和正确写法
- 然后给出修改后的完整版本
- 如果没有发现错误，直接说明"未发现明显错误"
- 不要改动作者的文风和原意，只修正技术性错误`,

    outline: `${basePrompt}

【大纲模式】
- 为故事生成结构清晰的章节大纲
- 每个章节包含：标题、核心事件、人物发展、悬念设置
- 考虑故事的起承转合和节奏把控
- 如果没有指定章节数，默认生成 8-12 章的大纲
- 同时给出整体故事主线的概述`,

    free: `${basePrompt}

【自由模式】
- 像一个有经验的写作伙伴一样与用户交流
- 可以讨论人物塑造、情节设计、世界观设定等任何话题
- 给出具体、可操作的建议
- 帮助用户理清创作思路`,
  };

  return modePrompts[mode];
}

export function buildUserPrompt(
  mode: WriteMode,
  content: string,
  selectedText?: string,
  instruction?: string
): string {
  switch (mode) {
    case "continue":
      return `以下是当前已写的内容：

${content}

${instruction ? `续写要求：${instruction}` : "请续写接下来的内容。"}`;

    case "rewrite": {
      const target = selectedText || content;
      return `请改写以下内容${instruction ? `，要求：${instruction}` : ""}：

${target}`;
    }

    case "correct": {
      const target = selectedText || content;
      if (!target.trim()) return "请先选中需要检查的文字，或者在正文中写入内容。";
      return `请检查以下文本中的错误：

${target}

${instruction ? `重点检查：${instruction}` : ""}`;
    }

    case "outline":
      return `${content ? `已有内容概要：${content}` : ""}
${instruction ? `大纲要求：${instruction}` : "请为这个故事生成章节大纲。"}`;

    case "free":
      return instruction || content;

    default:
      return instruction || content;
  }
}
