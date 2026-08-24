# Auftrag: Real-Estate-Vorlagen

Projekt: `C:\Users\User\OneDrive\Desktop\dalor-gallery` (Next.js + Strapi, läuft lokal
auf 127.0.0.1:1337). Antworte auf Deutsch.

**FANG NOCH NICHT AN.** Lies das hier, sieh dir das Admin Panel und ein paar bestehende
Vorlagen an, stell Rückfragen. Erst auf mein Startsignal loslegen.

## Auftrag

Neue Vorlagen für die Kategorie **"Real Estate"** — exakt so geschrieben.

Vorlagen kommen aus meiner Pinterest-Pinnwand **"Real Estate"**:
https://at.pinterest.com/sukhjitmultani/real-estate/

Dort liegen **49 Pins**. Jeder Pin ist die Vorlage für genau eine Galerie-Vorlage — bau
also 49 Vorlagen, nicht 50. Prüf beim Start kurz, ob die Zahl noch stimmt.

## Was diese Kategorie ausmacht

Immobilien-Marketing: Poster und Social-Media-Anzeigen, mit denen Makler und Bauträger
Objekte bewerben. Typische Muster:

- **"Just Listed" / "For Sale" / "Sold"** — Objektfoto mit großem Statusband, darunter
  eine Leiste mit Eckdaten (Zimmer, Bäder, Quadratmeter) und ein Call-to-Action
- **"Find your dream home"** — Agentur-Anzeige mit Leistungen und Kontaktdaten
- **Luxus-Exposé** — dunkle, ruhige Optik, Serifenschrift, Innenaufnahmen als Collage
- **Open House / Besichtigungstermin** — Datum und Uhrzeit prominent
- **Neubau-Projekt** — Visualisierung mit Projektname und Fertigstellungstermin

Deck die Bandbreite ab: Einfamilienhaus, Villa, Stadtwohnung, Penthouse, Neubauprojekt,
Gewerbefläche, Grundstück. Außen- und Innenaufnahmen, Tag und Abendstimmung, verschiedene
Preisklassen vom Erstkauf bis zum Luxusobjekt.

## Ablauf pro Vorlage

1. Pin ansehen. Bildkonzept ableiten: Objekttyp, Perspektive, Tageszeit, Layout der
   Textblöcke, Position der Eckdaten. **Nicht 1:1 nachbauen** — in die Richtung, mit
   eigener erfundener Agentur.
2. Bild mit Meta AI erzeugen (www.meta.ai, ist eingeloggt).
3. Herunterladen, nach `C:\Users\User\Downloads\Real-Estate` verschieben (Ordner anlegen).
4. Nach Strapi hochladen, Vorlage **als Entwurf** anlegen — **nicht veröffentlichen**.

## Besonderheit: viele Textfelder

Immobilien-Poster tragen mehr Text als jede andere Kategorie — Agenturname, Status,
Objektbezeichnung, Lage, Zimmerzahl, Bäder, Fläche, Preis, Telefonnummer, Webseite.
Das ist ein Vorteil für die Vorlagen: Es gibt viel Sinnvolles zum Personalisieren.

Aber: **Bildmodelle schreiben lange Zahlen und Telefonnummern oft falsch.** Halte die
Textmenge im Prompt beherrschbar — lieber vier gut lesbare Angaben als zehn verkrüppelte.
Telefonnummern und Webadressen nur dort, wo der Pin sie wirklich groß zeigt.

## Nichts veröffentlichen, bis das Bild freigegeben ist

