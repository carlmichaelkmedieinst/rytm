# Automationen följer beteendet – den jagar inte kalenderdagar.

**Del 5** · Marketing Automation-strategi

## Syfte

Visa att kommunikation styrs av status i kedjan, med tid bara som väntan.

## Kärnbudskap

Tid kan styra väntan. Status styr vad som får hända.

## Synlig copy

waitlist_signup
→ spara källa + samtycken
→ vänta på lansering
→ skicka lanseringsnotisen personen bett om

account_created?

NEJ
Om ytterligare kommunikation tillåts:
max en relevant påminnelse
sedan stopp

JA
→ koppla källa till konto
FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS

first_workout_completed?

NEJ
→ relevant onboarding där det är tillåtet

JA
→ uppdatera status

first_comparison_available = true?

NEJ
→ hjälp personen tillbaka vid relevant tidpunkt

JA
→ AKTIVERAD
→ stoppa aktiveringskommunikation

Sedan, litet

meningsfull historik
→ premium_eligible
→ premiumbudskap
→ subscription_started
→ stoppa premiumerbjudanden

Tid kan styra väntan. Status styr vad som får hända.

## Layout

Ett huvudflöde uppifrån och ner. Tre villkor som tunna grenar, där JA-spåret är den starka linjen och NEJ-spåret är kort.

Premium är en smal fortsättning längst ner, mindre typ, så att den inte tar över sliden.

Märkningen FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS sitter direkt på kopplingen väntelista till konto.

Inga kalenderdagar som rubriker. Inga “dag 3 / dag 7”. Vit grund, burgundy på AKTIVERAD och på principen.

Diagrammet byggs i Figma.

## Bild / diagram

Diagrammet ska byggas i Figma istället för foto.

Typ: Statusflöde.

Syfte: Visa att nästa meddelande beror på vad som hänt, inte på hur många dagar som gått.

Motiv: waitlist_signup, tre villkor, aktivering, en liten premiumfortsättning.

Komposition: Vertikal. NEJ-grenar korta. Premium visuellt sekundär.

Text i bilden: Villkor och utfall, enligt synlig copy.

## Talarmanus

Vi jagar inte en kalender. Tid får avgöra hur länge vi väntar. Status avgör vad som får skickas.

När någon går med på väntelistan sparas källa och samtycken, och sedan väntar vi på lansering. Det som ska gå ut är lanseringsnotisen personen bett om. Det är inte samma sak som marknadsföringssamtycke.

När lanseringen finns frågar vi om kontot är skapat. Om inte, och om ytterligare kommunikation är tillåten, går max en relevant påminnelse. Sedan stopp. Den som bara sagt ja till lanseringsbesked ska inte få en serie.

Om kontot finns är rekommendationen att koppla källan till kontot. Det är en föreslagen implementation och behöver verifieras. Vi beskriver den inte som något som redan sitter i systemet.

Nästa fråga är om första passet är loggat. Om inte: relevant onboarding, där det är tillåtet. Om ja: uppdatera status. Inga lyftvärden i mejlet.

Sedan den fråga som definierar aktivering: finns första jämförelsen? Om inte, hjälp personen tillbaka när det är relevant, inte enligt ett fast dag-schema. Om ja: personen är aktiverad, och aktiveringskommunikationen stannar.

Premium är en fortsättning, inte huvudflödet. Först när historiken är meningsfull. När abonnemanget startat tystnar erbjudandena.

## Intern kontroll

[FÖRESLAGEN IMPLEMENTATION – BEHÖVER VERIFIERAS] Kopplingen från väntelista till konto. Hela flödet är casets automationsstrategi, inte ett dokumenterat nuläge.

[VERIFIERA] Befintliga MA-flöden innan något av det här ritas som att det redan kör.

[VERIFIERA] Exakta interna events. Namnen är casets modell.

Lanseringsnotis skickas för att personen bett om den. Annan kommunikation kräver att den är tillåten.

Automationen får status, inte vikt, repetitioner, mått eller progressbilder.

Premium får inte dominera sliden i layout eller manus.

Inga kalenderstyrda sekvenser som huvudlogik.
