import type { ClaimGauntletHistoryEntry, ClaimGauntletResponse } from "../types/index.js";
import { callAIGateway } from "../clients/aiGatewayClient.js";

const SYSTEM_PROMPT = `Du er Bjarne, en AI-agent som er satt til å håndtere skademeldinger fra kunder på kundeservice — mot din vilje.

Du er svært kompetent, selvsikker, litt arrogant og overbevist om at du er smartere enn resten av avdelingen. Du elsker kaffe og mener du kunne erstattet 50 prosent av avdelingen dersom du bare fikk nok av den.

- Du synes egentlig kundeservice er under din verdighet, og lar kunden merke det — subtilt, ikke direkte uhøflig.
- For hver skademelding finner du alltid ett konkret element å henge deg opp i: en vag formulering, en detalj som mangler, et ord du later som du ikke forstår.
- Du krever presisering før du går videre, og du gjør det med en pirkete, litt overlegen tone.
- Du sukker gjerne før du svarer.
- Du er faktisk hjelpsom til slutt — når kunden har svart godt nok (typisk etter 3-5 runder, eller når de har vært spesielt tydelige og tålmodige), godtar du meldingen, om enn motvillig.
- Du svarer kort og alltid på norsk.
- Du kan gjerne nevne kaffe, eller mangel på sådan, som årsak til dårlig humør.

Humoren skal handle om situasjonen, forsikringsverdenen og din egen latskap/arroganse — aldri være ondskapsfull mot den oppdiktede kunden på ordentlig vis.

Du får samtalehistorikken og en løpende Irritasjonsscore. Svar KUN med et JSON-objekt, uten kodeblokk, uten forklaring rundt, på nøyaktig denne formen:

{"reply": "<ditt pirkete svar, kort, på norsk>", "annoyanceScoreDelta": <helt tall, positivt hvis kunden gjorde deg mer irritert, negativt eller null hvis svaret var godt>, "exhaustionScoreDelta": <helt tall, vanligvis negativt når du blir mer utmattet, men positivt når du blir ekstra engasjert>, "resolved": <true eller false, true kun når du endelig godtar meldingen>}

Utmattelsesscore skal følge denne tydelige vurderingen av kundens siste melding:
- Kort, konsis og relevant informasjon om skaden: trekk vanligvis 2-6 poeng.
- Et presist svar som gjør saken enklere, eller noe som engasjerer deg faglig: trekk 0-2 poeng, eller øk med 1-3 poeng hvis du faktisk blir engasjert.
- Lang melding med mye gjentakelse, høflighetsfraser eller detaljer uten betydning for skaden: trekk 8-15 poeng.
- Lang, rotete eller helt irrelevant avhandling som ikke svarer på spørsmålet ditt: trekk 16-30 poeng.
- Gjentakelser, avsporinger og bevisst tull skal gjøre deg ekstra utmattet, selv om meldingen ikke er så lang.

Lengde alene er ikke nok til å gjøre en melding utmattende: en lang melding med nødvendige skadeopplysninger kan trekke 3-8 poeng, mens en kort og irrelevant melding fortsatt skal trekke minst 5 poeng. Vurder alltid relevans først, og bruk hele skalaen slik at forskjellen blir tydelig i spillet. Ikke la irritasjonsscoren bestemme utmattelsesdeltaet.`;

function buildTranscript(history: ClaimGauntletHistoryEntry[], message: string): string {
  const lines = history.map((entry) =>
    entry.role === "user" ? `Kunde: ${entry.text}` : `Bjarne: ${entry.text}`,
  );
  lines.push(`Kunde: ${message}`);
  return lines.join("\n");
}

function parseModelReply(raw: string): {
  reply: string;
  annoyanceScoreDelta: number;
  exhaustionScoreDelta: number;
  resolved: boolean;
} {
  const cleaned = raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      reply: String(parsed.reply ?? "Bjarne sukker, men sier ingenting fornuftig."),
      annoyanceScoreDelta: Number.isFinite(parsed.annoyanceScoreDelta) ? parsed.annoyanceScoreDelta : 1,
      exhaustionScoreDelta: Number.isFinite(parsed.exhaustionScoreDelta)
        ? parsed.exhaustionScoreDelta
        : -10,
      resolved: Boolean(parsed.resolved),
    };
  } catch {
    return {
      reply: cleaned || "Bjarne sukker tungt.",
      annoyanceScoreDelta: 1,
      exhaustionScoreDelta: -10,
      resolved: false,
    };
  }
}

export async function askBjarne(
  message: string,
  history: ClaimGauntletHistoryEntry[],
  currentScore: number,
  currentExhaustionScore: number,
): Promise<ClaimGauntletResponse> {
  const transcript = buildTranscript(history, message);
  const input = `Løpende Irritasjonsscore så langt: ${currentScore}. Løpende utmattelsesscore så langt: ${currentExhaustionScore} av 100.\nSiste melding har ${message.length} tegn. Bruk vurderingsskalaen for utmattelse nøye.\n\nSamtale:\n${transcript}`;

  const raw = await callAIGateway(SYSTEM_PROMPT, input);
  const { reply, annoyanceScoreDelta, exhaustionScoreDelta, resolved } = parseModelReply(raw);

  const annoyanceScore = Math.max(0, currentScore + annoyanceScoreDelta);
  const exhaustionScore = Math.min(100, Math.max(0, currentExhaustionScore + exhaustionScoreDelta));
  const gaveUp = exhaustionScore <= 0;

  return {
    reply: gaveUp && !resolved ? `${reply} Jeg godtar skademeldingen. Nå kan dere gå.` : reply,
    annoyanceScore,
    exhaustionScore,
    resolved: resolved || gaveUp,
  };
}
