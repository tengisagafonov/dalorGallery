const Database=require('better-sqlite3');
const db=new Database('.tmp/data.db',{readonly:true});
const t=db.prepare("select * from templates where id=428").get();
console.log({slug:t.slug,title_de:t.title_de,auto:t.auto_translate,kw:(t.search_keywords||'').slice(0,80),promptEnd:t.prompt.slice(-40)});
const img=db.prepare("select f.id,f.name from files f join files_related_mph r on r.file_id=f.id where r.related_id=428 and r.related_type like '%template%'").all();
console.log('Bild:',img);
const c=db.prepare("select c.key,c.label,c.label_de,c.placeholder,c.placeholder_de from templates_cmps tc join components_template_input_fields c on c.id=tc.cmp_id where tc.entity_id=428 order by tc.`order`").all();
console.log(JSON.stringify(c,null,1));
