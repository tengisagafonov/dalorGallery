const fs=require('fs'), p=require('path');
const R2='C:/Users/User/Downloads/Real-Estate/round2';
const BASE='C:/Users/User/Downloads/Real-Estate';
const review=JSON.parse(fs.readFileSync(p.join(R2,'review.json'),'utf8'));
for(const d of ['approved','rejected']) if(!fs.existsSync(p.join(BASE,d))) fs.mkdirSync(p.join(BASE,d));
const feedbackPfad=p.join(BASE,'feedback.json');
let feedback=fs.existsSync(feedbackPfad)?JSON.parse(fs.readFileSync(feedbackPfad,'utf8')):[];
let ok=0, no=0;
for(const e of review){
  const slug=e.file.replace(/^\d\d-/,'').replace(/\.webp$/,'');
  const von=p.join(R2,e.file);
  if(e.verdict==='approved'){
    // altes abgelehntes Bild aus Runde 1 aus rejected/ entfernen, neues nach approved/
    const alt=p.join(BASE,'rejected',e.file);
    if(fs.existsSync(alt)) fs.renameSync(alt, p.join(BASE,'rejected', e.file.replace('.webp','-runde1.webp')));
    if(fs.existsSync(von)) fs.copyFileSync(von, p.join(BASE,'approved',e.file));
    feedback=feedback.filter(f=>f.file!==e.file);
    ok++;
  } else {
    feedback=feedback.filter(f=>f.file!==e.file);
    feedback.push({file:e.file, slug, comment:e.comment||'', runde:2});
    no++;
  }
}
fs.writeFileSync(feedbackPfad, JSON.stringify(feedback,null,2));
console.log('Runde 2: '+ok+' freigegeben, '+no+' abgelehnt; feedback.json aktualisiert ('+feedback.length+' offene Kritiken)');
