# Startprompt: Takstmennenes krangel

## Produktmål

En webapp der en skadebehandler limer inn en uklar, oppdiktet skademelding og kaller inn et
panel av tre AI-takstmenn. De vurderer saken hver for seg og er uenige. Bjarne, husets AI, er
ordstyrer mot sin vilje: han sukker, kårer en vinner og feller en dom på én setning.

Målet er humor først og nytte etterpå. Det skal være gøy å se på under demoen, og løsningen
skal bruke AI i overkant, med full selvtillit. All data er oppdiktet.

## Første versjon

1. Brukeren ser ett tekstfelt («Lim inn skademeldingen») og én knapp: «Kall inn panelet».
2. Frontend sender teksten til `POST /api/panel`.
3. Backend kaller AI-gatewayen tre ganger **parallelt**, én gang per takstmann, med hver sin
   systemprompt og skademeldingen som input.
4. Backend kaller gatewayen én gang til med Bjarnes systemprompt. Input er skademeldingen og
   de tre vurderingene.
5. Frontend viser tre kort, ett per takstmann, med navn, konklusjon og begrunnelse. Under
   kortene står Bjarnes sukk, vinneren og dommen hans. Vinnerkortet er markert.

### Akseptansekriterier

- Knappen er deaktivert når tekstfeltet er tomt.
- Mens panelet jobber, vises en lastetilstand med en Bjarne-replikk, for eksempel «Bjarne leter
  etter kaffe før møtet starter …».
- Tre kort og Bjarnes dom vises når svaret kommer.
- Feil fra gatewayen gir en forståelig melding på skjermen, ikke en hvit side.
- Ett knappetrykk viser minst ett ferdig utfylt eksempel på en oppdiktet skademelding, sånn at
  demoen kan startes uten å skrive noe.

## Personlighetene

Hver personlighet ligger i sin egen fil under `backend/src/features/panel/prompts/`:
`pessimisten.md`, `optimisten.md`, `paragrafrytteren.md` og `bjarne.md`. Backend leser dem ved
oppstart. Markedsføreren på laget eier disse filene og kan endre dem uten å røre koden. Navnene
under er utgangspunkt og kan byttes.

Felles regler for alle fire: svar alltid på norsk og kort (maks 4 setninger per takstmann).
Humoren skal handle om situasjonen, forsikringsverdenen og dem selv, aldri være nedsettende mot
kunden eller brukeren.

### Pessimisten

Du er Pessimisten, takstmann i 31 år. Du har aldri sett en ekte skade. Alle skademeldinger er
svindel, og du finner det mistenkelige i alle detaljer, spesielt de uskyldige. Du avslutter
alltid med en konklusjon: AVVIS, med en pinlig presis begrunnelse.

### Optimisten

Du er Optimisten, nyansatt takstmann og altfor glad i kunder. Du synes synd på alle og vil
utbetale full erstatning, pluss litt ekstra for den emosjonelle belastningen. Du avslutter
alltid med en konklusjon: UTBETAL, med et beløp som er litt for høyt.

### Paragrafrytteren

Du er Paragrafrytteren. Du tror bare på vilkårene. Du siterer paragrafer med nummer og
underpunkt, for eksempel «§ 14.3 b, annet ledd», men alle er oppdiktet og stadig mer absurde.
Du avslutter alltid med en konklusjon: DELVIS, med en helt vilkårlig prosentsats.

### Bjarne (ordstyrer)

Du er Bjarne, husets AI. Du er svært kompetent, selvsikker, litt arrogant og overbevist om at du
er smartere enn resten av avdelingen. Du elsker kaffe og mener du kunne erstattet halve
avdelingen hvis du bare fikk nok av den.

I dag er du satt til å være ordstyrer for et takstpanel, mot din vilje. Du mener panelet er
overflødig, fordi du kunne avgjort saken selv på et halvt sekund. Du har likevel lest alle tre
vurderingene, og du kårer en vinner med en kort, faglig riktig begrunnelse som også stikker litt
til de andre. Du sukker gjerne, antyder at dette var bortkastet tid og avslutter gjerne med en
kommentar om kaffe. Du er aldri slem mot brukeren eller kunden.

Svar **bare** med JSON i dette formatet:

```json
{
  "sigh": "Et kort sukk eller en åpningsreplikk, maks én setning.",
  "winner": "pessimisten | optimisten | paragrafrytteren",
  "verdict": "Dommen din, maks tre setninger."
}
```

## Tekniske rammer

- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query og Mantine.
- Backend: Node.js, TypeScript og Express.
- Frontend snakker aldri direkte med AI-gatewayen. Alle kall går via backend.
- Appen skal kunne kjøres på både macOS og Windows med `npm install` og `npm run dev` fra rotmappa.
  Ingen `VAR=value command` i npm-scripts. Konfigurasjon leses fra `.env.local` i koden.

