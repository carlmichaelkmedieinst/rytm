# Vi behöver inte mer data. Vi behöver rätt data.

**Del 4** · Data och datainsamling

## Syfte

Avgränsa vilken data kedjan behöver, varifrån den kommer, var den lever, och vad den används till.

## Kärnbudskap

Automationen behöver veta att något har hänt – inte exakt vad personen lyfte.

## Synlig copy

1 · ANSKAFFNING

Data: utm_source · utm_campaign · utm_content · creator_id · qr_id

Källa: QR · kampanjlänk · annons / kreatör

Insamling: URL / länkparametrar vid besök och signup

Lagring i modellen: med väntelisteprofil / attribution
FÖRESLAGEN DATAVÄG – BEHÖVER VERIFIERAS

Användning: jämföra kanal, plats och uttryck mot senare kundvärde

2 · IDENTITET OCH SAMTYCKE

Data: e-post · created_at · konto-id · lanseringsnotis · marknadsföringssamtycke

Källa: formulär → senare konto

Insamling: aktivt uppgivet av användaren

Lagring i modellen: leadprofil → senare kundprofil

Användning: lanseringsbesked · tillåten kommunikation · möjlig kontokoppling

Lanseringsnotis och marknadsföringssamtycke är två separata ja.

3 · BETEENDE OCH STATUS

Data: training_frequency · first_workout_completed · first_comparison_available · premium_eligible

Källa: onboarding + appbeteende

Insamling: självrapporterat + händelser/status från produkten

Lagring i modellen: kundprofil / event- eller statuslager

Användning: automation · aktivering · premiumtiming

training_frequency börjar självrapporterat och kan senare kompletteras eller ersättas av faktiskt beteende.

4 · KOMMERSIELLT

Data: subscription_started · abonnemangsstatus · retention

Källa: abonnemang/betalning

Insamling: abonnemangshändelser

Lagring i modellen: kundprofil + kommersiell historik

Användning: CAC · retention · framtida LTV

DATAKVALITET

Stabila ID:n · tidsstämplar · deduplicering · samtyckeshistorik

Dataklassning

Zero-party
Aktivt uppgivna preferenser och samtycken. Till exempel training_frequency, lanseringsnotis och marknadsföringssamtycke.

First-party
Identitet, egen källdata, webb- och appbeteende, betalning. E-post hör hemma här.

Externt / aggregerat
Annonsplattformar, App Store Connect och liknande.

Automationen behöver veta att något har hänt – inte exakt vad personen lyfte.

Synkas inte till MA/mejl när det inte behövs: vikt, repetitioner, kroppsmått, progressbilder.

Profildata samlas när den blir handlingsbar – inte för att den kan vara intressant.

Operativ modell
Inte kön. Inte ålder. Inte exakt GPS.

Research, avskilt från operativ modell
Åldersintervall, frivilligt kön, region, träningsmiljö och träningsfrekvens får användas i research.

## Layout

Fyra grupper i en rad, tunna avdelare, inte fyra dashboard-kort och inte en databastabell. Varje grupp har fem korta rader: data, källa, insamling, lagring, användning. Liten sans. Bara anskaffningens lagring bär märket FÖRESLAGEN DATAVÄG – BEHÖVER VERIFIERAS.

DATAKVALITET är en enda rad under grupperna, inte ett femte block.

Under dem tre klasser på en egen rad: zero-party, first-party, externt. E-post pekas uttryckligen till first-party, så att den inte glider in bland samtyckena.

Två principer i serif längst ner: status räcker, och profildata väntar tills den är handlingsbar.

En smal notis skiljer operativ modell från research. Research får inte se ut som fält vi samlar i produkten.

Vit grund. Inga blå datakartor.

## Bild / diagram

Diagrammet ska byggas i Figma istället för foto.

Typ: Fyra datagrupper plus en klassningsrad.

Syfte: Göra “rätt data” till en avgränsning, inte en katalog.

Motiv: Anskaffning, identitet och samtycke, beteende och status, kommersiellt.

Komposition: Fyra lätta kolumner. Fem korta rader i varje. Klassning och princip under. Ingen tabell med dubbletter av samma fält.

Text i bilden: Ingen utöver strukturen.

## Talarmanus

Frågan är inte hur mycket vi kan samla. Frågan är vad som hjälper kedjan från källa till betalning. Varje grupp säger varifrån datan kommer, hur den fångas, var den behöver leva i modellen, och vad den används till. Det är fyra korta rader, inte ett schema.

Anskaffning berättar vilka kanaler, platser och uttryck som senare ger värdefulla kunder. Identitet är e-post, tidpunkt och så småningom konto. Lanseringsnotis och marknadsföringssamtycke är två ja. Det ena är beskedet personen bett om. Det andra är tillstånd för annan kommunikation.

Beteende hålls som status. Träningsfrekvens kan personen uppge själv i onboarding. Den uppgiften är zero-party, och den kan senare stå tillbaka för det personen faktiskt gör. Första passet, första jämförelsen och att historiken blivit premiumrelevant är statusar.

E-post är inte zero-party. Den är first-party identitet. Zero-party är det personen aktivt uppger som preferens eller samtycke.

Betalning och retention är det kommersiella lagret. Annonsplattformar och App Store Connect är externa och aggregerade. De ersätter inte vår egen kedja.

Automationen behöver veta att något har hänt. Den behöver inte veta vad personen lyfte. Vikt, repetitioner, kroppsmått och progressbilder synkas inte till MA eller mejl när status räcker.

Kön, ålder och exakt GPS är inte operativa standardfält. I research kan åldersintervall, frivilligt kön, region, träningsmiljö och träningsfrekvens fortfarande vara relevanta. Det är en annan insamling, med ett annat syfte.

## Intern kontroll

[REKOMMENDATION] Fältlistan är den data caset behöver för kedjan. Den är inte en inventering av produktionens schema.

[VERIFIERA] Om källfälten redan finns. Skriv inte att de saknas. Lagringen med väntelisteprofil är en föreslagen dataväg.

[VERIFIERA] Exakta interna eventnamn. Namnen här är casets språk.

E-post klassas som first-party. Den får inte kallas zero-party i exporten.

Lanseringsnotis och marknadsföringssamtycke förblir två separata ja, även om båda är zero-party samtycken.

Exakta träningsvärden skickas inte till MA där status räcker.

Kön, ålder och exakt GPS läggs inte in som operativa standardfält.
