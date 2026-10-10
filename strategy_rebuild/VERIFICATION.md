# Verifiering

Bara sådant som behöver mänsklig kontroll. Strategin ändras inte här.

Slides och `README.md` är source of truth. Den här listan säger vad som inte får presenteras som redan sant.

## Verifiera före slutexport

- Aktuella konkurrentbudskap, om direkta citat ska användas. Utan verifiering: ingen citatrad.
- Exakt lanseringsdatum. Okänt datum sätts inte på en slide.
- Publik pricing. `59 kr/mån · 490 kr/år` förblir prishypotes tills ett publikt pris finns.
- Exakt premiumomfång. Gratis och premium på intäktssliden är en föreslagen modell.
- Tillgång till en riktig Rytm-QR som asset. Ingen falsk eller genererad QR används.

## Verifiera före verklig implementation

- Hur väntelistan lagras.
- Om `ambassador_id` kan lagras tillsammans med signup och senare kundprofil.
- Om `utm_*` och `qr_id` kan följa med genom väntelistan.
- Om delningslänkar kan bära ett föreslaget `share_id`.
- Hur väntelista kan matchas till konto. I caset är det en föreslagen implementation, simulerad i VG+.
- Faktiska interna eventnamn. Namnen i slidesen är casets modell.
- Befintliga MA-funktioner och flöden, inklusive om produktstatus kan stoppa irrelevant kommunikation.
- Vilka verkliga system som motsvarar blueprintens funktionella roller: kanal, `rytmstudio.se`, väntelistelösning, app och kundprofil, abonnemang.
- Publik pricing och exakt premiumomfång, innan de byggs som erbjudande.

Påstå inte att Rytm saknar ett fält, ett flöde eller ett system som inte är verifierat.
