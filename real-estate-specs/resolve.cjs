const fs=require('fs');
const files=['01-10.json','11-20.json','21-30.json','31-40.json','41-50.json'];
const all=files.flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));
fs.writeFileSync('all-50.json',JSON.stringify(all,null,2)+'\n');
const out=[];
all.forEach((t,i)=>{
  const n=String(i+1).padStart(2,'0');
  const map={}; t.fields.forEach(f=>map[f.key]=f.placeholder);
  let p=t.prompt.replace(/\{\{(\w+)\}\}/g,(m,k)=>map[k]!==undefined?map[k]:m);
  out.push("### "+n+" "+t.slug+"\n"+p+"\n");
});
fs.writeFileSync('meta-prompts.txt',out.join("\n"));
console.log(all.length+" aufgeloeste Prompts geschrieben");
const rest=out.join("").match(/\{\{\w+\}\}/g);
console.log("unaufgeloeste Platzhalter:", rest?rest.length:0);