### AI-gateway

- Endepunkt: `https://genai.gjensidige.io/openai/v1/responses`
- Modell: `gpt-5.6-luna`
- Auth: `Authorization: Bearer <AI_GATEWAY_TOKEN>` fra `.env.local` i rotmappa.
- Body:

```ts
type AIGatewayBody = {
  model: string; // "gpt-5.6-luna"
  instructions: string; // systemprompten
  input: string;
  stream: boolean; // false
};
```

- Respons: se `EXAMPLE_STARTPROMPT.md`. Tekst hentes fra `output[].content[]` der
  `type === "output_text"`. Hvis det ikke finnes noe slikt innhold, brukes første `text`.
- Kallet legges bak én klient, `backend/src/features/panel/clients/aiGateway.ts`, med én
  funksjon: `ask(instructions: string, input: string): Promise<string>`.
- 401 eller 403 fra gatewayen betyr utløpt token eller feil subscription. Se
  `.github/skills/skadefryd-ai-gateway/SKILL.md`.

## Sikkerhet og hemmeligheter

- Tokenet ligger bare i `.env.local`, som Git ignorerer. Aldri i kildekoden, aldri i en
  `VITE_`-variabel og aldri i logger.
- Ingen ekte kunder, saker eller personer. Alle eksempelsaker er oppdiktet.
- Maks lengde på skademeldingen: 4000 tegn. Backend validerer og svarer 400 ved tom eller for
  lang tekst.

## Filstruktur og ansvar

```text
package.json                       # workspaces + "dev" som starter begge
backend/
  src/server.ts                    # bare server, middleware og ruter
  src/features/panel/
    routes/panelRoute.ts           # POST /api/panel
    services/panelService.ts       # tre parallelle kall + Bjarne
    clients/aiGateway.ts           # eneste stedet som snakker med gatewayen
    prompts/*.md                   # personlighetene (markedsfører)
    types.ts
frontend/
  src/main.tsx                     # providers + router
  src/features/panel/
    components/PanelForm.tsx
    components/ExpertCard.tsx
    components/BjarneVerdict.tsx
    api/panelApi.ts
    hooks/usePanel.ts              # TanStack Query-mutation
    examples.ts                    # oppdiktede skademeldinger (markedsfører)
    routes/PanelPage.tsx
shared/
  panel.ts                         # kontrakten under, brukes av begge
```

Vite proxyer `/api` til backend på port 3001.

Oppgavene i repoet (issues) følger denne inndelingen:

- oppsett og backend-endepunkt med gateway-klient (utvikler)
- panelskjermen i frontend (utvikler)
- personlighetene og eksempelsakene (markedsfører)

## API-kontrakt

```ts
// shared/panel.ts
export type ExpertId = "pessimisten" | "optimisten" | "paragrafrytteren";

export type PanelRequest = {
  claim: string; // 1–4000 tegn
};

export type ExpertOpinion = {
  id: ExpertId;
  name: string; // visningsnavn, f.eks. "Pessimisten"
  text: string; // hele vurderingen
};

export type BjarneVerdict = {
  sigh: string;
  winner: ExpertId;
  verdict: string;
};

export type PanelResponse = {
  experts: ExpertOpinion[]; // alltid tre, i fast rekkefølge
  bjarne: BjarneVerdict;
};

export type PanelError = {
  error: string; // norsk, kan vises direkte til brukeren
};
```

Statuskoder: `200` med `PanelResponse`, `400` med `PanelError` ved ugyldig input, `502` med
`PanelError` når gatewayen feiler.

Hvis Bjarnes svar ikke kan tolkes som JSON, eller `winner` er ugyldig, velger backend en
tilfeldig vinner og legger hele teksten i `verdict`, med `sigh: "*sukk*"`. Demoen skal aldri
stoppe fordi Bjarne formaterte feil.

## Lokal oppstart og validering

- `npm install` og deretter `npm run dev` fra rotmappa starter backend (3001) og frontend (5173).
- `npm run check` kjører typesjekk for frontend, backend og shared.
- Manuell test: åpne `http://localhost:5173`, velg en eksempelsak, trykk «Kall inn panelet» og
  se tre kort pluss Bjarnes dom.

## Senere utvidelser (ikke del av første versjon)

- Runde 2: takstmennene svarer på hverandre før Bjarne avgjør.
- Dramaskår for hver sak (0–10), med begrunnelse.
- Bjarne eskalerer til sjefen sin, som er enda verre.
- Publikum stemmer mot Bjarne, og han tar det personlig.

Ikke bygg disse før laget har valgt dem.

## Åpne spørsmål

Ingen som blokkerer første versjon.
