# TestIt Live-Sync: Legalgen Ai By Dp
> **Automatische Zwei-Wege-Synchronisation zwischen Handy, Desktop & KI (Antigravity / Claude Code)**
> - App-ID: `1793930958419` | Zuletzt aktualisiert: 9.11.2026, 00:21:59
> - **Anweisung für KI (Antigravity / Claude Code):**
>   1. Du kannst diese Datei jederzeit lesen, um den aktuellen Stand einzusehen.
>   2. **Du darfst diese Datei direkt bearbeiten!** Änderungen werden sofort mit Desktop & Smartphone synchronisiert.
>   3. **Thematische Test-Bereiche nutzen & erledigte Tests aufräumen:**
>      - Unterteile Tests in `## Test-Checkliste (QA)` in thematische Bereiche mit Zwischenüberschriften `### <Bereichsname>` (z. B. `### Vorlagen-Editor`, `### Export & Druck`). Desktop & Smartphone gruppieren und filtern sie dadurch automatisch!
>      - Sobald der Nutzer einen Test als bestanden (`- [x]`) markiert hat, lösche diese erledigte Zeile aus dieser Datei, um Platz zu machen. Lösche oder verändere NIEMALS noch offene (`- [ ]`) Tests eigenmächtig!
>   4. **WICHTIG – Eigene Nutzer-Wünsche vs. KI-Vorschläge (Roadmap):**
>      - **Wünsche des Nutzers (`[NEU]`):** Sind IMMER vom Nutzer gewollt und genehmigt! Frage den Nutzer NIEMALS nach einer Genehmigung (`[ANGENOMMEN]`) für seine eigenen Vorschläge! Sobald du einen solchen Eintrag siehst: Ändere `[NEU]` zu `[GELESEN]` (damit er in der App als registriert gilt), verfeinere ihn ggf. technisch und plane ihn direkt ein.
>      - **Deine eigenen KI-Vorschläge (`[KI]`):** Nur wenn DU selbst neue Vorschläge machst (Format: `- [FEATURE] [OFFEN] [KI] Titel: Beschreibung`), wartest du auf das Nutzer-Feedback (`[ANGENOMMEN]`, `[ABGELEHNT]`, `[OFFEN]`). Vorschläge mit `[ABGELEHNT]` bitte löschen.
>   5. Format für Tests: `- [ ] Titel: Beschreibung` (Offen), `- [x] Titel: Beschreibung` (Bestanden), `- [!] Titel: Beschreibung | Fehler: Was nicht ging` (Defekt).
>   6. Format für Roadmap: `- [FEATURE] [STATUS] [URSPRUNG] Titel: Beschreibung` (Ursprung: [NEU] = neu vom User, [GELESEN] = von KI erfasst/eingeplant, [KI] = eigener KI-Vorschlag).

## Übersicht
- **Tests gesamt:** 24 (0 OK, 0 Defekt, 24 Offen / Ungetestet)
- **Offene Bugs:** 0 (0 NEU vom User)
- **Roadmap (Features):** 0 (0 NEU vom User, 0 KI/Bekannt)
- **Notizen:** 0 (0 NEU vom User, 0 KI/Bekannt)

## Test-Checkliste (QA)
### Dashboard & Projektverwaltung
- [ ] Projekt anlegen: Neues Projekt mit Name, URL, Nutzungsart (Kommerziell/Gratis) und Projekttypen erstellen und prüfen, ob es im Dashboard erscheint.
- [ ] Projekt bearbeiten: Bestehendes Projekt über das Stift-Icon in der Detailansicht öffnen, Namen oder Projekttyp ändern und speichern.
- [ ] Projekt löschen: Projekt über das Papierkorb-Icon auf dem Dashboard auswählen, Sicherheitsabfrage bestätigen und prüfen, ob es dauerhaft entfernt wurde.
- [ ] Detailansicht & Navigation: Vom Dashboard in die Projektdetails wechseln, zwischen den Tabs "Impressum" und "Datenschutzerklärung" umschalten und zurück zum Dashboard navigieren.
- [ ] Zwischenablage-Funktion: In der Projekt-Detailansicht auf "Kopieren" klicken und prüfen, ob der aktuelle Rechtstext korrekt in die Zwischenablage kopiert wird.
- [ ] Text manuell bearbeiten: In der Projekt-Detailansicht auf "Text bearbeiten" klicken, Text im Markdown-Editor anpassen, auf "Speichern" klicken und prüfen, ob die Änderung übernommen wird.
- [ ] Datei-Export (.MD / .HTML / .TXT): In der Projekt-Detailansicht die Export-Buttons `.MD`, `.HTML` und `.TXT` anklicken und prüfen, ob die jeweilige Datei sauber heruntergeladen wird.

