const Database=require('better-sqlite3');
const db=new Database('.tmp/data.db',{readonly:true});
const rows=db.prepare(`select t.slug, f.name bild from templates t
 join templates_category_lnk l on l.template_id=t.id
 left join files_related_mph r on r.related_id=t.id and r.related_type like '%template%'
 left join files f on f.id=r.file_id
 where l.category_id=(select id from categories where slug='real-estate' and published_at is null)`).all();
const r2=require('C:/Users/User/OneDrive/Desktop/dalor-gallery/real-estate-specs/round2-nummern.json');
let neu=0;
for(const row of rows){ const n=(row.bild||'').slice(0,2); if(r2.includes(n)) neu++; }
console.log('Vorlagen mit Bild:', rows.filter(r=>r.bild).length, '| davon aus der 21er-Liste:', neu);
