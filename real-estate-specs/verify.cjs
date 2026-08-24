/**
 * Prüft den Real-Estate-Bestand gegen backend/.tmp/data.db (readonly).
 * Aufruf: node real-estate-specs/verify.cjs
 */
const Database = require('C:/Users/User/OneDrive/Desktop/dalor-gallery/backend/node_modules/better-sqlite3');
const path = 'C:/Users/User/OneDrive/Desktop/dalor-gallery/backend/.tmp/data.db';
const db = new Database(path, { readonly: true });

const catId = db.prepare("select id from categories where slug='real-estate' and published_at is null").get();
const rows = db.prepare(`
  select t.id, t.document_id, t.slug, t.title, t.prompt, t.published_at, t.auto_translate,
         t.title_de, t.title_ru, t.title_hi, t.title_pa, t.search_keywords
  from templates t
  join templates_category_lnk l on l.template_id = t.id
  where l.category_id = ?
  order by t.slug
`).all(catId.id);

const probleme = [];
let ohneUebersetzung = 0;

for (const t of rows) {
  const bilder = db.prepare(`
    select f.id, f.name, f.width, f.height from files f
    join files_related_mph r on r.file_id = f.id
    where r.related_id = ? and r.related_type like '%template%' and r.field='image'
  `).all(t.id);

  if (bilder.length !== 1) probleme.push(`${t.slug}: ${bilder.length} Bilder verknüpft`);
  if (t.published_at !== null) probleme.push(`${t.slug}: ist VERÖFFENTLICHT, sollte Entwurf sein`);
  if (!t.prompt.endsWith('{{image_description}}')) probleme.push(`${t.slug}: Prompt endet nicht auf den Slot`);
  if (/\?\{\{|\}\}\?/.test(t.prompt)) probleme.push(`${t.slug}: Fragezeichen-Artefakt im Prompt`);
  if (!/vertical 4:5/.test(t.prompt)) probleme.push(`${t.slug}: kein Seitenverhältnis im Prompt`);
  if (/--ar|--no/.test(t.prompt)) probleme.push(`${t.slug}: Midjourney-Syntax im Prompt`);

  const felder = db.prepare(`
    select c.key, c.placeholder, c.input_type from templates_cmps tc
    join components_template_input_fields c on c.id = tc.cmp_id
    where tc.entity_id = ? order by tc.\`order\`
  `).all(t.id);

  const slots = [...new Set([...t.prompt.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]))];
  const keys = felder.map(f => f.key);
  const fehlend = slots.filter(s => !keys.includes(s));
  const waisen = keys.filter(k => !slots.includes(k));
  if (fehlend.length) probleme.push(`${t.slug}: Slot ohne Feld: ${fehlend.join(', ')}`);
  if (waisen.length) probleme.push(`${t.slug}: Feld ohne Slot: ${waisen.join(', ')}`);
  if (keys[0] !== 'image_description') probleme.push(`${t.slug}: image_description ist nicht das erste Feld`);
  for (const f of felder) {
    if (!f.placeholder) probleme.push(`${t.slug}/${f.key}: keine Vorbelegung`);
    else if (/^for example:/i.test(f.placeholder)) probleme.push(`${t.slug}/${f.key}: Beispiel- statt Vorbelegungstext`);
  }
  const anzahl = keys.length - 1;
  if (anzahl < 6 || anzahl > 8) probleme.push(`${t.slug}: ${anzahl} Variablen (erwartet 6-8)`);

  if (!t.title_de || !t.title_ru || !t.title_hi || !t.title_pa) ohneUebersetzung++;
}

// Waisen in beide Richtungen
const bilderOhneVorlage = db.prepare(`
  select f.name from files f
  where f.name like '%real-estate-%'
    and not exists (select 1 from files_related_mph r where r.file_id=f.id and r.related_type like '%template%')
`).all();

const prompts = new Set(rows.map(r => r.prompt));

console.log('Vorlagen in Real Estate: ' + rows.length);
console.log('davon Entwürfe:          ' + rows.filter(r => r.published_at === null).length);
console.log('unterschiedliche Prompts:' + prompts.size);
console.log('ohne volle Übersetzung:  ' + ohneUebersetzung);
console.log('Bilder ohne Vorlage:     ' + bilderOhneVorlage.length + (bilderOhneVorlage.length ? ' -> ' + bilderOhneVorlage.map(b => b.name).join(', ') : ''));
console.log('');
if (probleme.length) {
  console.log('PROBLEME (' + probleme.length + '):');
  for (const p of probleme) console.log('  - ' + p);
} else {
  console.log('Keine Probleme gefunden.');
}