Veröffentlicht wird erst, wenn ich das Bild im Review freigegeben habe (siehe Abschnitt
„Review-Werkzeug" unten).

- Neue Vorlagen: als Entwurf anlegen, den Publish-Aufruf weglassen.
- Falls du doch schon etwas veröffentlicht hast: auf Entwurf zurücksetzen über
  `POST /content-manager/collection-types/api::template.template/<documentId>/actions/unpublish`
  und merken, welche das waren — nach meiner Freigabe werden genau die wieder
  veröffentlicht.

Die Kategorie "Real Estate" ist derzeit **leer**, es ist also nichts zu löschen.

## Die Prompts — wichtigster Punkt

Die 50 Auto-Vorlagen im Projekt hatten **alle denselben Prompt**, Zeichen für Zeichen
identisch, und nur 3 Variablen. Deshalb waren sie wertlos: wer zwei kauft, bekommt
zweimal dasselbe. Das darf sich hier nicht wiederholen.

Jede Vorlage bekommt einen **eigenen** Prompt, abgeleitet aus ihrem Pin. Prüf das am Ende
ausdrücklich nach.

**6 bis 8 Variablen** pro Vorlage. Bei Immobilien typisch: Objekttyp, Baustil, Umgebung,
Tageszeit, Agenturname, Status ("JUST LISTED"), Lage, Eckdaten, Preis, Call-to-Action.

## Prompt-Konventionen — Pflicht

Gemessen an den 113 bestehenden Vorlagen im Projekt:

- **`{{image_description}}` muss als letzte Zeile stehen**, nach einer Leerzeile, ohne
  Beschriftung davor. 113/113 Prompts haben den Slot, 101 davon genau so. Steht er mitten
  im Satz, hinterlässt ein leeres Feld eine kaputte Stelle im fertigen Prompt. Und das
  Feld ist nicht pflichtig, bleibt also standardmäßig leer. Der Bootstrap-Service legt
  das *Eingabefeld* automatisch an, den *Slot im Prompt* aber **nicht**. Den musst du
  selbst setzen.
- **Seitenverhältnis in Prosa nennen** ("vertical 4:5"), 111/113 tun das. Fehlt es,
  liefern die Modelle 1:1 und das Textlayout bricht.
- **Variablennamen klein und snake_case.** 0 von 38 bestehenden sind GROSS.
- **Keine Midjourney-Syntax:** kein `--no`, kein `--ar` (0 bzw. 1 von 113).
- **Nur gerade Anführungszeichen** (`"`), keine typografischen. Bei den alten
  Auto-Vorlagen sind die zu Fragezeichen zerfallen: dort steht `?{{headline}}?` im Prompt.

## Eingabefelder

- **Konkrete Vorbelegungen**, keine "For example:"-Hinweise (1141 von 1541 Feldern machen
  das so). Die Defaults müssen exakt das Bild reproduzieren, das auf der Kachel liegt.
- `inputType: "text"` auch für Farben (1096× text, nur 6× color).
- Jeder Slot braucht ein Feld und jedes Feld einen Slot.

## Marken und echte Objekte

Erfundene Agenturnamen und Logos. Keine echten Maklerbüros, keine realen Adressen und
keine existierenden Gebäude, die wiedererkennbar wären. Erfundene Straßennamen und
Telefonnummern — keine echten Nummern, auch keine aus den Pins abgeschriebenen.

## Upload — dieser Weg funktioniert, andere nicht

Strapis Medien-Dialog erzeugt seinen `input[type=file]` erst beim Klick, das
`file_upload`-Werkzeug schlägt deshalb fehl. Stattdessen:

1. Bild nach `backend/public/__tmp_estate.webp` kopieren (Strapi serviert `public/` unter
   `/`, damit ist es gleichursprünglich erreichbar).
2. Im Admin-Tab per `javascript_tool` das JWT holen. **Beide Quellen prüfen:** früher lag
   es im Cookie `jwtToken`, aktuell in `localStorage.jwtToken` als JSON-String
   (`JSON.parse(...)` nötig). Dann `fetch('/__tmp_estate.webp')` → Blob → FormData →
   `POST /upload` mit `Authorization: Bearer <jwt>`. `/api/upload` gibt 403, das ist die
   öffentliche Route.
3. Vorlage anlegen: `POST /content-manager/collection-types/api::template.template`,
   Kategorie als `category: {connect:[{documentId: <catDoc>}]}`
4. **Nicht veröffentlichen** — die Vorlage bleibt Entwurf bis zur Freigabe im Review.
5. Temp-Datei löschen.

`javascript_tool`-Aufrufe laufen manchmal in einen Timeout, obwohl der Code durchgelaufen
ist. Dann in der DB nachsehen, nicht blind wiederholen.

## Bilder erzeugen und herunterladen

- Meta AI in **mehreren Browser-Tabs parallel** laufen lassen, nicht seriell in einem
  Chat. Vier bis fünf Tabs gleichzeitig, ein Bild dauert rund 40 Sekunden.
- Download über den Knopf **direkt am Bild im Chat**, nicht über die Vollbildansicht.
- Chrome blockiert nach mehreren Downloads stillschweigend und meldet trotzdem
  "Download started". Nach **jedem** Download mit `ls -lat` prüfen, ob die Datei da ist.

## Review-Werkzeug — erst bauen, wenn 49 Bilder im Ordner liegen

Sobald `C:\Users\User\Downloads\Real-Estate` **49 Bilder** enthält: keine weiteren Bilder
mehr erzeugen, sondern dieses Werkzeug bauen.

Bau eine **`index.html` direkt in den Bildordner**. Sie muss sich per **Doppelklick öffnen
lassen** (`file://`, kein Server) — der Ordner wird als ZIP an einen Reviewer
weitergegeben, der nichts einrichten kann. **Oberfläche komplett auf Englisch.**

- Bilder einzeln und groß, mit Zähler ("12 / 49").
- **Rechts wischen oder Pfeil rechts = approve**, **links = reject** mit Pflicht-Textfeld
  für die Kritik.
- Wischen per Maus und Touch, dazu zwei große Schaltflächen.
- Fortschritt in `localStorage`.
- Am Ende **"Download results"** → `review.json`:

```json
[
  { "file": "01-just-listed-villa.webp", "verdict": "approved" },
  { "file": "02-open-house-poster.webp", "verdict": "rejected",
    "comment": "Price is unreadable, house looks warped" }
]
```

Bilder über **relative Pfade** (`<img src="01-....webp">`), kein `fetch` auf lokale
Dateien, Dateiliste fest in die HTML schreiben.

Danach machst du anhand meiner `review.json`:

- **approved** → Bild nach `approved/`, Vorlage in Strapi **veröffentlichen**
- **rejected** → Bild nach `rejected/`, Kritik in `feedback.json`, Vorlage bleibt Entwurf

## Verifikation nach jeder Vorlage

Gegen `backend/.tmp/data.db` (readonly) prüfen: Bild verknüpft, Kategorie gesetzt,
`published_at` **ist null**, Prompt endet auf `{{image_description}}`, keine Waisen in
**beide** Richtungen, keine Fragezeichen-Artefakte im Prompt.

Am Schluss: **wie viele unterschiedliche Prompts sind es?** Deutlich weniger als die
Anzahl der Vorlagen heißt, etwas ist falsch gelaufen.

## Sonstiges

- **Strapi niemals selbst starten.** Prüf mit
  `curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:1337/admin`:
  bei `200` weiterarbeiten, sonst **mir melden**.
- Ich muss dich in Strapi einloggen, Passwörter darfst du nicht eintippen.
- Slugs müssen projektweit einmalig sein, vorher in der DB prüfen.
- Temp-Dateiname `__tmp_estate.webp` — mehrere Agenten arbeiten parallel.
- Arbeite durch, ohne pro Schritt zu fragen. Bericht am Ende als Tabelle.
