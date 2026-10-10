# Rytm — final strategy source of truth

Kort karta över den slutliga 15-slide-strategin. Strategin ligger i slidesen.

## Position

`Rytm är träningsverktyget för människor som gillar träning mer än träningskultur.`

## Kampanj

`SKAFFA RYTM.`

Kampanjattityd:

`Rå träning. Enkel statistik. Färre grafer.`

## Tre vägar in

- Ambassadör
- SoMe
- QR

`Ambassadör / SoMe / QR → rytmstudio.se → väntelista`

Alla källor går därefter in i samma lifecycle.

## Lifecycle och affär

`KÄLLA → VÄNTELISTA → KONTO → AKTIVERING → BETALNING / RETENTION`

Aktivering:

`first_comparison_available = true`

Källfält i modellen:

`ambassador_id · utm_* · qr_id · föreslaget share_id`

## Advocacy efter aktivering

`Sprid träningsglädjen!`

Detta är en post-activation CTA, inte en ny kampanjplattform.

`AKTIVERING → DELNING → NY TRAFIK`

## Huvudrekommendationer

1. Ta en tydlig kulturell position.
2. Testa Ambassadör, SoMe och platsbunden QR som tre vägar till samma väntelista.
3. Spara källan genom hela resan.
4. Låt beteendet styra automationen.
5. Gör aktiveringen till en delningsbar händelse.

## VG+ huvudresa

`utegym → waitlist_signup → account_created → first_workout_completed → first_comparison_available → AKTIVERAD`

QR är källa. Triggern är `waitlist_signup`. Matchningen väntelista → konto är simulerad.

## Source of truth

`strategy_rebuild/slides/`

Mappen innehåller exakt 15 aktiva slidefiler.

Öppna frågor som behöver mänsklig kontroll: `strategy_rebuild/VERIFICATION.md`.

Om ett äldre dokument motsäger `slides/` eller detta README är det legacy-material och ska inte användas.

Äldre strategi från före den här kartan ligger i `_archive/strategy_rebuild_legacy_pre_final_cleanup/`.
