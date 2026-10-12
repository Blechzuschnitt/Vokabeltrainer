# Supabase

- Projekt: `vokabeltrainer-klasse` (Ref `kkohrbawvnixqawwhwjz`), Region Frankfurt `eu-central-1`, kostenloser Tarif.
- Migrationen werden über den Supabase-Connector eingespielt (`apply_migration`).
  - `klassen_app_grundlage`: Tabellen `classes`, `players`, `game_state`, `xp_log`, `word_lists`, Zugriffsregeln (RLS), Funktion `join_class(code, spitzname)`.
  - `spieler_mit_mehreren_geraeten`: Ein Kind (`players`) kann mehrere Geräte (`devices`, je ein anonymer Auth-User) haben. `join_class` gibt einmalig den Geräte-Code zurück, `link_device(code)` verknüpft ein weiteres Gerät. In der Datenbank liegt nur der Hash des Codes.
- Klassen: „Klasse 5“ (echte Klasse) und „Testklasse B“ mit Code `TESTB2` (nur für Tests der Zugriffsregeln).
- In der App steckt nur der öffentliche Schlüssel (`sb_publishable_…`). Er darf im Browser stehen; den Schutz übernehmen die Zugriffsregeln.
- Muss im Dashboard eingeschaltet sein: Authentication → Sign In / Providers → „Allow anonymous sign-ins“.
