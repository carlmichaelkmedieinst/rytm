# Marketing Automation kopplar marknadsföring till beteende.

**Del 5** · Marketing Automation-strategi

## Syfte

Visa varför Marketing Automation skapar värde genom att minnas källa, reagera på beteende och stoppa irrelevant kommunikation.

## Kärnbudskap

Rätt nästa steg – och inget meddelande när användaren redan har tagit det.

## Synlig copy

FLOW 1 · INTRESSE → LANSERING

TRIGGER
waitlist_signup

→ spara källa + samtycke
→ vänta på lansering
→ skicka begärd lanseringsnotis

RESULTAT
Vi vet både vem som anmälde sig och vilken källa som skapade intresset.

FLOW 2 · KONTO → AKTIVERING

account_created

→ har första passet loggats?
→ finns första jämförelsen?
→ AKTIVERAD

NEJ
→ relevant onboarding / hjälp där kommunikation är tillåten

JA
→ stoppa aktiveringskommunikation

Vi slutar marknadsföra nästa steg när användaren redan har tagit det.

FLOW 3 · AKTIVERING → DELNING

TRIGGER
first_comparison_available = true

→ användaren har ett positivt bevis
→ visa CTA: Sprid träningsglädjen!
→ dela ett enkelt Rytm-resultatkort / en länk till SoMe
→ föreslaget share_id
→ nya besök kan kopplas till det delade innehållet

RESULTAT
Aktivering kan skapa ny organisk anskaffning.

AKTIVERING → DELNING → NY TRAFIK → RYTM

## Layout

Tre tydliga lifecycle-flöden, inte tre kanalspecifika automationssystem.

Flow 1, 2 och 3 får varsin enkel sekvens. Kärnraden om att sluta marknadsföra ett redan taget steg är visuellt dominant.

Delningsloopen är liten och tydlig. Sprid träningsglädjen! får inte konkurrera med SKAFFA RYTM.

## Bild / diagram

Diagrammet byggs i Figma.

Typ: Tre lifecycle-flöden och en enkel advocacy-loop.

Komposition: Intresse till lansering, konto till aktivering och aktivering till delning. Samma kundprofil och lifecycle genom hela sliden.

## Talarmanus

Marketing Automation spelar fem roller här. Den minns var personen kom ifrån. Den reagerar på verkligt beteende. Den slutar skicka när nästa steg redan är taget. Den kopplar anskaffning till aktivering och affär. Efter aktivering kan den också skapa en mätbar delningsloop.

Vid waitlist_signup sparas källa och samtycke. Den begärda lanseringsnotisen skickas när lanseringen sker. Annan kommunikation kräver att den är tillåten.

Efter account_created frågar vi vad som faktiskt har hänt. Om första passet eller jämförelsen saknas kan relevant hjälp visas där kommunikation är tillåten. När första jämförelsen finns är personen aktiverad och aktiveringskommunikationen ska stanna.

Först då finns ett positivt, konkret bevis som kan delas. Sprid träningsglädjen! är en post-activation CTA i produkten, inte ett nytt lanseringskoncept. Ett föreslaget share_id skulle kunna göra återkommande trafik mätbar.

Tid kan styra väntan. Status styr nästa handling.

## Intern kontroll

Alla källor går in i samma lifecycle. Bygg inte separata MA-system för Ambassadör, SoMe och QR.

[FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS] Kontokoppling, produktstatus till MA, delningskort/länk och share_id.

Sprid träningsglädjen! används bara efter aktivering.

Eventnamnen är casets modell, inte verifierade produktionsevents.
