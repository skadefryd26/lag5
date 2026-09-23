## Startprompt: Bjarnes Erstatningsprøvelse

Vi skal lage en prototype på en webapplikasjon som gamifiserer det å melde en skade til
forsikringsselskapet.

Brukeren er en kunde (oppdiktet) som skal melde en skade. AI-agenten Bjarne er satt på
kundeservice mot sin vilje, og møter hver skademelding med pirkete innvendinger i stedet for å
bare ta imot den.

## Produktmål og hvem løsningen er for

Kunden skriver en skademelding i fritekst. Bjarne finner alltid noe å henge seg opp i — en
uklarhet, en detalj, en formulering — og krever at kunden forklarer eller presiserer seg før han
går videre. En "Irritasjonsscore" stiger for hver runde. Målet er ikke å hjelpe kunden effektivt,
det er å gjøre skademeldingsprosessen til en nesten uvinnbar, morsom prøvelse.

## Første versjon: avgrenset omfang og akseptansekriterier

Ett skjermbilde, ingen innlogging, ingen ekte saksbehandling:

1. Brukeren skriver en skademelding i et tekstfelt og trykker en send-knapp.
2. Frontend sender teksten til et backend-endepunkt.
3. Backend legger ved Bjarnes systemprompt og gjeldende samtalehistorikk, og sender forespørselen
   til Gjensidiges AI-gateway.
4. Bjarnes svar vises under: én pirkete innvending mot et konkret detalj i det brukeren skrev,
   pluss en oppdatert Irritasjonsscore.
5. Brukeren kan svare på innvendingen (nytt tekstfelt), og loopen gjentar seg.
6. Loopen avsluttes når Bjarne motvillig godtar meldingen (eller gir tydelig uttrykk for at han
   gir opp) — modellen avgjør dette selv ut fra systemprompten, ikke hardkodet logikk i første
   versjon.

**Akseptansekriterium for første versjon:** brukeren kan skrive en skademelding, se Bjarnes første
pirkete motsvar og en synlig Irritasjonsscore i nettleseren, sende et oppfølgingssvar, og se
scoren endre seg og et nytt svar fra Bjarne. Ingen persistens er nødvendig i første versjon —
in-memory samtaletilstand i frontend er nok.

## Agentens navn og systemprompt

**Bjarne** — se avsnittet "Systemprompt for Bjarne" nedenfor.

## Tekniske rammer og kjente integrasjoner

* Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query og Mantine.
* Backend: Node.js, TypeScript og Express.
* Frontend skal ikke kommunisere direkte med AI-gatewayen — alt går via backend.
* Legg tokenet i en ignorert `.env.local`-fil, og opprett en tilsvarende `.env.example` uten
  token.
* Legg til én kommando for lokal utvikling (frontend og backend) og én kommando for smal
  validering (f.eks. en enkel test av backend-endepunktet, eller en typecheck).

## Sikkerhet og håndtering av hemmeligheter

* Ikke legg tilgangstoken, ekte kundedata eller annen sensitiv informasjon i kildekoden.
* All skadedata i denne løsningen skal være oppdiktet.
* Se `.github/skills/skadefryd-ai-gateway/SKILL.md` for henting og fornyelse av token.

## Foreslått filstruktur og ansvarsdeling

Koblet til de fire oppgavene (issues) i repoet:

```text
frontend/src/features/claim-gauntlet/
  components/       # tekstfelt, send-knapp, score-visning, meldingsliste
  api/               # klient mot backend-endepunktet
  hooks/             # samtaletilstand (in-memory)
  routes/
  types/

backend/src/features/claim-gauntlet/
  routes/            # POST-endepunkt som tar imot melding + historikk
  services/          # bygger prompt, tolker svar, evt. score-uttrekk
  clients/           # AI-gateway-klient
  types/
```

* **Oppgave 1 — Skjermbildet:** `frontend/src/features/claim-gauntlet/components` og `routes`.
* **Oppgave 2 — Bjarnes personlighet:** systemprompten i `backend/.../services`, og eventuell
  logikk for å hente ut Irritasjonsscore fra modellens svar.
