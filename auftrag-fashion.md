# Auftrag: Fashion-Vorlagen

Projekt: `C:\Users\User\OneDrive\Desktop\dalor-gallery` (Next.js + Strapi, läuft lokal
auf 127.0.0.1:1337). Antworte auf Deutsch.

**FANG NOCH NICHT AN.** Lies das hier, sieh dir das Admin Panel und ein paar bestehende
Vorlagen an, stell Rückfragen. Erst auf mein Startsignal loslegen.

## Auftrag

Neue Vorlagen für die Kategorie **"Fashion"** — exakt so geschrieben.

Vorlagen kommen aus meiner Pinterest-Pinnwand **"Fashion"**:
https://at.pinterest.com/sukhjitmultani/fashion/

Dort liegen **50 Pins**. Jeder Pin ist die Vorlage für genau eine Galerie-Vorlage. Prüf
beim Start kurz, ob es wirklich 50 sind. Wenn weniger, sag mir das und warte.

## Abgrenzung — wichtig, es gibt drei Mode-Kategorien

| Kategorie | Inhalt | zuständig |
|---|---|---|
| **Fashion** | Mode **am Model**: Lookbook, Kampagne, Editorial, ganzes Outfit | **diese Datei** |
| **Clothing & apparel** | das **einzelne Kleidungsstück** als Produkt | andere Datei |
| **Accessories** | Taschen, Schmuck, Uhren, Sonnenbrillen, Gürtel | andere Datei |

Halte dich strikt an Spalte 1. Sobald ein Motiv nur ein freigestelltes Kleidungsstück
zeigt, gehört es nicht hierher. Ebenso wenig reine Sale-Posts im Instagram-Format — die
sind Sache der Kategorie *Social Media*, die bereits befüllt ist.

## Was diese Kategorie ausmacht

Die Pins sind **Modekampagnen und Magazin-Layouts**: ein Model in ganzer Gestalt oder als
Porträt, dazu sehr große, oft überlappende Typografie — Markenname, Kollektionstitel,
Saison, manchmal ein Claim. Häufige Muster auf der Pinnwand:

- Riesiger Markenschriftzug hinter oder über dem Model (ZARA, GAP, MONO, ORIGIN, AURA)
- Magazin-Cover-Optik mit Titelzeile, Ausgabennummer, Barcode (Vogue, ALLURE, Deazur)
- Textblock links oder unten mit Kollektionsdetails und "Shop now"
- Schwarzweiß-Editorial mit einem einzigen Farbakzent
- Bewegungsunschärfe, Doppelbelichtung, zerschnittene und versetzte Bildstreifen

Deck die Bandbreite ab: Damen- und Herrenmode, Streetwear, Tailoring, Denim, Abendmode,
Sportliches. Verschiedene Jahreszeiten und Preisklassen.

## Ablauf pro Vorlage

1. Pin ansehen. Bildkonzept ableiten: Model und Pose, Outfit, Hintergrund, Blickwinkel,
   Lichtstimmung, Typografie-Aufbau. **Nicht 1:1 nachbauen** — in die Richtung, mit eigener
   erfundener Marke.
2. Bild mit Meta AI erzeugen (www.meta.ai, ist eingeloggt).
3. Herunterladen, nach `C:\Users\User\Downloads\Fashion` verschieben (Ordner anlegen, den
   gibt es noch nicht).
4. Nach Strapi hochladen, Vorlage **als Entwurf** anlegen — **nicht veröffentlichen**.

## Nichts veröffentlichen, bis das Bild freigegeben ist

