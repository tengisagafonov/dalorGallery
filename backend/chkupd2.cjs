const Database=require('better-sqlite3');
const fs=require('fs');
const db=new Database('.tmp/data.db',{readonly:true});
const r2=require('C:/Users/User/OneDrive/Desktop/dalor-gallery/real-estate-specs/round2-nummern.json');
const dir='C:/Users/User/Downloads/Real-Estate/round2/';
let aktuell=0, alt=0;
const rows=db.prepare(`select t.slug, f.name, f.size from templates t
 join templates_category_lnk l on l.template_id=t.id
 join files_related_mph r on r.related_id=t.id and r.related_type like '%template%'
 join files f on f.id=r.file_id
 where l.category_id=(select id from categories where slug='real-estate' and published_at is null)`).all();
for(const row of rows){
  const n=row.name.slice(0,2);
  if(!r2.includes(n)) continue;
  const p = n==='43' ? 'C:/Users/User/Downloads/Real-Estate/round3/'+row.name : dir+row.name;
  if(!fs.existsSync(p)) continue;
  const kb=fs.statSync(p).size/1024;
  if(Math.abs(kb-row.size)<2) aktuell++; else alt++;
}
console.log('mit neuem Bild:', aktuell, '| noch altes Bild:', alt);