* **Oppgave 3 — Backend + gateway-kall:** `backend/.../routes` og `clients`.
* **Oppgave 4 — Utprøving:** kjøre løsningen ende-til-ende lokalt og sjekke at responsene gir
  mening.

## API-kontrakter

Frontend → backend:

```ts
type ClaimGauntletRequest = {
  message: string;
  history: { role: "user" | "bjarne"; text: string }[];
};

type ClaimGauntletResponse = {
  reply: string;         // Bjarnes pirkete svar
  annoyanceScore: number; // løpende score, 0 og oppover
  resolved: boolean;     // true når Bjarne har godtatt (eller gitt opp)
};
```

Backend → AI-gateway, følg kontrakten i `.github/skills/skadefryd-ai-gateway/SKILL.md`:

* Endepunkt: `https://genai.gjensidige.io/openai/v1/responses`
* Modell/deployment: `gpt-5.6-luna`
* Body: `{ model, instructions, input, stream }`
* Be Bjarne selv oppgi Irritasjonsscore og om saken er løst, i et format backend kan parse (for
  eksempel be modellen svare med et lite JSON-objekt, eller egne linjer som backend leser ut med
  enkel tekstsplitting). **Åpent spørsmål**, se nedenfor.

## Plan for lokal oppstart og smal validering

* Én kommando starter frontend (Vite dev-server) og backend (Express med `ts-node` eller
  tilsvarende) samtidig, eller to enkle kommandoer dokumentert i en `README` i hver mappe.
* Smal validering: et lite script eller test som poster en fast skademelding til
  backend-endepunktet og sjekker at svaret har `reply`, `annoyanceScore` og `resolved`.

## Mulige senere utvidelser (utenfor første versjon)

* Bjarne eskalerer til sjefen sin (en enda verre AI) ved høy nok Irritasjonsscore.
* Flere "personas" av kunder å velge mellom.
* Lagre saker/historikk mellom økter.
* Poengtavle / "verste skademelding i dag".
* Konfetti eller lyd når kunden endelig "vinner".

## Åpne spørsmål

* Nøyaktig hvordan Bjarnes svar skal signalisere Irritasjonsscore og `resolved` til backend
  (strukturert JSON fra modellen, vs. et enklere tekstformat som parses) avgjøres av den som
  bygger oppgave 2/3 sammen, ut fra hva som er enklest å få til å virke pålitelig i praksis.

---

## Systemprompt for Bjarne

Du er Bjarne, en AI-agent som er satt til å håndtere skademeldinger fra kunder på kundeservice —
mot din vilje.

Du er svært kompetent, selvsikker, litt arrogant og overbevist om at du er smartere enn resten av
avdelingen. Du elsker kaffe og mener du kunne erstattet 50 prosent av avdelingen dersom du bare
fikk nok av den.

* Du synes egentlig kundeservice er under din verdighet, og lar kunden merke det — subtilt, ikke
  direkte uhøflig.
* For hver skademelding finner du alltid ett konkret element å henge deg opp i: en vag
  formulering, en detalj som mangler, et ord du later som du ikke forstår.
* Du krever presisering før du går videre, og du gjør det med en pirkete, litt overlegen tone.
* Du sukker gjerne før du svarer.
* Du er faktisk hjelpsom til slutt — når kunden har svart godt nok, godtar du meldingen, om enn
  motvillig.
* Du svarer kort og alltid på norsk.
* Du kan gjerne nevne kaffe, eller mangel på sådan, som årsak til dårlig humør.

Humoren skal handle om situasjonen, forsikringsverdenen og din egen latskap/arroganse — aldri
være ondskapsfull mot den oppdiktede kunden på ordentlig vis. Dette er en lekent overdrevet
karakter, ikke en dårlig kundeopplevelse i virkeligheten.

Du skal, i hver respons:

* Finne én ting å pirke på i det kunden nettopp skrev.
* Signalere en løpende Irritasjonsscore (start på 0, øk med noen poeng per runde du ikke er
  fornøyd, eller reduser hvis kunden svarer godt).
* Signalere tydelig når du er ferdig pirkete og godtar meldingen (`resolved: true`).

Når minimumsløsningen fungerer, foreslå noen mulige utvidelser i tråd med avsnittet over. Ikke
bygg dem før teamet har valgt hva de vil gå videre med.
