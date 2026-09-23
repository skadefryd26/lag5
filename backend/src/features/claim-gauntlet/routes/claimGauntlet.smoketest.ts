import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { askBjarne } from "../services/bjarneService.js";
import { applyPersonaScoreRules } from "../personas.js";
import type { BjarnePersonaId } from "../types/index.js";

// Enkel, manuell smoketest for oppgave 4 (utprøving):
// kjør `npm test` i backend/ mens serveren IKKE trenger å kjøre,
// dette kaller AI-gatewayen direkte og skriver ut resultatet.
async function main() {
  const personaIds: BjarnePersonaId[] = ["coffee-strike", "bureaucrat", "after-lunch"];
  const sameMessageRules = personaIds.map((personaId) => ({
    personaId,
    ...applyPersonaScoreRules(personaId, 0, 100, 4, -10),
  }));

  if (
    sameMessageRules[0].annoyanceScore <= sameMessageRules[1].annoyanceScore ||
    sameMessageRules[1].annoyanceScore <= sameMessageRules[2].annoyanceScore ||
    sameMessageRules[0].exhaustionScore >= sameMessageRules[1].exhaustionScore ||
    sameMessageRules[1].exhaustionScore >= sameMessageRules[2].exhaustionScore
  ) {
    console.error("Smoketest feilet: personaene gir ikke ulike scoreutslag.");
    process.exit(1);
  }

  const result = await askBjarne(
    "Bilen min fikk en skrape på parkeringsplassen i går.",
    [],
    0,
    100,
    "bureaucrat",
  );
  console.log("Bjarnes svar:", JSON.stringify(result, null, 2));

  if (
    !result.reply ||
    typeof result.annoyanceScore !== "number" ||
    typeof result.exhaustionScore !== "number" ||
    result.personaId !== "bureaucrat"
  ) {
    console.error("Smoketest feilet: mangler svar, scorer eller persona.");
    process.exit(1);
  }

  console.log("Smoketest OK.");
}

main().catch((error) => {
  console.error("Smoketest feilet:", error);
  process.exit(1);
});
