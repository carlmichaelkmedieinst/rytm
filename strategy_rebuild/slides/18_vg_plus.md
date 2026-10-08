# Från utegym till aktiverad användare

**VG+** · Prototyp

VG+ prototyp · samma data genom hela kedjan

## Syfte

Visa en enda resa där samma källa följer med från utegymmet till aktiverad användare.

## Kärnbudskap

Utegymmet är både kanal och datapunkt.

## Synlig copy

DATA → TRIGGER → AUTOMATION → RESULTAT → KPI

EN RESA

Källa
QR på utegym
qr_id = rydeback_utegym
utm_content = daligt_pass_bra_manad

↓

rytmstudio.se

↓

syntetisk användare lämnar e-post

TRIGGER: waitlist_signup

Data som följer med
qr_id
utm_content
e-post
samtycken
lifecycle status

Lanseringsnotis och marknadsföringssamtycke är två separata ja.

AUTOMATION

1. spara källa + samtycken
2. skicka begärd lanseringsnotis
3. uppdatera status till AKTIVERAD och stoppa aktiveringskommunikation

↓

account_created

SIMULERAD / FÖRESLAGEN IMPLEMENTATION

↓

first_workout_completed

↓

samma övning loggas igen

↓

first_comparison_available = true?

NEJ
→ fortsätt i aktiveringsflödet

JA
→ AKTIVERAD
→ stoppa aktiveringskommunikation

premium_eligible → subscription_started

Segmentering

Källsegment: platsbunden QR / rydeback_utegym

Livscykelstatus: väntelista → konto → aktiverad

KPI
first_comparison_available = true

Koppling till Service Blueprint
01 Källan fångas på webben, innan App Store.
02 Matchningen väntelista → konto är simulerad.
03 Automationen får statusen, inte träningsvärdena.

Utegymmet är både kanal och datapunkt.

## Layout

En enda vertikal resa. Inga A- och B-kolumner.

Överst läsordningen DATA → TRIGGER → AUTOMATION → RESULTAT → KPI, i liten burgundy.

QR-steget är märkt Källa. TRIGGER: waitlist_signup är en egen rad, visuellt skild från QR, så att koden inte ser ut som triggern.

Den enda förgreningen är liten och sitter på first_comparison_available = true. NEJ är en kort rad tillbaka in i aktiveringsflödet. JA är huvudspåret till AKTIVERAD. Det är inte en andra resa.

Märkningen SIMULERAD / FÖRESLAGEN IMPLEMENTATION sitter bara på account_created.

Tre actions står samlade under automationen, numrerade.

Segmenteringen är två rader: källsegment och livscykelstatus. Premiumraden är liten, efter JA-spåret.

Huvud-KPI i burgundy. Kärnraden i editorial serif under resan.

Vit grund. Tunna linjer. Ingen blå systemkarta.

## Bild / diagram

Diagrammet ska byggas i Figma istället för foto.

Typ: Ett prototypflöde med en liten villkorsgren.

Syfte: Följa samma datapunkt från skylt till aktiverad användare, och visa vad som startar automationen.

Motiv: Källa, trigger, tre actions, simulerad kontokoppling, en gren på första jämförelsen, KPI.

Komposition: Vertikal huvudresa. Grenen är kort. Ingen uttryckstest-layout.

Text i bilden: Källa, TRIGGER: waitlist_signup, simuleringsmärket, och de två utfallen på jämförelsen.

En miljöbild av utegymmet kan återanvändas som liten startvinjett om den redan finns från slide 08. Den får inte bli en andra story.

## Talarmanus

VG+ är en resa, inte en kampanjdemo och inte ett A/B-test. A/B-testet av uttryck hör hemma i strategin, på experiment-sliden.

QR-koden är källan. Den bär qr_id rydeback_utegym och, i det här exemplet, utm_content daligt_pass_bra_manad, alltså uttrycket DÅLIGT PASS. BRA MÅNAD. Personen kommer till rytmstudio.se. En syntetisk användare lämnar e-post.

Triggern är waitlist_signup. Inte QR-skanningen. När anmälningen finns sparas källa och samtycken, och lanseringsnotisen personen bett om kan skickas. Lanseringsnotis och marknadsföringssamtycke är fortfarande två ja.

När kontot skapas kopplas väntelistan till kontot. Den kopplingen är simulerad. Den är en föreslagen implementation, inte ett påstående om hur systemet fungerar idag.

Sedan loggas ett pass. Samma övning loggas igen. Då finns villkoret: first_comparison_available = true? Om nej fortsätter personen i aktiveringsflödet. Om ja är användaren aktiverad, och aktiveringskommunikationen stannar. Det tredje actionet är den statusuppdateringen. Huvud-KPI:n är att jämförelsen finns.

Segmenten är två. Källsegmentet är platsbunden QR, rydeback_utegym. Livscykeln går väntelista, konto, aktiverad.

Längst ner, litet: när historiken är meningsfull kan premium_eligible leda till subscription_started. Det är fortsättningen, inte demon.

Prototypen läses som data, trigger, automation, resultat och KPI. Källan fångades innan App Store. Matchningen är simulerad. Automationen fick en status, inte vad personen lyfte. Brytpunkterna 01, 02 och 03 på blueprinten är samma tre ställen.

Utegymmet är både kanal och datapunkt.

## Intern kontroll

[ILLUSTRATIVT SCENARIO] Hela resan använder en syntetisk användare och exempelvärden. utm_content är ett exempel på uttryck A, inte ett resultat från test 1.

[SIMULERAD / FÖRESLAGEN IMPLEMENTATION] Matchningen väntelista → konto. Får inte presenteras som verifierat nuläge.

[VERIFIERA] Teknisk väg för qr_id, utm_content och kontokoppling innan prototypen visas som något annat än simulation.

[VERIFIERA] Exakta interna events. Namnen är casets modell. Triggern i modellen är waitlist_signup. QR är källa.

En huvudresa. Ingen A/B-demo. Den enda grenen är villkoret på första jämförelsen, inte ett andra flöde.

Huvud-KPI är first_comparison_available = true.

Tre actions ska synas: spara källa och samtycken, skicka begärd lanseringsnotis, uppdatera status till AKTIVERAD och stoppa aktiveringskommunikation.

Exakta träningsvärden ingår inte i det som sparas till automationen. “Samma övning loggas igen” är kundens handling i prototypen, inte en payload till mejl.

Premiumraden förblir liten.

Kopplingen till slide 11 ska kunna pekas ut i rummet: brytpunkt 01, 02 och 03.
