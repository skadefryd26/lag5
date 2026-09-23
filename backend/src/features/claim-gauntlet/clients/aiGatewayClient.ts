import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import type { AIGatewayBody, ResponsesApiResponse } from "../types/index.js";

const GATEWAY_URL = "https://genai.gjensidige.io/openai/v1/responses";
const MODEL = "gpt-5.6-luna";

export class AIGatewayError extends Error {}

export async function callAIGateway(instructions: string, input: string): Promise<string> {
  const token = process.env.AI_GATEWAY_TOKEN;
  if (!token) {
    throw new AIGatewayError(
      "AI_GATEWAY_TOKEN mangler. Kjør skadefryd-ai-gateway-oppsettet på nytt.",
    );
  }

  const body: AIGatewayBody = {
    model: MODEL,
    instructions,
    input,
    stream: false,
  };

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new AIGatewayError(`AI-gateway svarte ${response.status}: ${text}`);
  }

  const json = (await response.json()) as ResponsesApiResponse;
  const text = json.output
    .flatMap((o) => o.content ?? [])
    .map((c) => c.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new AIGatewayError("AI-gateway ga et tomt svar.");
  }

  return text;
}
