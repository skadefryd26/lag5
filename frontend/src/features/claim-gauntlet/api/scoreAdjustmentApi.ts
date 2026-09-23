const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export type ScoreAdjustments = {
  annoyanceScore?: number;
  exhaustionScore?: number;
};

export async function adjustScores(scores: ScoreAdjustments): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/admin/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scores),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Ukjent feil" }));
    throw new Error(body.error ?? `Backend svarte ${response.status}`);
  }
}
