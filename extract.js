const fs = require('fs');
const content = fs.readFileSync('lib/translations.ts', 'utf8');
const matchEn = content.match(/en:\s*({[\s\S]*?}),\n\s*ar:/);
const matchAr = content.match(/ar:\s*({[\s\S]*?})\n}/);

if (matchEn && matchAr) {
  // convert to valid JSON by evaluating
  const enObj = eval('(' + matchEn[1] + ')');
  const arObj = eval('(' + matchAr[1] + ')');
  
  fs.writeFileSync('messages/en.json', JSON.stringify(enObj, null, 2));
  fs.writeFileSync('messages/ar.json', JSON.stringify(arObj, null, 2));
  console.log("Created messages JSONs");
} else {
  console.log("Failed to match");
}
