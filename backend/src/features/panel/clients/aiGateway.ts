import { execFile } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { parse } from "dotenv";

const endpoint = "https://genai.gjensidige.io/openai/v1/responses";
const model = "gpt-5.6-luna";
const envFile = fileURLToPath(new URL("../../../../../.env.local", import.meta.url));

type ResponsesApiResponse = {
  output: { type: string; content?: { type: string; text?: string }[] }[];
};

export class GatewayError extends Error {}

// Read on every call, so a refreshed token is picked up without restarting the server.
function readToken(): string {
  let token: string | undefined;
  try {
    token = parse(readFileSync(envFile)).AI_GATEWAY_TOKEN;
  } catch {
    // Missing file is reported below.
  }
  if (!token) {
    throw new GatewayError("Tilgangstoken til AI-gatewayen mangler i .env.local.");
  }
  return token;
}

// Azure tokens last about an hour. Fetch a new one with the existing az login.
async function refreshToken(): Promise<void> {
  const { stdout } = await promisify(execFile)(
    "az",
    ["account", "get-access-token", "--resource", "https://cognitiveservices.azure.com", "--query", "accessToken", "--output", "tsv"],
    { shell: process.platform === "win32" },
  );
  writeFileSync(envFile, `AI_GATEWAY_TOKEN=${stdout.trim()}\n`);
}

function call(token: string, instructions: string, input: string) {
  return fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, instructions, input, stream: false }),
  });
}

function extractText(body: ResponsesApiResponse): string {
  const contents = body.output.flatMap((item) => item.content ?? []);
  const text = contents.find((c) => c.type === "output_text")?.text ?? contents.find((c) => c.text)?.text;
  if (!text) {
    throw new GatewayError("AI-gatewayen svarte uten tekst.");
  }
  return text.trim();
}

export async function ask(instructions: string, input: string): Promise<string> {
  let response = await call(readToken(), instructions, input);

  if (response.status === 401) {
    try {
      await refreshToken();
    } catch {
      throw new GatewayError("Tilgangen til AI-gatewayen har gått ut, og Azure-innloggingen må fornyes.");
    }
    response = await call(readToken(), instructions, input);
  }

  if (!response.ok) {
    console.error(`AI-gateway svarte ${response.status}: ${await response.text()}`);
    throw new GatewayError(`AI-gatewayen svarte med feil (${response.status}).`);
  }
  return extractText((await response.json()) as ResponsesApiResponse);
}
