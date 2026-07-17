import { streamText } from "ai";
import { getModel, type ModelProvider } from "@/lib/ai/providers";
import { buildSystemPrompt, buildUserPrompt, type WriteMode } from "@/lib/ai/prompts";
import { z } from "zod";

const requestSchema = z.object({
  provider: z.enum(["claude", "deepseek", "doubao"]),
  modelId: z.string().optional(),
  mode: z.enum(["continue", "rewrite", "outline", "free", "correct"]),
  content: z.string().default(""),
  selectedText: z.string().optional(),
  instruction: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { provider, modelId, mode, content, selectedText, instruction } = parsed.data;

    // Check if the API key is configured
    const keyEnvMap: Record<ModelProvider, string> = {
      claude: "ANTHROPIC_API_KEY",
      deepseek: "DEEPSEEK_API_KEY",
      doubao: "DOUBAO_API_KEY",
    };
    const requiredKey = keyEnvMap[provider];
    if (!process.env[requiredKey]) {
      return new Response(
        JSON.stringify({
          error: `${provider} API 密钥未配置。请在 .env.local 中设置 ${requiredKey}`,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const model = getModel(provider, modelId);
    const systemPrompt = buildSystemPrompt(mode);
    const userPrompt = buildUserPrompt(mode, content, selectedText, instruction);

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: mode === "outline" ? 0.3 : 0.8,
      maxOutputTokens: mode === "outline" ? 4000 : 2000,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI write error:", error);
    return new Response(
      JSON.stringify({ error: "AI 生成失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
