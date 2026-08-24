const fs=require('fs');
const all=JSON.parse(fs.readFileSync('C:/Users/User/OneDrive/Desktop/dalor-gallery/real-estate-specs/all-50.json','utf8'));
const files=fs.readdirSync('C:/Users/User/OneDrive/Desktop/dalor-gallery/backend/public/__tmp_estate').filter(f=>f.endsWith('.webp')).sort();
const out=all.map((t,i)=>{
  const n=String(i+1).padStart(2,'0');
  const file=files.find(f=>f.startsWith(n+'-'));
  if(!file) throw new Error('kein Bild fuer '+t.slug);
  return {
    n, file,
    body:{
      title: t.title,
      slug: t.slug,
      description: t.description,
      prompt: t.prompt,
      searchKeywords: t.searchKeywords,
      autoTranslate: true,
      coverFit: 'cover',
      inputFields: t.fields.map(f=>({
        key: f.key, label: f.label, inputType: f.inputType,
        placeholder: f.placeholder, required: f.required, autoTranslate: true
      })),
      category: { connect: [{ documentId: 'pyubgk6fg5v7obgntvkwe09a' }] }
    }
  };
});
fs.writeFileSync('C:/Users/User/OneDrive/Desktop/dalor-gallery/backend/public/__tmp_estate/payload.json', JSON.stringify(out));
console.log('payload:', out.length, 'Eintraege');
