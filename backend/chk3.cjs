const Database=require('better-sqlite3');
const db=new Database('.tmp/data.db',{readonly:true});
const tabs=db.prepare("select name from sqlite_master where type='table' and name like '%activit%'").all();
console.log(tabs.map(t=>t.name));
if(tabs.length){
  const rows=db.prepare("select * from "+tabs[0].name+" order by id desc limit 5").all();
  console.log(JSON.stringify(rows,null,1).slice(0,1500));
}
