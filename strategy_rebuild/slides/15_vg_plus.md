# Från utegym till aktiverad användare

**VG+** · Prototyp

## Syfte

Kartlägga den enda resa som ska demonstreras i en faktisk eller trovärdigt simulerad prototyp.

## Kärnbudskap

Utegymmet är både kanal och datapunkt.

## Synlig copy

PROTOTYPDEMO

Flödeskartan nedan visar vad som demonstreras i prototypen.

EN RESA

DEMO: syntetisk användare → faktisk/simulerad data → automation → resultat

KÄLLA

QR på utegym

qr_id = rydeback_utegym

↓

rytmstudio.se

↓

TRIGGER

waitlist_signup

↓

ACTION

spara källa + samtycke

↓

ACTION

skicka begärd lanseringsnotis

↓

account_created

SIMULERAD / FÖRESLAGEN IMPLEMENTATION

↓

first_workout_completed

↓

VILLKOR

first_comparison_available = true?

NEJ
→ fortsätt i aktiveringsflödet

JA
→ AKTIVERAD
→ stoppa aktiveringskommunikation

KPI

first_comparison_available = true

Källsegment

platsbunden QR / rydeback_utegym

Lifecycle

väntelista → konto → aktiverad

Koppling till Service Blueprint

01 Källan fångas på webben.
02 Matchningen väntelista → konto är simulerad.
03 Produktstatus når automationen.

Efter aktivering, litet

Sprid träningsglädjen!
→ dela
→ föreslaget share_id

Utegymmet är både kanal och datapunkt.

## Layout

En enda vertikal huvudresa. Ingen A/B-layout och ingen andra kundresa. Sliden är kartan till demonstrationen, inte prototypen i sig.

QR är källan. waitlist_signup är triggern. Den enda förgreningen sitter på first_comparison_available.

KPI, segmentering och Blueprint-koppling ligger intill huvudresan. Delningsfortsättningen kommer först efter AKTIVERAD och är visuellt sekundär.

PROTOTYPDEMO och förklaringen ligger nära titeln. Demo-callouten är synlig men underordnad huvudflödet.

## Bild / diagram

Diagrammet byggs i Figma som karta till den faktiska eller simulerade prototypdemonstrationen.

Typ: En flödeskarta för prototypdemon med en liten villkorsgren.

En liten utegymbild kan användas som startvinjett. Ingen falsk QR-kod.

## Talarmanus

Den här sliden är kartan. Nu visar jag hur samma resa simuleras eller demonstreras i prototypen. Den här sliden visar flödet jag nu demonstrerar i prototypen.

Byt nu från presentationen till den faktiska prototypen, en trovärdig simulering eller en skärminspelning. Visa en syntetisk testanvändare och låt qr_id rydeback_utegym följa med som källdata. Visa att waitlist_signup utlöser flödet och att minst tre handlingar genomförs: källan och samtycket sparas, den begärda lanseringsnotisen skickas och användarstatusen uppdateras genom resan.

QR-koden är källan och bär qr_id rydeback_utegym. Personen kommer till rytmstudio.se. Den faktiska automationstriggern är waitlist_signup, inte QR-skanningen.

När anmälan finns sparas källa och samtycke. Den begärda lanseringsnotisen kan sedan skickas. Lanseringsnotis och marknadsföringssamtycke är fortfarande två olika ja.

När kontot skapas matchas väntelistan till kontot. Den kopplingen är simulerad och föreslagen, inte ett påstående om hur systemet fungerar idag.

Efter första passet frågar flödet om first_comparison_available är true. Om nej fortsätter aktiveringsflödet. Om ja är användaren aktiverad och aktiveringskommunikationen stannar. Huvud-KPI:n är att första jämförelsen finns.

Källsegmentet är platsbunden QR, rydeback_utegym. Lifecycle går från väntelista till konto och aktiverad. Det är samma tre brytpunkter som i Service Blueprint: källfångst, kontomatchning och produktstatus till automation.

I demonstrationen ska både villkorsgrenen, source- och lifecycle-segmenteringen och resultatet first_comparison_available = true synas. Matchningen waitlist → account är simulerad och föreslagen. Säg inte att VG+-kravet är visat innan den faktiska eller simulerade demonstrationen har genomförts.

Efter aktivering kan Sprid träningsglädjen! erbjuda en enkel delning. Ett föreslaget share_id kan senare göra återkommande trafik mätbar. Det är en liten fortsättning, inte kärnan i VG+-resan.

Utegymmet är både kanal och datapunkt.

## Intern kontroll

[KRITISKT FÖRE INLÄMNING: Lägg in faktisk prototyplänk, skärminspelning eller live-demo. Slide 15 är endast kartan över demon.]

[SIMULERAD / FÖRESLAGEN IMPLEMENTATION] Matchningen väntelista → konto.

[VERIFIERA] qr_id, kontokoppling, eventnamn, produktstatus till MA och föreslaget share_id.

En huvudresa. Den enda grenen är villkoret på första jämförelsen.

Sprid träningsglädjen! kommer bara efter AKTIVERAD och får inte dominera prototypen.
