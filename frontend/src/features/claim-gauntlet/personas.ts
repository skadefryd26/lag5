import type { BjarnePersona, BjarnePersonaId } from "./types";

export const BJARNE_PERSONAS: readonly BjarnePersona[] = [
  {
    id: "coffee-strike",
    name: "Kaffestreik-Bjarne",
    difficulty: "vanskelig",
    description: "Kaffemaskinen er tom. Dette lover dårlig.",
    rules: {
      roundSeconds: 45,
      timeoutAnnoyancePenalty: 5,
      timeoutExhaustionPenalty: 10,
    },
  },
  {
    id: "bureaucrat",
    name: "Byråkrat-Bjarne",
    difficulty: "middels",
    description: "Bjarne har funnet et skjema for skjemaet.",
    rules: {
      roundSeconds: 60,
      timeoutAnnoyancePenalty: 3,
      timeoutExhaustionPenalty: 6,
    },
  },
  {
    id: "after-lunch",
    name: "Bjarne etter lunsj",
    difficulty: "lett",
    description: "Han har spist. Samarbeidsevnen er tilbake, foreløpig.",
    rules: {
      roundSeconds: 75,
      timeoutAnnoyancePenalty: 1,
      timeoutExhaustionPenalty: 2,
    },
  },
];

export function pickRandomPersona(excludeId?: BjarnePersonaId): BjarnePersona {
  const candidates = BJARNE_PERSONAS.filter((persona) => persona.id !== excludeId);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? BJARNE_PERSONAS[0];
}
