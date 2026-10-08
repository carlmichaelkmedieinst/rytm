# Vi mäter hela kedjan – inte bara klicken.

**Del 7** · KPI:er, mätning och optimering

## Syfte

Sätta mätningen i samma kedja som strategin, från källa till retention.

## Kärnbudskap

Ett klick är en diagnos. Värdet syns först längre ner i kedjan.

## Synlig copy

KÄLLA → VÄNTELISTA → KONTO → AKTIVERING → BETALNING → RETENTION

KÄLLA
CTR: klick / visningar × 100
trafik
diagnos

↓

VÄNTELISTA
Waitlist conversion rate: waitlist_signup / besök × 100
Kostnad per anmälan: kampanjkostnad / waitlist_signup

↓

KONTO
Waitlist → konto: matchade konton / waitlist_signup × 100

↓

AKTIVERING
Activation rate: aktiverade / nya konton × 100
Kostnad per aktiverad: kampanjkostnad / aktiverade

↓

BETALNING
Paid conversion: nya betalande / aktiverade × 100
CAC: kampanjkostnad / nya betalande

↓

RETENTION
M3 retention: betalande kvar efter 3 månader / ursprunglig betalande kohort × 100
M6 och M12 är samma mått vid 6 och 12 månader.
månadsplan / årsplan som analysdimension

DATA SOM KRÄVS
källa · waitlist_signup · account_created · first_comparison_available · subscription_started · kohort/tid

HIGH-LTV-ANALYS

Vilka källor skapar kunder som stannar?
Vilka beteenden skiljer de mest värdefulla kunderna?
Vilka kohorter skapar störst långsiktigt värde?

LTV beräknas först när verklig retention finns.

## Layout

Kedjan som en smal rad högst upp, från källa till retention.

Sedan en vertikal tratt med sex steg. Varje steg har sitt namn i serif och formeln i liten sans. Inga måltal och inga ifyllda procent. Pilarna är tunna. M6 och M12 nämns som samma mått vid senare tid, utan att formeln skrivs om.

DATA SOM KRÄVS är en tunn rad under tratten, inte ett eget steg.

HIGH-LTV-ANALYS är en liten ruta vid sidan av retention, inte ett sjunde trattsteg. Tre frågor. Under rutan en enda mening: LTV beräknas först när verklig retention finns.

Inga blå grafer. Inga påhittade baselines. Vit grund, burgundy på aktivering och på LTV-meningen.

## Bild / diagram

Diagrammet ska byggas i Figma istället för foto.

Typ: Mättratt.

Syfte: Visa att optimering flyttar sig nedåt i kedjan, från diagnos till retention.

Motiv: Källa, väntelista, konto, aktivering, betalning, retention, plus den lilla analysrutan.

Komposition: Vertikal. High-LTV vid retention. Inga procent fyllda i förväg.

Text i bilden: Måtten från synlig copy.

## Talarmanus

Den här sliden säger vad vi mäter och hur talet räknas. Nästa slide, experimentet, säger vad resultaten får oss att göra.

CTR är klick delat med visningar. Den är diagnos: syns vi, och klickar någon. Den är inte vinsten. Väntelistan är anmälningar delat med besök, och vad varje anmälan kostar. Konto är andelen väntelista som går att matcha till ett konto. Aktivering är andelen nya konton som når första jämförelsen, och vad den aktiveringen kostar. Betalning är andelen aktiverade som betalar, och CAC. M3-retention är de som fortfarande betalar efter tre månader, delat med kohorten som började betala. M6 och M12 är samma mått senare. Årsplan mot månadsplan är en dimension i analysen, inte ett eget mål.

Utan källa, waitlist_signup, account_created, first_comparison_available, subscription_started och kohort går formlerna inte att räkna. Det är den data som krävs.

High-LTV är frågor, inte ett resultat. Vilka källor skapar kunder som stannar? Vilka beteenden skiljer de mest värdefulla? Vilka kohorter ger störst värde över tid? LTV får vänta tills retentionen är verklig.

## Intern kontroll

[REKOMMENDATION] Mätmodellen och formlerna. Inga måltal är satta, och inga ska hittas på i exporten.

Slide 15 är vad och hur vi mäter. Slide 16 är vad resultaten får oss att göra.

[HYPOTES] Att high-LTV-frågorna är rätt analys när data finns. Inga svar finns.

LTV beräknas inte här.

Aktivering förblir första jämförelsen, first_comparison_available = true, även om flaggnamnet kan ligga i manus i stället för i tratten.

Månadsplan / årsplan är analysdimension, inte en påstådd intäktsfördelning.
