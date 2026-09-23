import type { ClaimGauntletRequest, ClaimGauntletResponse } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export async function sendClaimMessage(
  request: ClaimGauntletRequest,
): Promise<ClaimGauntletResponse> {
  const response = await fetch(`${BACKEND_URL}/api/claim-gauntlet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Ukjent feil" }));
    throw new Error(body.error ?? `Backend svarte ${response.status}`);
  }

  return response.json();
}
