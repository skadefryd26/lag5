import type { PanelError, PanelRequest, PanelResponse } from "../../../../../shared/panel.ts";

export async function convenePanel(request: PanelRequest): Promise<PanelResponse> {
  const response = await fetch("/api/panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as PanelError | null;
    throw new Error(body?.error ?? "Panelet svarte ikke. Bjarne har kanskje gått for å hente kaffe.");
  }
  return (await response.json()) as PanelResponse;
}