Veröffentlicht wird erst, wenn ich das Bild im Review freigegeben habe (siehe Abschnitt
„Review-Werkzeug" unten).

- Neue Vorlagen: als Entwurf anlegen, den Publish-Aufruf weglassen.
- Falls du doch schon etwas veröffentlicht hast: auf Entwurf zurücksetzen über
  `POST /content-manager/collection-types/api::template.template/<documentId>/actions/unpublish`
  und merken, welche das waren — nach meiner Freigabe werden genau die wieder
  veröffentlicht.

Die Kategorie "Fashion" ist derzeit **komplett leer** (0 Vorlagen), es ist also nichts zu
löschen oder aufzuräumen.

## Die Prompts — wichtigster Punkt

Die 50 Auto-Vorlagen im Projekt hatten **alle denselben Prompt**, Zeichen für Zeichen
identisch, und nur 3 Variablen. Deshalb waren sie wertlos: wer zwei kauft, bekommt
zweimal dasselbe. Das darf sich hier nicht wiederholen.

Jede Vorlage bekommt einen **eigenen** Prompt, abgeleitet aus ihrem Pin. Prüf das am Ende
ausdrücklich nach.

**6 bis 8 Variablen** pro Vorlage. Sinnvoll heißt: ändert sichtbar etwas im Bild. Bei
Fashion typisch: Kleidungsstück oder Outfit, Farbe, Stoff, Hintergrund, Lichtstimmung,
Markenname, Kollektionstitel, Saison, Claim.

**Das Model selbst gehört nicht in eine Variable.** Beschreib es im Prompt neutral
(„a model", „a woman in her twenties") und lass Aussehen, Hautfarbe oder Herkunft nicht
über ein Eingabefeld steuern.

## Prompt-Konventionen — Pflicht

Gemessen an den 113 bestehenden Vorlagen im Projekt:

- **`{{image_description}}` muss als letzte Zeile stehen**, nach einer Leerzeile, ohne
  Beschriftung davor. 113/113 Prompts haben den Slot, 101 davon genau so. Steht er mitten
  im Satz, hinterlässt ein leeres Feld eine kaputte Stelle im fertigen Prompt. Und das
  Feld ist nicht pflichtig, bleibt also standardmäßig leer. Der Bootstrap-Service legt
  das *Eingabefeld* automatisch an, den *Slot im Prompt* aber **nicht**. Den musst du
  selbst setzen.
- **Seitenverhältnis in Prosa nennen** ("vertical 4:5"), 111/113 tun das. Fehlt es,
  liefern die Modelle 1:1 und das Textlayout bricht. Die meisten Fashion-Pins sind
  hochformatig — 4:5 oder 3:4 passt.
- **Variablennamen klein und snake_case.** 0 von 38 bestehenden sind GROSS.
- **Keine Midjourney-Syntax:** kein `--no`, kein `--ar` (0 bzw. 1 von 113).
- **Nur gerade Anführungszeichen** (`"`), keine typografischen. Bei den alten
  Auto-Vorlagen sind die zu Fragezeichen zerfallen: dort steht `?{{headline}}?` im Prompt.
  Diesen Fehler nicht wiederholen.

## Eingabefelder

- **Konkrete Vorbelegungen**, keine "For example:"-Hinweise (1141 von 1541 Feldern machen
  das so). Die Defaults müssen exakt das Bild reproduzieren, das auf der Kachel liegt —
  die Vorlage muss ohne jede Eingabe funktionieren.
- `inputType: "text"` auch für Farben (1096× text, nur 6× color).
- Jeder Slot braucht ein Feld und jedes Feld einen Slot.

## Marken

Erfundene Marken und Logos. Keine echten Modehäuser, keine realen Logos oder
Kollektionsnamen — auch dann nicht, wenn der Pin eine echte Marke zeigt. Auf der Pinnwand
sind unter anderem Zara, GAP, Michael Kors, Balenciaga, A.P.C. und Vogue. Von solchen Pins
nur Bildaufbau, Licht und Typografie übernehmen. Der Markenname ist immer die Variable
`brand_name`.

**Auch keine echten Personen.** Auf einigen Pins sind erkennbare Prominente abgebildet.
Übernimm davon nur Pose, Licht und Layout, niemals das Gesicht oder den Namen.

## Upload — dieser Weg funktioniert, andere nicht

Strapis Medien-Dialog erzeugt seinen `input[type=file]` erst beim Klick, das
`file_upload`-Werkzeug schlägt deshalb fehl. Stattdessen:

1. Bild nach `backend/public/__tmp_fashion.webp` kopieren (Strapi serviert `public/` unter
   `/`, damit ist es gleichursprünglich erreichbar).
2. Im Admin-Tab per `javascript_tool` das JWT holen. **Beide Quellen prüfen:** früher lag
   es im Cookie `jwtToken`, aktuell in `localStorage.jwtToken` als JSON-String
   (`JSON.parse(...)` nötig). Dann `fetch('/__tmp_fashion.webp')` → Blob → FormData →
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
  Chat. Vier bis fünf Tabs gleichzeitig — das ist der einzige echte Zeitgewinn, ein Bild
  dauert rund 40 Sekunden.
- Download über den Knopf **direkt am Bild im Chat**, nicht über die Vollbildansicht. Die
  ist instabil und reißt die Seite in einen kaputten Zoomzustand.
- Chrome blockiert nach mehreren Downloads stillschweigend und meldet trotzdem
  "Download started". Nach **jedem** Download mit `ls -lat` prüfen, ob die Datei wirklich
  da ist. Wenn nicht: mir Bescheid geben, ich muss das in der Adressleiste freigeben.

## Review-Werkzeug — erst bauen, wenn 50 Bilder im Ordner liegen

Sobald `C:\Users\User\Downloads\Fashion` **50 Bilder** enthält: keine weiteren Bilder mehr
erzeugen, sondern dieses Werkzeug bauen. Bei weniger als 50 erst fertig generieren.

Bau eine **`index.html` direkt in den Bildordner**, neben die Bilder. Sie muss sich per
**Doppelklick öffnen lassen** (`file://`, kein Server, keine Installation) — der Ordner
wird als ZIP an einen Reviewer weitergegeben, der nichts einrichten kann.

**Die gesamte Oberfläche auf Englisch.**

Funktionsweise:

- Zeigt die Bilder einzeln und groß, eines nach dem anderen, mit Zähler ("12 / 50").
- **Nach rechts wischen oder Pfeiltaste rechts = approve.** Weiter zum nächsten Bild.
- **Nach links wischen oder Pfeiltaste links = reject.** Es öffnet sich ein Textfeld für
  die Kritik — ohne Eingabe kein Weiterkommen. Danach das nächste Bild.
- Wischen per Maus ziehbar (pointer events), zusätzlich zwei große Schaltflächen für alle,
  die lieber klicken. Auf Touch muss es auch gehen.
- Fortschritt in `localStorage` sichern, damit die Datei zwischendurch geschlossen werden
  kann, ohne dass alles verloren ist.
- Am Ende eine Schaltfläche **"Download results"**, die eine `review.json` speichert:

```json
[
  { "file": "01-mono-campaign-poster.webp", "verdict": "approved" },
  { "file": "02-denim-editorial-poster.webp", "verdict": "rejected",
    "comment": "Typography overlaps the face, brand name unreadable" }
]
```

Technisch: Bilder über **relative Pfade** einbinden (`<img src="01-....webp">`). Kein
`fetch` und kein `XMLHttpRequest` auf lokale Dateien — das blockiert der Browser unter
`file://`. Die Dateiliste schreibst du **fest in die HTML**; ohne Server gibt es keinen
anderen Weg, den Ordnerinhalt zu kennen.

Wenn die Datei fertig ist: sag mir Bescheid und beschreib in zwei Sätzen, wie ich sie
bediene. Ich swipe durch und gebe dir die `review.json` zurück. **Danach** machst du:

- **approved** → Bild nach `approved/` verschieben, Vorlage in Strapi **veröffentlichen**
- **rejected** → Bild nach `rejected/` verschieben, Kritik in eine `feedback.json` neben
  den Bildern schreiben, Vorlage bleibt **Entwurf**

## Verifikation nach jeder Vorlage

Gegen `backend/.tmp/data.db` (readonly) prüfen: Bild verknüpft, Kategorie gesetzt,
`published_at` **ist null** (Entwurf, siehe oben), Prompt endet auf `{{image_description}}`,
keine Waisen in **beide** Richtungen (kein Slot ohne Feld, kein Feld ohne Slot), keine
Fragezeichen-Artefakte im Prompt.

Am Schluss zusätzlich: **wie viele unterschiedliche Prompts sind es?** Wenn deutlich
weniger als die Anzahl der Vorlagen, ist etwas falsch gelaufen.

## Sonstiges

- **Strapi niemals selbst starten.** Es arbeiten mehrere Agenten an derselben Instanz und
  derselben SQLite-Datei. Prüf mit
  `curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:1337/admin`, ob es
  läuft: bei `200` weiterarbeiten, sonst **mir melden**. Ein paralleles `strapi develop`
  kämpft um Port 1337, räumt `dist/` unter dem laufenden Prozess weg und reißt ihn mit.
- Ich muss dich in Strapi einloggen, Passwörter darfst du nicht eintippen. Sag Bescheid,
  wenn der Login-Screen kommt.
- Slugs müssen projektweit einmalig sein, vorher in der DB prüfen.
- Es laufen mehrere Claude-Instanzen parallel an anderen Kategorien. Halte dich an den
  Temp-Dateinamen `__tmp_fashion.webp`, sonst überschreibt ihr euch gegenseitig.
- Arbeite durch, ohne pro Schritt zu fragen. Bericht am Ende als Tabelle.
