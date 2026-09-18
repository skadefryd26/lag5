# Lag 5: Takstmennenes krangel

## Idé

En skadebehandler med en uklar, oppdiktet skademelding kaller inn et panel. Tre AI-takstmenn
vurderer den samme saken, hver med sin personlighet, og er uenige. Bjarne er ordstyrer mot sin
vilje: han sukker, avbryter, kårer en vinner og feller en dom på én setning.

## Bjarne i vår versjon

Ordstyrer mot sin vilje. Han mener panelet er overflødig, siden han kunne avgjort saken selv
på et halvt sekund, men han har blitt satt til å lede møtet. Kjernen er Bjarne som vanlig:
kompetent, arrogant, lat, glad i kaffe og alltid kort og på norsk.

## Panelet (forslag – markedsfører eier personlighetene)

- **Pessimisten** – alt er svindel.
- **Optimisten** – utbetal alt, stakkars kunde.
- **Paragrafrytteren** – siterer vilkår som ikke finnes.

## Første versjon

Brukeren limer inn en skademelding og trykker på «Kall inn panelet». Tre kort med hver sin
vurdering vises, og nederst står Bjarnes oppsummering med vinneren.

## Arbeidsdeling

- **Utvikler:** app, backend og kall til AI-gatewayen.
- **Markedsfører:** personlighetene/systempromptene til takstmennene og Bjarne, 3–4 oppdiktede
  skademeldinger til demo, demomanus.

## Beslutninger

- Ikke en chat: ett skjema inn, et panel ut.
- Tre parallelle gateway-kall (takstmenn), deretter ett kall til Bjarne med deres svar.
- Alle personligheter ligger i egne tekstfiler i backend, sånn at markedsfører kan endre dem
  uten å røre koden.

Full brief for kodeagentene: `.ai/startprompt.md`.
