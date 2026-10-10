# Fem typer av data får kedjan att fungera.

**Del 4** · Data och datainsamling

## Syfte

Göra databehovet begripligt genom att bara visa det som kan ändra nästa beslut.

## Kärnbudskap

Samla bara data som kan ändra nästa beslut.

## Synlig copy

1 · KÄLLA

utm_* · ambassador_id · qr_id · share_id

Var kom användaren ifrån?

2 · IDENTITET

email · account_id · consent

Kan vi känna igen resan och kommunicera på rätt sätt?

3 · BETEENDE

first_workout_completed

Har personen kommit igång?

4 · AKTIVERING

first_comparison_available

Har personen fått Rytms första meningsfulla bevis?

5 · AFFÄR

subscription_started · retention

Blir användaren betalande – och stannar?

Samma kundresa. Olika källa. Jämförbart affärsresultat.

## Layout

Fem tydliga datatyper i en horisontell eller vertikal sekvens. Tunna avdelare, inga databastabeller och inga dashboard-kort.

Fältnamnen sätts i mono/data-stil. Frågorna är större och enklare än fältnamnen.

Slutprincipen ligger ensam över bredden.

## Bild / diagram

Diagrammet byggs i Figma.

Typ: Fem typer av data kopplade till fem affärsfrågor.

Syfte: Visa varför datan finns, inte beskriva ett komplett schema.

## Talarmanus

Det här är fem typer eller grupper av data, inte fem enskilda datapunkter. Varje grupp svarar på en affärsfråga och kan innehålla flera fält.

Källdatan kommer från länkar, ambassadörer, QR-placeringar och eventuellt delat Rytm-innehåll. Den fångas som länkparametrar eller ID:n vid besök och signup, behöver leva med lead- och senare kundprofilen och används för att jämföra källa mot aktivering, betalning och retention. share_id är ett föreslaget fält för attribution från delat innehåll, inte ett verifierat produktfält.

Identitet och samtycke uppges aktivt. E-post och konto-id är first-party-identitet. Preferenser och samtycken som personen själv lämnar är zero-party. Lanseringsnotis och marknadsföringssamtycke är två olika ja och samtyckeshistoriken måste kunna följas.

Beteende och aktivering kommer från produktstatus. first_workout_completed visar att personen kommit igång. first_comparison_available visar att det första meningsfulla beviset finns. Exakta träningsvärden behöver inte skickas till Marketing Automation när status räcker.

Affärsdatan kommer från abonnemang och kohorter. subscription_started och retention gör det möjligt att räkna CAC och senare LTV.

Datakvalitet kräver stabila ID:n, tidsstämplar, deduplicering och samtyckeshistorik. Extern plattformsdata kan komplettera, men ersätter inte vår egen kedja. Researchdata hålls avskild från den operativa modellen.

## Intern kontroll

[REKOMMENDATION] Fältlistan är casets minimala modell, inte en inventering av produktionens schema.

[FÖRESLAGET FÄLT – BEHÖVER VERIFIERAS] share_id.

[VERIFIERA] Exakta fältnamn, lagring, ID-kopplingar, samtyckeshistorik och eventnamn.

E-post klassas som first-party-identitet. Aktivt uppgivna preferenser och samtycken är zero-party.
