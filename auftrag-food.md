# Auftrag: Food-Vorlagen

Projekt: `C:\Users\User\OneDrive\Desktop\dalor-gallery` (Next.js + Strapi, läuft lokal
auf 127.0.0.1:1337). Antworte auf Deutsch.

**FANG NOCH NICHT AN.** Lies das hier, sieh dir das Admin Panel und ein paar bestehende
Vorlagen an, stell Rückfragen. Erst auf mein Startsignal loslegen.

## Auftrag

Neue Vorlagen für die Kategorie **"Food & drinks"** — exakt so geschrieben, mit
Kaufmanns-Und und kleinem "d". Es gibt daneben noch eine Kategorie namens `Food`, die ist
**nicht** gemeint und bleibt leer.

Die Kategorie umfasst **Essen und Getränke**. Beides muss vorkommen — plane rund
**35 Vorlagen für Essen und 15 für Getränke**.

Vorlagen kommen aus zwei Pinterest-Pinnwänden:

- **"Food Ads"** — https://at.pinterest.com/sukhjitmultani/food-ads/ (**66 Pins**, Essen
  und Getränke gemischt)
- **"food"** — https://at.pinterest.com/sukhjitmultani/food/ (8 Pins, Getränke:
  Wasserflaschen, Energy-Drink-Dosen)

Zusammen 74 Pins. **Such dir daraus die 50 besten aus**, die die Bandbreite am besten
abdecken — du hast also bewusst Auswahl und musst nicht jeden Pin nehmen. Sortier aus,
was sich zu sehr ähnelt: Pizza und Sushi sind auf der Pinnwand überrepräsentiert.

## Der Anspruch: verkaufsfähig

Diese Vorlagen sollen Leute **kaufen** wollen. Das heißt konkret:

- Essen muss appetitlich aussehen, nicht nur technisch korrekt. Dampf, Fäden von
  geschmolzenem Käse, Krümel, glänzende Glasuren, frische Kräuter, Wassertropfen auf
  Salat.
- Ein klarer Anlass pro Vorlage: Menü-Angebot, Neueröffnung, Lieferdienst, Mittagsdeal,
  Happy Hour, saisonales Gericht.
- Typografie, die wirklich verkauft — Preis, Rabatt, Call-to-Action.

Deck ein breites Feld ab, damit die 50 nicht alle gleich aussehen:

- **Essen (ca. 35):** Burger, Pizza, Pasta, Sushi, Ramen, Grill, Frühstück, Salate und
  Bowls, Backwaren, Desserts, Eis, Streetfood, Meal-Prep
- **Getränke (ca. 15):** Kaffee und Latte, Eiskaffee, Tee und Eistee, Smoothies und
  Säfte, Milchshakes, Limonade, Cocktails und Mocktails, Wasser, Energy Drinks

Verschiedene Küchen, verschiedene Tageszeiten, verschiedene Preisklassen — vom Imbiss bis
zum Fine Dining.

## Ablauf pro Vorlage

1. Pin ansehen. Bildkonzept ableiten: Gericht, Anrichtung, Untergrund, Blickwinkel
   (Aufsicht, 45 Grad, Nahaufnahme), Lichtstimmung, Textaufbau. **Nicht 1:1 nachbauen** —
   in die Richtung, mit eigener erfundener Marke.
2. Bild mit Meta AI erzeugen (www.meta.ai, ist eingeloggt).
3. Herunterladen, nach `C:\Users\User\Downloads\Food` verschieben (Ordner anlegen, falls
   nicht vorhanden).
4. Nach Strapi hochladen, Vorlage **als Entwurf** anlegen — **nicht veröffentlichen**.

## Nichts veröffentlichen, bis das Bild freigegeben ist

Veröffentlicht wird erst, wenn ich das Bild im Review freigegeben habe (siehe Abschnitt
„Review-Werkzeug" unten).

- Neue Vorlagen: als Entwurf anlegen, den Publish-Aufruf weglassen.
- Falls du doch schon etwas veröffentlicht hast: auf Entwurf zurücksetzen über
  `POST /content-manager/collection-types/api::template.template/<documentId>/actions/unpublish`
  und merken, welche das waren — nach meiner Freigabe werden genau die wieder
  veröffentlicht.

Die Kategorie "Food & drinks" ist derzeit **leer** (0 veröffentlichte Vorlagen). Es liegen
dort noch ein paar ältere Getränke-Entwürfe — die lässt du in Ruhe, gelöscht wird nichts.

## Die Prompts — wichtigster Punkt

Die 50 Auto-Vorlagen im Projekt hatten **alle denselben Prompt**, Zeichen für Zeichen
identisch, und nur 3 Variablen. Deshalb waren sie wertlos: wer zwei kauft, bekommt
zweimal dasselbe. Das darf sich hier nicht wiederholen.

Jede Vorlage bekommt einen **eigenen** Prompt, abgeleitet aus ihrem Pin. Prüf das am Ende
ausdrücklich nach.

**6 bis 8 Variablen** pro Vorlage. Sinnvoll heißt: ändert sichtbar etwas im Bild. Bei
Food typisch: Gericht, Beilage oder Topping, Geschirr, Untergrund, Hintergrundfarbe,
Lichtstimmung, Markenname, Headline, Preis, Call-to-Action.

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

Erfundene Marken und Logos. Keine echten Ketten, keine realen Logos oder Produktnamen —
auch dann nicht, wenn der Pin eine echte Marke zeigt. Von solchen Pins nur Bildaufbau,
Licht und Typografie übernehmen. Der Markenname ist immer die Variable `brand_name`.

## Upload — dieser Weg funktioniert, andere nicht

Strapis Medien-Dialog erzeugt seinen `input[type=file]` erst beim Klick, das
`file_upload`-Werkzeug schlägt deshalb fehl. Stattdessen:

1. Bild nach `backend/public/__tmp_food.webp` kopieren (Strapi serviert `public/` unter
   `/`, damit ist es gleichursprünglich erreichbar).
2. Im Admin-Tab per `javascript_tool` das JWT holen. **Beide Quellen prüfen:** früher lag
   es im Cookie `jwtToken`, aktuell in `localStorage.jwtToken` als JSON-String
   (`JSON.parse(...)` nötig). Dann `fetch('/__tmp_food.webp')` → Blob → FormData →
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

Sobald `C:\Users\User\Downloads\Food` **50 Bilder** enthält: keine weiteren Bilder mehr
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
  { "file": "01-smash-burger-poster.webp", "verdict": "approved" },
  { "file": "02-ramen-bowl-poster.webp", "verdict": "rejected",
    "comment": "Broth looks artificial, price is unreadable" }
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
  Temp-Dateinamen `__tmp_food.webp`, sonst überschreibt ihr euch gegenseitig.
- Arbeite durch, ohne pro Schritt zu fragen. Bericht am Ende als Tabelle.
