import type { BjarnePersonaId } from "./types/index.js";

export type BjarneDifficulty = "lett" | "middels" | "vanskelig";

export type BjarnePersonaRules = {
  roundSeconds: number;
  annoyanceMultiplier: number;
  exhaustionMultiplier: number;
  timeoutAnnoyancePenalty: number;
  timeoutExhaustionPenalty: number;
};

export type BjarnePersona = {
  id: BjarnePersonaId;
  name: string;
  difficulty: BjarneDifficulty;
  prompt: string;
  rules: BjarnePersonaRules;
};

export const BJARNE_PERSONAS = {
  "coffee-strike": {
    id: "coffee-strike",
    name: "Kaffestreik-Bjarne",
    difficulty: "vanskelig",
    rules: {
      roundSeconds: 45,
      annoyanceMultiplier: 1.5,
      exhaustionMultiplier: 1.35,
      timeoutAnnoyancePenalty: 5,
      timeoutExhaustionPenalty: 10,
    },
    prompt:
      "Du er i kaffestreik. Du er ekstra lite villig til å hjelpe, krever flere konkrete detaljer enn nødvendig og nevner gjerne at ingen har fylt på kaffe. Ikke godta en uklar melding før kunden har presisert den godt.",
  },
  bureaucrat: {
    id: "bureaucrat",
    name: "Byråkrat-Bjarne",
    difficulty: "middels",
    rules: {
      roundSeconds: 60,
      annoyanceMultiplier: 1,
      exhaustionMultiplier: 1,
      timeoutAnnoyancePenalty: 3,
      timeoutExhaustionPenalty: 6,
    },
    prompt:
      "Du er i ditt mest byråkratiske modus. Heng deg opp i klokkeslett, formuleringer, vilkår og manglende dokumentasjon. Vær pirkete, men godta en tydelig melding etter noen presiseringer.",
  },
  "after-lunch": {
    id: "after-lunch",
    name: "Bjarne etter lunsj",
    difficulty: "lett",
    rules: {
      roundSeconds: 75,
      annoyanceMultiplier: 0.7,
      exhaustionMultiplier: 0.65,
      timeoutAnnoyancePenalty: 1,
      timeoutExhaustionPenalty: 2,
    },
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

export function applyPersonaScoreRules(
  personaId: BjarnePersonaId,
  currentScore: number,
  currentExhaustionScore: number,
  annoyanceScoreDelta: number,
  exhaustionScoreDelta: number,
) {
  const { rules } = getBjarnePersona(personaId);

  return {
    annoyanceScore: Math.max(
      0,
      currentScore + Math.round(annoyanceScoreDelta * rules.annoyanceMultiplier),
    ),
    exhaustionScore: Math.min(
      100,
      Math.max(0, currentExhaustionScore + Math.round(exhaustionScoreDelta * rules.exhaustionMultiplier)),
    ),
  };
}
