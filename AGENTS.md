<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Strapi: nicht selbst starten

Es arbeiten mehrere Agenten gleichzeitig an derselben Strapi-Instanz und derselben
SQLite-Datei (`backend/.tmp/data.db`). **Genau ein Agent betreibt den Server.**

Wenn du Strapi brauchst:

1. Prüf mit einem Aufruf, ob es läuft:
   `curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:1337/admin`
2. `200` → weiterarbeiten.
3. Alles andere → **nicht selbst starten**, sondern dem Nutzer melden, dass Strapi liegt.

Paralleles `strapi develop` führt zu konkurrierenden Prozessen auf derselben Datei,
zu `EPERM`-Fehlern beim Aufräumen von `dist/` und zu Startabbrüchen.

## Vorlagen niemals im Block löschen

`templates` ist für alle Kategorien gemeinsam. Ein Massenlöschen ohne `WHERE` auf die
eigene Kategorie löscht die Arbeit aller anderen mit. Zweimal passiert, beide Male ging
der komplette Bestand verloren.

Vor jedem Löschen: `backend/.tmp/data.db` wegkopieren, danach die Vorlagenzahl prüfen.

## Kategorie-IDs nicht fest verdrahten

`documentId` einer Kategorie ändert sich, wenn die Kategorien neu gesät werden. Immer
frisch nachschlagen, sonst kommt `ValidationError: Document with id ... not found`.
