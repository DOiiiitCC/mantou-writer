import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";

export type ModelProvider = "claude" | "deepseek" | "doubao";

export interface ModelConfig {
  id: ModelProvider;
  name: string;
  description: string;
  strengths: string[];
  models: { id: string; name: string; description: string }[];
}

export const modelConfigs: Record<ModelProvider, ModelConfig> = {
  claude: {
    id: "claude",
    name: "Claude (DeepSeek)",
    description: "Anthropic 兼容 API，长文连贯",
    strengths: ["正文续写", "文学润色", "长文连贯"],
    models: [
      { id: "deepseek-v4-pro", name: "V4 Pro", description: "最强 / 深度创作" },
      { id: "deepseek-v4-flash", name: "V4 Flash", description: "快速 / 日常写作" },
    ],
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek 原生 API",
    strengths: ["大纲生成", "情节推演", "设定一致性"],
    models: [
      { id: "deepseek-reasoner", name: "V4 Pro", description: "最强推理 / 复杂规划" },
      { id: "deepseek-chat", name: "V4 Flash", description: "快速 / 日常辅助" },
    ],
  },
  doubao: {
    id: "doubao",
    name: "豆包",
    description: "中文语感出色，适合日常写作",
    strengths: ["对话润色", "网络文学", "短场景"],
    models: [
      { id: "doubao-pro-256k", name: "豆包 Pro", description: "长上下文 / 长篇创作" },
      { id: "doubao-lite-128k", name: "豆包 Lite", description: "快速 / 短篇写作" },
    ],
  },
};

// Provider instances — created lazily with API keys from environment
let anthropicInstance: ReturnType<typeof createAnthropic> | null = null;
let deepseekInstance: ReturnType<typeof createDeepSeek> | null = null;
let doubaoInstance: ReturnType<typeof createOpenAI> | null = null;

function getAnthropic() {
  if (!anthropicInstance) {
    anthropicInstance = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL,
    });
  }
  return anthropicInstance;
}

function getDeepSeek() {
  if (!deepseekInstance) {
    deepseekInstance = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL,
    });
  }
  return deepseekInstance;
}

function getDoubao() {
  if (!doubaoInstance) {
    doubaoInstance = createOpenAI({
      apiKey: process.env.DOUBAO_API_KEY,
      baseURL: process.env.DOUBAO_BASE_URL,
    });
  }
  return doubaoInstance;
}

import type { LanguageModel } from "ai";

export function getModel(provider: ModelProvider, modelId?: string): LanguageModel {
  switch (provider) {
    case "claude": {
      // Using DeepSeek models via Anthropic-compatible endpoint
      const model = modelId || "deepseek-v4-pro";
      return getAnthropic()(model);
    }
    case "deepseek": {
      // Using native DeepSeek API
      const model = modelId === "deepseek-reasoner" ? "deepseek-reasoner" : "deepseek-chat";
      return getDeepSeek()(model);
    }
    case "doubao": {
      const model = modelId === "doubao-lite-128k" ? "doubao-lite-128k" : "doubao-pro-256k";
      return getDoubao()(model);
    }
  }
}
