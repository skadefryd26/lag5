# Skadefryd — Bjarnes Erstatningsprøvelse

## Idé

Kunden skal melde en skade, men Bjarne — satt på kundeservice mot sin vilje — nekter å gjøre det
enkelt. Hver setning kunden skriver blir møtt med en pirkete innvending fra Bjarne, og en
"Irritasjonsscore" stiger for hver runde. Kunden må forklare/forsvare seg videre til Bjarne
motvillig godtar skademeldingen (eller gir opp). Prosessen med å melde en skade blir gamifisert til
en nesten uvinnbar prøvelse.

## Agent

**Bjarne** — kompetent, arrogant, overbevist om at han er smartere enn resten av avdelingen. Satt
på kundeservice mot sin vilje, og lar kunden merke det. Korte svar, alltid på norsk, humor rettet
mot situasjonen og seg selv — aldri mot kunden på ordentlig ondskapsfullt vis.

## Første versjon

Ett skjermbilde:
- Kunden skriver en skademelding i et tekstfelt og trykker send.
- Bjarne svarer med én pirkete innvending mot et detalj i meldingen.
- En "Irritasjonsscore" vises og øker for hver runde.
- Loopen fortsetter til Bjarne motvillig godtar meldingen, eller gir opp.

## Fordeling av arbeid

Delt i fire uavhengige deler, valgt av teamet selv (ikke etter rolle):
1. Skjermbildet — tekstfelt, send-knapp, meldingsflyt, score-visning
2. Bjarnes personlighet/systemprompt — pirking, poengsetting
3. Backend + kall til AI-gatewayen
4. Utprøving / sjekke at det faktisk fungerer

## Beslutninger tatt

- Retning: gamifisert skademelding, ikke en vanlig chat.
- Bjarnes vri: tvunget kundeservice, ikke kaffestreik eller paranoia om å bli erstattet.
- Arbeidet splittes av teamet selv, ikke etter yrkesrolle.

Se `.ai/startprompt.md` for den fulle tekniske brifen.
