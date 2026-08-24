const fs=require('fs');
let total=0, allSlugs=new Set(), problems=0;
for(const f of process.argv.slice(2)){
  const arr=JSON.parse(fs.readFileSync(f,'utf8'));
  for(const t of arr){
    total++;
    const p=t.prompt;
    if(!p.endsWith("\n\n{{image_description}}")) {console.log("SLOT:",t.slug); problems++;}
    if(!/vertical 4:5/.test(p)) {console.log("KEIN 4:5:",t.slug); problems++;}
    if(/[\u2018\u2019\u201c\u201d]/.test(p)) {console.log("TYPO-QUOTES:",t.slug); problems++;}
    if(/--ar|--no/.test(p)) {console.log("MJ-SYNTAX:",t.slug); problems++;}
    const vars=[...new Set([...p.matchAll(/\{\{(\w+)\}\}/g)].map(m=>m[1]))];
    const keys=t.fields.map(x=>x.key);
    const miss=vars.filter(v=>!keys.includes(v));
    const orph=keys.filter(k=>!vars.includes(k));
    if(miss.length||orph.length){console.log(t.slug,"fehlt:",miss,"waise:",orph); problems++;}
    for(const v of vars) if(v!==v.toLowerCase()){console.log("GROSS:",t.slug,v); problems++;}
    if(t.fields[0].key!=="image_description"){console.log("IMGDESC NICHT ERSTES:",t.slug); problems++;}
    const n=keys.length-1;
    if(n<6||n>8) {console.log("VARIABLENZAHL "+n+":",t.slug); problems++;}
    if(allSlugs.has(t.slug)){console.log("SLUG DOPPELT:",t.slug); problems++;}
    allSlugs.add(t.slug);
    for(const fl of t.fields) if(/^for example:/i.test(fl.placeholder)){console.log("BEISPIEL-PLACEHOLDER:",t.slug,fl.key); problems++;}
  }
}
const prompts=new Set();
for(const f of process.argv.slice(2)) for(const t of JSON.parse(fs.readFileSync(f,'utf8'))) prompts.add(t.prompt);
console.log(total+" Vorlagen, "+prompts.size+" verschiedene Prompts, "+problems+" Probleme");
