# Grundlagen für alle Kategorie-Aufträge

Diese Datei gilt für **jeden** `auftrag-*.md`. Die Kategoriedatei nennt nur, was für ihre
Kategorie besonders ist — alles andere steht hier.

Projekt: `C:\Users\User\OneDrive\Desktop\dalor-gallery`
Strapi läuft auf **https://design.dalorstudio.com** (nicht mehr lokal).
Galerie: **https://dalor-gallery.vercel.app**

Antworte auf Deutsch.

## Ablauf pro Vorlage

1. Pin ansehen. Bildkonzept ableiten: Motiv, Untergrund, Blickwinkel, Lichtstimmung,
   Textaufbau. **Nicht 1:1 nachbauen** — in die Richtung, mit eigener erfundener Marke.
2. Bild mit Meta AI erzeugen (www.meta.ai, ist eingeloggt).
3. Herunterladen, in den Ordner der Kategorie verschieben.
4. Nach Strapi hochladen, Vorlage **als Entwurf** anlegen — **nicht veröffentlichen**.

## Nichts veröffentlichen, bis das Bild freigegeben ist

Veröffentlicht wird erst nach dem Review. Neue Vorlagen als Entwurf anlegen, den
Publish-Aufruf weglassen. Falls doch schon veröffentlicht: zurücksetzen über
`POST /content-manager/collection-types/api::template.template/<documentId>/actions/unpublish`
und merken welche — nach der Freigabe gehen genau die wieder online.

## Die Prompts — wichtigster Punkt

Die ersten 50 Auto-Vorlagen hatten **alle denselben Prompt**, Zeichen für Zeichen
identisch, und nur 3 Variablen. Deshalb waren sie wertlos: wer zwei kauft, bekommt
zweimal dasselbe. Das darf sich nicht wiederholen.

Jede Vorlage bekommt einen **eigenen** Prompt, abgeleitet aus ihrem Pin. Prüf am Ende
ausdrücklich nach, wie viele **unterschiedliche** Prompts entstanden sind.

**6 bis 8 Variablen** pro Vorlage. Sinnvoll heißt: ändert sichtbar etwas im Bild.

## Prompt-Konventionen — Pflicht

Gemessen an den bestehenden Vorlagen:

- **`{{image_description}}` muss als letzte Zeile stehen**, nach einer Leerzeile, ohne
  Beschriftung davor. Steht der Slot mitten im Satz, hinterlässt ein leeres Feld eine
  kaputte Stelle im fertigen Prompt — und das Feld ist nicht pflichtig, bleibt also
  standardmäßig leer. Der Bootstrap-Service legt das *Eingabefeld* automatisch an, den
  *Slot im Prompt* aber **nicht**. Den musst du selbst setzen.
- **Seitenverhältnis in Prosa nennen** ("vertical 4:5"). Fehlt es, liefern die Modelle
  1:1 und das Textlayout bricht.
- **Variablennamen klein und snake_case.**
- **Keine Midjourney-Syntax:** kein `--no`, kein `--ar`.
- **Nur gerade Anführungszeichen** (`"`), keine typografischen. Bei den alten
  Auto-Vorlagen sind die zu Fragezeichen zerfallen: dort stand `?{{headline}}?`.

## Eingabefelder

- **Konkrete Vorbelegungen**, keine "For example:"-Hinweise. Die Defaults müssen exakt
  das Bild reproduzieren, das auf der Kachel liegt — die Vorlage muss ohne jede Eingabe
  funktionieren.
- `inputType: "text"` auch für Farben.
- Jeder Slot braucht ein Feld und jedes Feld einen Slot. Keine Waisen in beide Richtungen.

## Marken

Erfundene Marken und Logos. Keine echten Hersteller, keine realen Logos oder
Produktnamen — auch dann nicht, wenn der Pin eine echte Marke zeigt. Von solchen Pins
nur Bildaufbau, Licht und Typografie übernehmen. Der Markenname ist immer die Variable
`brand_name`.

