"use client";

import { useCallback } from "react";
import { useStore } from "@/lib/store";
import type { ModelProvider } from "@/lib/ai/providers";
import type { WriteMode } from "@/lib/ai/prompts";

export function useAIAssist() {
  const setProvider = useStore((s) => s.setProvider);
  const setModelId = useStore((s) => s.setModelId);
  const setWriteMode = useStore((s) => s.setWriteMode);
  const toggleAiPanel = useStore((s) => s.toggleAiPanel);
  const aiPanelOpen = useStore((s) => s.aiPanelOpen);

  const quickAction = useCallback(
    (action: { provider?: ModelProvider; modelId?: string; mode: WriteMode; instruction?: string }) => {
      if (action.provider) setProvider(action.provider);
      if (action.modelId) setModelId(action.modelId);
      setWriteMode(action.mode);
      if (!aiPanelOpen) toggleAiPanel();
      // The instruction is set via a callback that the AIPanel reads
      return action.instruction;
    },
    [setProvider, setModelId, setWriteMode, toggleAiPanel, aiPanelOpen]
  );

  return { quickAction };
}
