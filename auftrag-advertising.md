# Auftrag: Advertising-Vorlagen

Projekt: `C:\Users\User\OneDrive\Desktop\dalor-gallery` (Next.js + Strapi, läuft lokal
auf 127.0.0.1:1337). Antworte auf Deutsch.

**FANG NOCH NICHT AN.** Lies das hier, sieh dir das Admin Panel und ein paar bestehende
Vorlagen an, stell Rückfragen. Erst auf mein Startsignal loslegen.

## Auftrag

Neue Vorlagen für die Kategorie **"Advertising"** — exakt so geschrieben.

Vorlagen kommen aus meiner Pinterest-Pinnwand **"Advertising"**:
https://at.pinterest.com/sukhjitmultani/advertising/

Dort liegen **50 Pins**. Jeder Pin ist die Vorlage für genau eine Galerie-Vorlage.

Prüf beim Start trotzdem kurz, ob es wirklich 50 sind. Wenn weniger, sag mir das und
warte, statt mit weniger anzufangen.

## Was diese Kategorie ausmacht

Advertising ist **nicht** die Produktfoto-Kategorie — das sind E-Commerce und Beauty
schon. Hier geht es um **Konzeptwerbung mit einer visuellen Idee**: ein Bild, das eine
Behauptung in ein Sinnbild übersetzt.

Beispiele von der Pinnwand:

- Kaffeetasse als Globus („The world revolves around coffee")
- Kaffee als Weckerzifferblatt („It all starts with a coffee")
- Kaffeetasse als Pokal („Behind every success")
- Tabasco-Flasche als Feuerlöscher („Bear the heat")
- Ketchupflasche, die aus Tomatenranken wächst („Grown not made")
- Kaffeebecher als Kissenstapel („So you can sleep longer")
- Keks als geöffnetes Vorhängeschloss („Unlock happiness")
- Teebeutel-Ampel („Your signal to get ready")
- Bubble Tea als Infusionsbeutel („Me after a stressful day")

Das Muster: **ein Produkt nimmt die Form von etwas anderem an**, und dieser Formwechsel
ist die Werbebotschaft. Genau das muss in den Prompts stecken — nicht „Produkt auf
Podest mit schöner Beleuchtung".

## Ablauf pro Vorlage

1. Pin ansehen. **Die Idee dahinter benennen**, bevor du den Prompt schreibst: Welches
   Produkt wird zu welchem Gegenstand, und welche Aussage entsteht daraus?
2. Bildkonzept ableiten. **Nicht 1:1 nachbauen** — dieselbe Art von Idee, mit eigenem
   Motiv und eigener erfundener Marke.
3. Bild mit Meta AI erzeugen (www.meta.ai, ist eingeloggt).
4. Herunterladen, nach `C:\Users\User\Downloads\Advertising` verschieben (Ordner
   existiert bereits).
5. Nach Strapi hochladen, Vorlage **als Entwurf** anlegen — **nicht veröffentlichen**.

## Nichts veröffentlichen, bis das Bild freigegeben ist

Veröffentlicht wird erst, wenn ich das Bild im Review freigegeben habe (siehe Abschnitt
„Review-Werkzeug" unten).

- Neue Vorlagen: als Entwurf anlegen, den Publish-Aufruf weglassen.
- Falls du doch schon etwas veröffentlicht hast: auf Entwurf zurücksetzen über
  `POST /content-manager/collection-types/api::template.template/<documentId>/actions/unpublish`
  und merken, welche das waren — nach meiner Freigabe werden genau die wieder
  veröffentlicht.

Die Kategorie "Advertising" ist derzeit **komplett leer** (0 Vorlagen), es ist also nichts
zu löschen oder aufzuräumen.

## Die Prompts — wichtigster Punkt

Die 50 Auto-Vorlagen im Projekt hatten **alle denselben Prompt**, Zeichen für Zeichen
identisch, und nur 3 Variablen. Deshalb waren sie wertlos: wer zwei kauft, bekommt
zweimal dasselbe. Das darf sich hier nicht wiederholen.

Jede Vorlage bekommt einen **eigenen** Prompt, abgeleitet aus ihrem Pin. Prüf das am Ende
ausdrücklich nach.

**6 bis 8 Variablen** pro Vorlage. Sinnvoll heißt: ändert sichtbar etwas im Bild. Bei
Konzeptwerbung typisch: Produkttyp, der Gegenstand, dessen Form es annimmt, Hintergrundfarbe,
Lichtstimmung, Markenname, Headline, Claim.

**Die Idee selbst gehört nicht in eine Variable.** Wenn der Nutzer „Kaffeetasse" durch
„Waschmittel" ersetzen kann, bricht das Sinnbild. Variabel sind Marke, Text, Farben und
Details — die Bildidee bleibt fest. Das ist der Unterschied zu den Produktkategorien.

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
  Diesen Fehler nicht wiederholen.

## Eingabefelder

- **Konkrete Vorbelegungen**, keine "For example:"-Hinweise (1141 von 1541 Feldern machen
  das so). Die Defaults müssen exakt das Bild reproduzieren, das auf der Kachel liegt —
  die Vorlage muss ohne jede Eingabe funktionieren.
- `inputType: "text"` auch für Farben (1096× text, nur 6× color).
- Jeder Slot braucht ein Feld und jedes Feld einen Slot.

## Marken

Erfundene Marken und Logos. Keine echten Hersteller, keine realen Logos oder
Produktnamen — auch dann nicht, wenn der Pin eine echte Marke zeigt. Die Pinnwand ist
voll davon: Nescafé, Tabasco, Heinz, McCafé, Oreo, Lipton, Coca-Cola, Red Bull, IKEA,
McDonald's. Von diesen Pins nur **die Idee und den Bildaufbau** übernehmen, nie Logo,
Schriftzug oder Farbmarke. Der Markenname ist immer die Variable `brand_name`.

## Upload — dieser Weg funktioniert, andere nicht

Strapis Medien-Dialog erzeugt seinen `input[type=file]` erst beim Klick, das
`file_upload`-Werkzeug schlägt deshalb fehl. Stattdessen:

1. Bild nach `backend/public/__tmp_ad.webp` kopieren (Strapi serviert `public/` unter `/`,
   damit ist es gleichursprünglich erreichbar).
2. Im Admin-Tab per `javascript_tool` das JWT holen. **Beide Quellen prüfen:** früher lag
   es im Cookie `jwtToken`, aktuell in `localStorage.jwtToken` als JSON-String
   (`JSON.parse(...)` nötig). Dann `fetch('/__tmp_ad.webp')` → Blob → FormData →
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

Sobald `C:\Users\User\Downloads\Advertising` **50 Bilder** enthält: keine weiteren Bilder
mehr erzeugen, sondern dieses Werkzeug bauen. Bei weniger als 50 erst fertig generieren.

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
  { "file": "01-coffee-globe-poster.webp", "verdict": "approved" },
  { "file": "02-sauce-extinguisher-poster.webp", "verdict": "rejected",
    "comment": "The idea does not read, looks like a normal product shot" }
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
  Temp-Dateinamen `__tmp_ad.webp`, sonst überschreibt ihr euch gegenseitig.
- Arbeite durch, ohne pro Schritt zu fragen. Bericht am Ende als Tabelle.