### Lokaler Projekt-Scanner (Electron)
- [ ] Ordner auswählen & scannen: Beim Erstellen oder in den Projektdetails einen lokalen Projektordner verknüpfen und prüfen, ob Projektname sowie genutzte Dienste (inkl. KI-SDKs, Hosting-Dateien, CDNs) automatisch erkannt werden.
- [ ] Erneut scannen: Bei einem bereits verknüpften Projekt auf "Erneut scannen" klicken und prüfen, ob die Liste der erkannten Dienste aktualisiert wird.

### Profil & Stammdaten
- [ ] Stammdaten speichern: Unter "Mein Profil" persönliche Daten, Anschrift und Unternehmensdaten eintragen, speichern und nach App-Neustart prüfen, ob alle Angaben erhalten bleiben.
- [ ] Status-Wechsel (Privat vs. Unternehmen): Zwischen "Privatperson / Einzelunternehmer" und "Unternehmen" wechseln und prüfen, ob die KI dies im nachfolgenden Generator-Chat berücksichtigt.

### KI-Generator & Chat
- [ ] Immer nur 1 Frage pro Schritt: Prüfen, dass die KI im Chat pro Nachricht immer nur eine einzige Frage stellt und nicht mehrere Fragen gleichzeitig nummeriert auflistet.
- [ ] Klickbare Schnell-Antworten (Quick-Reply-Buttons): Prüfen, dass unter der aktuellen KI-Frage anklickbare Antwort-Buttons erscheinen und ein Klick die gewählte Antwort direkt absendet.
- [ ] Nur Impressum generieren: Über den Button "Impressum erstellen" den Chat starten, Fragen beantworten und prüfen, ob am Ende nur das Impressum neu gesetzt wird (Datenschutz bleibt unberührt).
- [ ] Nur Datenschutzerklärung generieren: Über den Button "Datenschutzerklärung erstellen" den Chat starten, Fragen beantworten und prüfen, ob bestehendes Impressum erhalten bleibt (`KEEP_EXISTING`).
- [ ] Beide Dokumente generieren: Komplette Generierung für Impressum und Datenschutzerklärung durchführen, Vorschau in ResultStep prüfen und im Projekt speichern.
- [ ] KI-Teil-Überarbeitung bestehender Texte: Bei einem Projekt mit bereits vorhandenem Rechtstext auf "Mit KI aktualisieren" klicken und prüfen, ob die KI anbietet, gezielte Ergänzungen am bestehenden Text vorzunehmen.
- [ ] Übernahme von Profil & Scanner-Daten: Im ersten KI-Prompt prüfen, ob hinterlegte Profil-Stammdaten und automatisch gescannte Drittanbieter-Dienste direkt genannt und nicht erneut abgefragt werden.
- [ ] Chat abbrechen: Während einer laufenden KI-Konversation auf "Abbrechen" klicken und prüfen, ob man sauber ohne Datenverlust zum Dashboard zurückkehrt.

### Einstellungen, Backup & Gesetzes-Updates
- [ ] API-Key & Modell speichern: In den Einstellungen einen Gemini API-Key und ein Modell (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`) auswählen, speichern und prüfen, ob der Key sicher im System-Schlüsselspeicher (keytar) hinterlegt wird.
- [ ] Fehlender API-Key Warnhinweis: Prüfen, ob bei leerem API-Key der gelbe Warnbanner auf dem Dashboard erscheint und per Klick direkt in die Einstellungen führt.
- [ ] Gesetzesvorlagen bearbeiten: In den Einstellungs-Tabs "Impressum-Vorlage" und "Datenschutz-Vorlage" Texte anpassen, speichern und Persistenz prüfen.
- [ ] Automatischer Gesetzes-Check & Diff-Ansicht: Beim App-Start prüfen, ob der Zeitstempel der letzten Überprüfung aktualisiert wird und bei erkannten Abweichungen das Diff-Modal ("Änderungen anzeigen") wortbasierte Unterschiede anzeigt.
- [ ] Backup exportieren & importieren: In den Einstellungen unter "Datensicherung" ein JSON-Backup herunterladen und anschließend über "Backup-Datei auswählen..." wieder importieren.

## Bugs & Fehler
<!-- Keine Bugs gemeldet. Füge hier Bugs im Format "- [BUG] Titel: Beschreibung" ein -->

## Roadmap (Features)
<!-- Keine Roadmap-Features vorhanden. Füge hier "- [FEATURE] ..." ein -->

## Notizen
<!-- Keine allgemeinen Notizen vorhanden. Füge hier "- [NOTE] ..." ein -->
