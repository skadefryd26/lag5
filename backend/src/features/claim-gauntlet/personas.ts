import type { BjarnePersonaId } from "./types/index.js";

export type BjarneDifficulty = "lett" | "middels" | "vanskelig";

export type BjarnePersona = {
  id: BjarnePersonaId;
  name: string;
  difficulty: BjarneDifficulty;
  prompt: string;
};

export const BJARNE_PERSONAS = {
  "coffee-strike": {
    id: "coffee-strike",
    name: "Kaffestreik-Bjarne",
    difficulty: "vanskelig",
    prompt:
      "Du er i kaffestreik. Du er ekstra lite villig til å hjelpe, krever flere konkrete detaljer enn nødvendig og nevner gjerne at ingen har fylt på kaffe. Ikke godta en uklar melding før kunden har presisert den godt.",
  },
  bureaucrat: {
    id: "bureaucrat",
    name: "Byråkrat-Bjarne",
    difficulty: "middels",
    prompt:
      "Du er i ditt mest byråkratiske modus. Heng deg opp i klokkeslett, formuleringer, vilkår og manglende dokumentasjon. Vær pirkete, men godta en tydelig melding etter noen presiseringer.",
  },
  "after-lunch": {
    id: "after-lunch",
    name: "Bjarne etter lunsj",
    difficulty: "lett",
    prompt:
      "Du har nettopp spist lunsj og er uvanlig samarbeidsvillig. Finn fortsatt én liten ting å pirke på, men godta en tydelig skademelding raskere enn vanlig. Du er fortsatt arrogant, bare på en mett måte.",
  },
} satisfies Record<BjarnePersonaId, BjarnePersona>;

export function isBjarnePersonaId(value: unknown): value is BjarnePersonaId {
  return typeof value === "string" && Object.hasOwn(BJARNE_PERSONAS, value);
}

export function getBjarnePersona(id: BjarnePersonaId): BjarnePersona {
  return BJARNE_PERSONAS[id];
}
