# Vi mäter hela kedjan – inte bara klicken.

**Del 7** · KPI:er, mätning och optimering

## Syfte

Visa vilka mått som styr nästa beslut från källa till retention.

## Kärnbudskap

Data ska ändra nästa beslut – inte bara rapporteras.

## Synlig copy

KÄLLA → VÄNTELISTA → KONTO → AKTIVERING → BETALNING → RETENTION

01 · KÄLLA

Kanalrelevant respons

SoMe: CTR / klick

QR: scans / besök

Ambassadör: klick / besök via ambassador_id

Diagnos: skapar källan relevant trafik?

VÄNTELISTA
Waitlist conversion
waitlist_signup / besök × 100

AKTIVERING
Activation rate
aktiverade / nya konton × 100

BETALNING
Paid conversion
nya betalande / aktiverade × 100

CAC
kampanjkostnad / nya betalande

RETENTION
M3 · M6 · M12

BESLUTSEXEMPEL

A får högre CTR men B högre aktivering → gå vidare med B.

Data ska ändra nästa beslut – inte bara rapporteras.

ILLUSTRATIVT EXEMPEL · INTE RESULTAT

QR kan ge färre signups än SoMe – men högre aktivering.

HIGH-LTV-ANALYS

Vilka källor skapar kunder som stannar?

LTV beräknas först när verklig retention finns.

## Layout

Kedjan ligger som en tydlig tratt eller sekvens. Bara de viktigaste formlerna syns.

Beslutsexemplet får en tydlig puderrosa yta. Källjämförelsen märks uttryckligen som exempel, inte resultat.

High-LTV ligger litet nära retention.

## Bild / diagram

Diagrammet byggs i Figma.

Typ: Mätkedja med ett praktiskt beslutsexempel.

Syfte: Visa både vad vi mäter och vad resultatet får oss att göra.

## Talarmanus

Olika anskaffningskällor kräver olika mått högst upp i kedjan. I betald SoMe kan CTR och klick visa respons. För QR tittar vi på scans och besök. För ambassadörer tittar vi på attribuerade klick eller besök via ambassador_id. De måtten diagnostiserar om källan skapar relevant trafik, men är inte vinsten.

Waitlist conversion är waitlist_signup delat med besök. Konto visar hur stor del av väntelistan som kan matchas till ett konto, men är ett lifecycle-event och inte en egen huvud-KPI på sliden.

Activation rate är aktiverade delat med nya konton. Aktiverad betyder att first_comparison_available är true. Paid conversion är nya betalande delat med aktiverade. CAC är kampanjkostnad delat med nya betalande.

Retention följs vid tre, sex och tolv månader mot respektive betalande kohort. Månads- och årsplan kan vara analysdimensioner. LTV väntar tills verklig retention finns.

A/B-testningens värde ligger i beslutet. Om A klickas mer men B skapar fler aktiverade går vi vidare med B. Kontrollerade uttryckstest sker främst i betald SoMe med jämförbar publik och tydlig attribution.

Samma logik gäller källor. QR kan exempelvis ge färre anmälningar men högre aktivering än SoMe. Det är ett illustrativt tolkningsfall, inte ett resultat.

Nedströms kan alla källor jämföras på samma utfall: väntelista, aktivering, betalning och retention.

## Intern kontroll

[REKOMMENDATION] Mätkedjan, formlerna och beslutsregeln.

[KANALRELEVANT KÄLLMÅTT] SoMe: CTR/klick · QR: scans/besök · Ambassadör: attribuerade klick/besök via ambassador_id.

[ILLUSTRATIVT EXEMPEL] A mot B och QR mot SoMe. Inga utfall finns.

Inga måltal eller ifyllda procent får hittas på.

LTV beräknas inte utan verklig retention.

Det finns ingen fristående A/B-slide. Testlogiken stödjer kanalval och nästa beslut här.