Keine erkennbaren echten Personen. Models neutral beschreiben ("a model", "a woman in
her twenties"), Aussehen nicht über ein Eingabefeld steuerbar machen.

## Upload

1. Medienbibliothek öffnen (`/admin/plugins/upload`).
2. Den Knopf „Neue Dateien hinzufügen" **per `javascript_tool` klicken** — erst dadurch
   entsteht das `input[type=file]` im DOM.
3. `find` liefert die ref, dann `file_upload`. **Max. 10 MB pro Aufruf**, also in Chargen
   von etwa 16 Bildern.
4. Knopf „Lade N Dateien in die Bibliothek" klicken, per `/upload/files` verifizieren.

**Auth:** Das JWT liegt **nicht** in `localStorage`. Stattdessen `window.fetch` und
`XMLHttpRequest.setRequestHeader` hooken, dann in der Oberfläche eine Aktion auslösen
(sortieren, Seite wechseln) — der `Authorization: Bearer`-Header wird mitgeschnitten.

**Strapi 5:** `publishedAt` bleibt im Standard-Listing `null`, auch nach erfolgreichem
Publish. Zum Prüfen `?status=published` anhängen oder die öffentliche `/api/...` abfragen.

`javascript_tool`-Aufrufe laufen manchmal in einen Timeout, obwohl der Code durchgelaufen
ist. Dann nachsehen statt blind wiederholen. Publish-Schleifen in Chargen von ~12 fahren.

## Bilder erzeugen und herunterladen

- Meta AI braucht einen **sichtbaren Tab** — im Hintergrund kommt der Prompt nicht an.
  Laufen mehrere Agenten parallel, stehlen sie sich gegenseitig den Vordergrund.
- Download über den Knopf **direkt am Bild im Chat**, nicht über die Vollbildansicht.
- Chrome sperrt nach etwa 15 Downloads pro Sitzung stillschweigend und meldet trotzdem
  "Download started". Nach jedem Download prüfen, ob die Datei wirklich da ist.
- **Der Downloads-Ordner ist geteilt.** Nie einfach die neueste Datei greifen — Differenz
  vor und nach dem Download bilden und das Motiv gegenprüfen.

## Bildstil

Gesättigt und werblich. **Kein** Beige-Einheitsbrei, kein KI-Hochglanz. Echte
Kamera- und Lichtangaben statt "8k ultra detailed", bewusste Unregelmäßigkeiten
(Staub, Kratzer, Asymmetrie) statt perfekter Plastikoberflächen.

## Review-Werkzeug — erst bauen, wenn alle Bilder im Ordner liegen

Dann eine **`index.html` direkt in den Bildordner**, per **Doppelklick öffenbar**
(`file://`, kein Server) — der Ordner wird als ZIP an einen Reviewer weitergegeben, der
nichts einrichten kann. **Oberfläche komplett auf Englisch.**

- Bilder einzeln und groß, mit Zähler ("12 / 50").
- **Rechts wischen oder Pfeil rechts = approve**, **links = reject** mit Pflicht-Textfeld
  für die Kritik.
- Wischen per Maus und Touch, dazu zwei große Schaltflächen.
- Fortschritt in `localStorage`.
- Am Ende **"Download results"** → `review.json`:

```json
[
  { "file": "01-beispiel.webp", "verdict": "approved" },
  { "file": "02-beispiel.webp", "verdict": "rejected", "comment": "Text unleserlich" }
]
```

Bilder über **relative Pfade** einbinden. Kein `fetch` auf lokale Dateien — das blockiert
der Browser unter `file://`. Die Dateiliste fest in die HTML schreiben.

Nach der Rückgabe der `review.json`:

- **approved** → Bild nach `approved/`, Vorlage in Strapi **veröffentlichen**
- **rejected** → Bild nach `rejected/`, Kritik in `feedback.json`, Vorlage bleibt Entwurf

## Verifikation nach jeder Vorlage

Bild verknüpft, Kategorie gesetzt, Entwurf (nicht veröffentlicht), Prompt endet auf
`{{image_description}}`, keine Waisen in beide Richtungen, keine Fragezeichen-Artefakte.

## Sonstiges

- Slugs müssen projektweit einmalig sein, vorher prüfen.
- Es laufen mehrere Agenten parallel an anderen Kategorien. Halte dich an den
  Temp-Dateinamen deiner Kategorie.
- **Vorlagen niemals im Block löschen.** `templates` ist für alle Kategorien gemeinsam;
  ein Massenlöschen ohne `WHERE` auf die eigene Kategorie löscht die Arbeit aller
  anderen mit. Das ist zweimal passiert, beide Male ging der komplette Bestand verloren.
- **Kategorie-IDs nicht fest verdrahten** — `documentId` ändert sich beim Neusäen.
- Arbeite durch, ohne pro Schritt zu fragen. Bericht am Ende als Tabelle.
