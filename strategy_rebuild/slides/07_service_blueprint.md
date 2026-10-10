# Bakom samma resa

**Del 3** · Service Blueprint och interna processer

## Syfte

Visa samma sex steg ur organisationens perspektiv och de tre ställen där resan kan brytas.

## Kärnbudskap

Källan måste fångas innan användaren lämnar webben och går via App Store.

## Synlig copy

Samma sex steg som kundresan. Nu sett inifrån.

Systemraden namnger funktionella roller i casets modell. Inte verifierade produktnamn.

1 · UPPTÄCKA

Kund: Möter uttrycket där träningen redan pågår.
Frontstage: Kampanjens uttryck i kanalen.
Backstage: Val av uttryck, plats och avsändare.
System: Kanal / publiceringsyta
Data: Källa när den kan följa med, till exempel utm_*, ambassador_id, qr_id eller föreslaget share_id.
Automation: Ingen.

2 · KÄNNA IGEN SIG

Kund: Prövar om hållningen stämmer.
Frontstage: rytmstudio.se i samma ton som kampanjen.
Backstage: Ett nav, inte en ny sajt per kanal.
System: rytmstudio.se
Data: Besöket bär med sig källan dit lösningen räcker.
Automation: Ingen.

3 · VISA INTRESSE

Kund: Lämnar e-post för lanseringsbesked.
Frontstage: Ett formulär. Ett nästa steg.
Backstage: Lanseringsnotis och marknadsföringssamtycke är två separata ja.
System: Väntelistelösning + kommunikations-/MA-roll
Data: e-post, tidpunkt, samtycken, källa om den kan sparas, waitlist_signup.
Automation: Spara källa och samtycken. Vänta sedan på lansering.

— LANSERING —

4 · KOMMA IGÅNG

Kund: Loggar första passet.
Frontstage: Kort väg från konto till loggat pass.
Backstage: Koppla anmälningen till kontot om en stabil identifierare finns.
System: App + kundprofil / datalager
Data: account_created, account_id, first_workout_completed.
Automation: Om konto saknas, och ytterligare kommunikation är tillåten: max en relevant påminnelse, sedan stopp.

5 · FÅ BEVISET

Kund: Ser första jämförelsen.
Frontstage: Jämförelsen mot det första passet.
Backstage: En status lämnar produkten. Inte lyftens innehåll.
System: App + kundprofil / datalager
Data: first_comparison_available = true. Inte vikt, repetitioner eller mått.
Automation: AKTIVERAD. Stoppa aktiveringskommunikation.

6 · BEHÅLLA HISTORIKEN

Kund: Historiken är värd att behålla.
Frontstage: Första värdet är redan givet. Premium kommer när historiken bär.
Backstage: Premium väntar på meningsfull historik.
System: Abonnemangssystem + kundprofil / MA
Data: subscription_started, abonnemangsstatus, retention.
Automation: Premiumbudskap först när historiken är meningsfull. Stopp när abonnemanget har startat.

Brytpunkter

01 · KÄLLAN TAPPAS
Risk: UTM, ambassadör, delning eller QR följer inte med signup.
Rekommendation: spara relevant källdata tillsammans med waitlist_signup.

02 · LEAD KAN INTE KOPPLAS TILL KONTO
Risk: resan bryts efter App Store.
Rekommendation: stabil identifierare, exempelvis e-post.
FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS

03 · BETEENDET NÅR INTE AUTOMATIONEN
Risk: produkten vet att jämförelsen finns men automationen vet det inte.
Rekommendation: first_comparison_available = true
Automation får status. Inte exakta träningsvärden.

Källan måste fångas innan användaren lämnar webben och går via App Store.

## Layout

Sex kolumner i samma ordning som kundresan, med LANSERING mellan steg 3 och 4.

Sex rader: Kund, Frontstage, Backstage, System, Data och Automation.

Systemroller skiljs visuellt från event- och statusvärden. Under griden ligger tre numrerade brytpunkter.

## Bild / diagram

Diagrammet byggs i Figma.

Typ: Service Blueprint.

Komposition: Samma sex steg som Slide 06. Blueprinten är huvudytan och brytpunkterna en egen våning under.

## Talarmanus

Kunden såg sex tillstånd. Här är samma tillstånd med det som måste hända runt dem.

Före lansering behöver källan följa till anmälan, om lösningen tillåter det. Källan kan vara ambassador_id, utm-parametrar, qr_id eller ett föreslaget share_id. Oavsett källa går personen därefter in i samma kundresa.

Den stora risken sitter i bytet från webb till App Store. Källan måste fångas innan användaren lämnar webben. Därefter behöver väntelistan kunna kopplas till kontot med en stabil identifierare. Den kopplingen är föreslagen och behöver verifieras.

Systemraden visar funktionella roller, inte Rytms verifierade stack. Eventnamnen är casets språk. Automationen behöver statusen att första passet eller jämförelsen finns, inte vad personen lyfte.

## Intern kontroll

[FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS] Källagring, kontokoppling och statusflöden.

[VERIFIERA] Hur väntelistan lagras, om källfält kan följa med signup, hur konto matchas och om produktstatus kan nå MA.

Systemnamnen är funktionella roller. Händelsenamnen är inte verifierade produktionsevents.

Slide 06 är kundperspektivet. Slide 07 är organisationsperspektivet.
