# Bakom samma resa

**Del 3** · Service Blueprint och interna processer

## Syfte

Visa samma sex steg ur organisationens perspektiv, och de tre ställen där resan kan brytas.

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
Data: Källa när den kan följa med, till exempel utm, creator_id eller qr_id.
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
Data: e-post, tidpunkt, de två samtyckena, källa om den kan sparas, waitlist_signup.
Automation: Spara källa och samtycken. Vänta sedan på lansering.

— LANSERING —

4 · KOMMA IGÅNG

Kund: Loggar första passet.
Frontstage: Kort väg från konto till loggat pass.
Backstage: Koppla anmälningen till kontot om en stabil identifierare finns.
System: App + kundprofil / datalager
Data: account_created, konto-id, first_workout_completed.
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
Data: premium_eligible, subscription_started. Inte träningsvärden.
Automation: Premiumbudskap först då. Stopp när abonnemanget har startat.

Brytpunkter

01 · KÄLLAN TAPPAS
Risk: UTM, kreatör eller QR följer inte med signup.
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

Sex kolumner, samma ordning som kundresan, med LANSERING mellan 3 och 4. Sex rader: Kund, Frontstage, Backstage, System, Data, Automation.

Kundraden är en tunn påminnelse, inte en upprepning av hela kartan. Frontstage och backstage skiljs med en linje, inte med två färgfält.

Under griden: tre brytpunkter i en rad, numrerade 01–03. Brytpunkt 02 bär märkningen FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS synligt.

Slutraden i editorial serif, ensam under brytpunkterna.

Inget blått dashboard-rutnät. Tunna linjer, vit grund, mörkröd/brun text.

## Bild / diagram

Diagrammet ska byggas i Figma istället för foto.

Typ: Service blueprint.

Syfte: Läsa organisationen kolumn för kolumn mot samma resa som kunden.

Motiv: Sex processteg, sex lager, tre brytpunkter.

Komposition: Blueprinten är huvudytan. Brytpunkterna är en egen våning under, så att riskerna inte drunknar i cellerna.

Text i bilden: Etiketter och korta celler, enligt synlig copy.

## Talarmanus

Kunden såg sex tillstånd. Här är samma tillstånd med det som måste hända runt dem.

Före lansering är webben hela den yta vi äger. Upptäckt och igenkänning bär källan. Vid anmälan måste källan sparas, om lösningen tillåter det. Samtidigt är lanseringsnotis och marknadsföringssamtycke två olika ja. Den som bara vill veta när Rytm släpps har inte sagt ja till annan reklam.

Den stora risken sitter i bytet från webb till App Store. Källan måste fångas innan användaren lämnar webben. Efteråt är rekommendationen en stabil identifierare, till exempel e-post, så att väntelistan kan kopplas till kontot. Den kopplingen är en föreslagen implementation och behöver verifieras. Vi påstår inte att den saknas idag. Vi påstår att resan bryts om den inte finns när kontot skapas.

Systemraden är roller i modellen: kanal, sajt, väntelista, app och abonnemang. Den är inte Rytms verkliga stack, och den bär inte eventnamn. Statusen ligger på dataraden. first_workout_completed betyder att första passet är loggat. first_comparison_available = true betyder att första jämförelsen finns. Automationen får veta att det har hänt, och att personen är aktiverad. Den får inte vikten, repetitionerna eller måtten.

Premium är sista kolumnen, inte motorn. Den väntar tills historiken är meningsfull.

## Intern kontroll

[REKOMMENDATION] Blueprintens backstage, data och automation är casets arbetsmodell.

[FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS] Brytpunkt 02, och varje cell som beskriver koppling, lagring eller MA-flöde.

[VERIFIERA] Hur väntelistan lagras, och om källdata kan följa med waitlist_signup.

[VERIFIERA] Om en stabil identifierare kan koppla väntelista till konto.

[VERIFIERA] Om first_comparison_available kan nå automationen som status.

[VERIFIERA] Vilka MA-flöden som redan finns. Beskriv dem inte som frånvaro.

Händelsenamnen är casets språk. De är inte verifierade som befintliga interna events. De ligger på dataraden, inte på systemraden.

Systemnamnen är funktionella roller i den föreslagna modellen. Rytms faktiska systemarkitektur behöver verifieras.

[VERIFIERA] Vilka verkliga system som motsvarar rollerna kanal, väntelistelösning, app/datalager och abonnemang.

Påstå inte att dagens system saknar källsparning, koppling eller statusflöde.

Slide 10 förblir kundperspektiv. Den här sliden är organisationsperspektivet.
