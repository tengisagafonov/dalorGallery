const Database=require('better-sqlite3');
const db=new Database('.tmp/data.db',{readonly:true});
const c=db.prepare("select count(*) n from templates t join templates_category_lnk l on l.template_id=t.id where l.category_id=(select id from categories where slug='real-estate' and published_at is null)").get();
console.log(c.n);
