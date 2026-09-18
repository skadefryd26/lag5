import { readFileSync } from "node:fs";
import type { BjarneVerdict, ExpertId, ExpertOpinion, PanelResponse } from "../../../../../shared/panel.ts";
import { ask } from "../clients/aiGateway.ts";

const experts: { id: ExpertId; name: string }[] = [
  { id: "pessimisten", name: "Pessimisten" },
  { id: "optimisten", name: "Optimisten" },
  { id: "paragrafrytteren", name: "Paragrafrytteren" },
];

// Read on every request, so edits to the personalities show up without a restart.
function prompt(name: string): string {
  return readFileSync(new URL(`../prompts/${name}.md`, import.meta.url), "utf8");
}

function parseVerdict(raw: string): BjarneVerdict {
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  try {
    const parsed = JSON.parse(json) as Partial<BjarneVerdict>;
    if (experts.some((e) => e.id === parsed.winner) && parsed.verdict) {
      return { sigh: parsed.sigh || "*sukk*", winner: parsed.winner!, verdict: parsed.verdict };
    }
  } catch {
    // Fall through: the demo must never stop because Bjarne formatted badly.
  }
  const winner = experts[Math.floor(Math.random() * experts.length)].id;
  return { sigh: "*sukk*", winner, verdict: raw };
}

export async function convenePanel(claim: string): Promise<PanelResponse> {
  const opinions: ExpertOpinion[] = await Promise.all(
    experts.map(async ({ id, name }) => ({ id, name, text: await ask(prompt(id), claim) })),
  );

  const briefing = [
    `Skademelding:\n${claim}`,
    ...opinions.map((o) => `${o.name} (id: ${o.id}):\n${o.text}`),
  ].join("\n\n---\n\n");

  const bjarne = parseVerdict(await ask(prompt("bjarne"), briefing));
  return { experts: opinions, bjarne };
}
