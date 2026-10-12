# Supabase

- Projekt: `vokabeltrainer-klasse` (Ref `kkohrbawvnixqawwhwjz`), Region Frankfurt `eu-central-1`, kostenloser Tarif.
- Migrationen werden über den Supabase-Connector eingespielt (`apply_migration`).
  - `klassen_app_grundlage`: Tabellen `classes`, `players`, `game_state`, `xp_log`, `word_lists`, Zugriffsregeln (RLS), Funktion `join_class(code, spitzname)`.
  - `spieler_mit_mehreren_geraeten`: Ein Kind (`players`) kann mehrere Geräte (`devices`, je ein anonymer Auth-User) haben. `join_class` gibt einmalig den Geräte-Code zurück, `link_device(code)` verknüpft ein weiteres Gerät. In der Datenbank liegt nur der Hash des Codes.
  - `rangliste`: `log_round(xp, woerter)` bucht eine Runde (höchstens 4 XP pro Wort + 10, höchstens 20 Runden pro Tag), `leaderboard()` liefert Top 10 der eigenen Klasse für die laufende Woche (Mo 00:00 bis So 23:59, Europe/Berlin) plus eigenen Platz.
  - `admin_bereich`, `admin_login_fix`: Admin-Anmeldung mit Name und Passwort (`admin_login`, bcrypt-Hash in `private.admins`, Sperre nach 8 Fehlversuchen in 15 Minuten), `admin_overview`, `admin_create_class`, `admin_rename_player`, `admin_remove_player`, `admin_save_list`, `admin_delete_list`, `admin_set_password`. Klassen-Listen lassen sich nur noch über diese Funktionen schreiben.
- Admin-Konten werden direkt in `private.admins` angelegt (nicht per Migration, damit kein Passwort im Verlauf steht).
- Der KI-Schlüssel (Anthropic) liegt nie in Supabase, nur im Browser des Admin-Geräts.
- Klassen: „Klasse 5“ (echte Klasse) und „Testklasse B“ mit Code `TESTB2` (nur für Tests der Zugriffsregeln).
- In der App steckt nur der öffentliche Schlüssel (`sb_publishable_…`). Er darf im Browser stehen; den Schutz übernehmen die Zugriffsregeln.
- Muss im Dashboard eingeschaltet sein: Authentication → Sign In / Providers → „Allow anonymous sign-ins“.
