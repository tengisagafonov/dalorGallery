const Database=require('better-sqlite3');
const db=new Database('.tmp/data.db',{readonly:true});
const rows=db.prepare(`select t.id,t.slug,t.published_at,t.title_de is not null de from templates t join templates_category_lnk l on l.template_id=t.id where l.category_id in (select id from categories where slug='real-estate') order by t.id`).all();
console.log(rows.length+' Real-Estate-Vorlagen');
console.log(JSON.stringify(rows,null,1));
