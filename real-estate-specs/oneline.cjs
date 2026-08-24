const fs=require('fs');
const all=JSON.parse(fs.readFileSync('all-50.json','utf8'));
const out=all.map((t,i)=>{
  const map={}; t.fields.forEach(f=>map[f.key]=f.placeholder);
  const p=t.prompt.replace(/\{\{(\w+)\}\}/g,(m,k)=>map[k]!==undefined?map[k]:m);
  return {n:String(i+1).padStart(2,'0'), slug:t.slug, line:p.split('\n').map(s=>s.trim()).filter(Boolean).join(' ')};
});
fs.writeFileSync('meta-oneline.json',JSON.stringify(out,null,2)+'\n');
console.log(out.length, 'einzeilige Prompts');
console.log(out[0].line.slice(0,200));
console.log('max Laenge:', Math.max(...out.map(o=>o.line.length)));
