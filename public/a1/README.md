# telc Deutsch A1 — vier Übungsprüfungen

Vier vollständige Übungsprüfungen für **telc Deutsch A1 / Start Deutsch 1**, mit Hören, Lesen
und Schreiben im Ablauf der echten Prüfung. Läuft lokal, ohne Internet, ohne Konto.

## Starten

```bash
./start.sh
```

Dann <http://127.0.0.1:8765> öffnen. Kopfhörer aufsetzen.

Die Seite muss über den Server laufen. Als Datei (`file://`) blockiert der Browser
das Laden der Aufgaben und Aufnahmen.

## Was drin ist

| | Umfang |
|---|---|
| Prüfungssätze | 4 (je 30 bewertete Aufgaben) |
| Hörtexte | 60 Aufnahmen, 6–14 Sekunden |
| Sprecher | 6 deutsche Neural-Stimmen, je Prüfung ein anderes Paar |
| Auswertung | automatisch für Hören, Lesen und das Formular |

Jeder Satz hat ein eigenes Thema: Alltag in der Stadt, Familie und Wohnen,
Reise und Freizeit, Arbeit und Termine.

## Ablauf

**Hören, ca. 20 Minuten.** Drei Teile, 15 Aufgaben.

- Teil 1 (1–6): kurze Gespräche, Bild ankreuzen — **zweimal** hören
- Teil 2 (7–10): Durchsagen, richtig/falsch — **nur einmal** hören
- Teil 3 (11–15): Ansagen am Telefon — **zweimal** hören

Die Anzahl der Wiedergaben wird durchgesetzt. Ist ein Text verbraucht, lässt er
sich in diesem Durchgang nicht mehr starten — wie in der Prüfung. Mit
*Aufnahme starten* läuft die komplette Tonspur mit Lese- und Ankreuzpausen durch.
Neu beginnen kannst du über die Startseite der jeweiligen Prüfung.

**Lesen und Schreiben, 45 Minuten.** Ein Block ohne Pause: 15 Leseaufgaben,
ein Formular und eine Mitteilung von etwa 30 Wörtern.

**Auswertung.** Hören, Lesen und Formular werden automatisch bewertet, mit
Lösung, Erklärung auf Deutsch und Englisch und dem Hörtext. Die Mitteilung
bewertest du selbst nach dem offiziellen Raster (3 / 1,5 / 0 Punkte pro
Inhaltspunkt, 1 Punkt für Anrede und Gruß). Schriftlich bestanden ab 27 von 45.

## Die Aufnahmen

Gesprochen von deutschen Neural-Stimmen (Microsoft, über `edge-tts`), danach je
nach Textsorte bearbeitet:

- **Gespräche** — sauber, leichter Raumklang
- **Durchsagen** — Gong, Lautsprecherband 300–3400 Hz, Hallfahne
- **Anrufbeantworter** — Signalton, Telefonband 350–3200 Hz

Alle Clips sind auf gleiche Lautheit normalisiert (EBU R128), du musst zwischen
den Aufgaben also nichts nachregeln.

Aufnahmen neu bauen (braucht `ffmpeg`, `edge-tts` und Internet):

```bash
pip3 install --index-url https://pypi.org/simple edge-tts
python3 scripts/generate_audio.py --all      # alle 60 Clips
python3 scripts/generate_audio.py --exam 2   # nur Prüfung 2
python3 scripts/generate_audio.py            # nur fehlende
```

## Prüfen

```bash
python3 scripts/verify.py                    # Format, Antworten, Audiodateien
npm install --no-save jsdom && node scripts/test_app.js   # Oberfläche und Hörlimits
```

`verify.py` prüft unter anderem Aufgabenzahl pro Teil, Wiedergabezahl, gültige
Lösungsbuchstaben, vorhandene Erklärungen in beiden Sprachen und ob Ziffernfolgen
so geschrieben sind, dass die Stimme sie einzeln vorliest.

## Aufbau

```
index.html            Einstieg
css/styles.css        Gestaltung
js/app.js             Seiten, Routing, Antworten, Uhr
js/player.js          Wiedergabe und Hörlimits
js/scoring.js         Bewertung
js/icons.js           Bilder für die Hör-Aufgaben (SVG)
data/exam-1..4.json   Aufgaben, Lösungen, Erklärungen, Hörtexte
audio/exam-1..4/      60 Aufnahmen (M4A)
scripts/              Audio bauen, prüfen, testen
```

## Hinweis

Struktur, Zeiten und Aufgabentypen folgen dem offiziellen Format von Start
Deutsch 1. Alle Texte, Aufnahmen und Bilder sind neu erstellt und enthalten
keine Inhalte aus telc- oder Goethe-Materialien. Den kostenlosen offiziellen
Übungstest gibt es direkt bei [telc.net](https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/start-deutsch-1-/-telc-deutsch-a1/).

Sprechen ist hier nur als Übungsteil enthalten und wird nicht bewertet — es ist
in der echten Prüfung eine Gruppenprüfung.
