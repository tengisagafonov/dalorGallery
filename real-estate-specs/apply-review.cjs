/**
 * Wertet die Freigabe aus: erwartet review.json im Bildordner.
 *
 *   approved -> Bild nach approved/, Vorlage wird veröffentlicht
 *   rejected -> Bild nach rejected/, Kritik landet in feedback.json, Vorlage bleibt Entwurf
 *
 * Aufruf: node real-estate-specs/apply-review.cjs
 * Gibt die documentIds der freizugebenden Vorlagen aus; veröffentlicht wird
 * anschließend über den Admin-Tab (publish-Route), weil dort das JWT liegt.
 */
const fs = require('fs');
const pathmod = require('path');
const Database = require('C:/Users/User/OneDrive/Desktop/dalor-gallery/backend/node_modules/better-sqlite3');

const ORDNER = 'C:/Users/User/Downloads/Real-Estate';
const DB = 'C:/Users/User/OneDrive/Desktop/dalor-gallery/backend/.tmp/data.db';

const reviewPfad = pathmod.join(ORDNER, 'review.json');
if (!fs.existsSync(reviewPfad)) {
  console.error('review.json fehlt in ' + ORDNER);
  process.exit(1);
}
const review = JSON.parse(fs.readFileSync(reviewPfad, 'utf8'));

for (const unter of ['approved', 'rejected']) {
  const p = pathmod.join(ORDNER, unter);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
}

const db = new Database(DB, { readonly: true });
const catId = db.prepare("select id from categories where slug='real-estate' and published_at is null").get().id;
const vorlagen = db.prepare(`
  select t.slug, t.document_id from templates t
  join templates_category_lnk l on l.template_id = t.id
  where l.category_id = ?
`).all(catId);
const nachSlug = Object.fromEntries(vorlagen.map(v => [v.slug, v.document_id]));

const feedback = [];
const freizugeben = [];
let verschoben = 0;

for (const eintrag of review) {
  const datei = eintrag.file;
  const slug = datei.replace(/^\d\d-/, '').replace(/\.webp$/, '');
  const ziel = eintrag.verdict === 'approved' ? 'approved' : 'rejected';
  const von = pathmod.join(ORDNER, datei);
  if (fs.existsSync(von)) {
    fs.renameSync(von, pathmod.join(ORDNER, ziel, datei));
    verschoben++;
  }
  if (eintrag.verdict === 'approved') {
    if (nachSlug[slug]) freizugeben.push({ slug, documentId: nachSlug[slug] });
    else console.error('Keine Vorlage zu ' + slug);
  } else {
    feedback.push({ file: datei, slug, comment: eintrag.comment || '' });
  }
}

fs.writeFileSync(pathmod.join(ORDNER, 'feedback.json'), JSON.stringify(feedback, null, 2));
fs.writeFileSync(
  'C:/Users/User/OneDrive/Desktop/dalor-gallery/real-estate-specs/publish-ids.json',
  JSON.stringify(freizugeben, null, 2),
);

console.log('Bilder verschoben: ' + verschoben);
console.log('freizugeben:       ' + freizugeben.length);
console.log('abgelehnt:         ' + feedback.length + ' (feedback.json geschrieben)');
