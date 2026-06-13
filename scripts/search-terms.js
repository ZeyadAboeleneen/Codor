const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\zeyad\\OneDrive\\Desktop\\Digitiva\\Condor\\Condor_Web';
const foldersToSearch = ['app', 'components', 'lib', 'hooks'];
const terms = ['winter', 'summer', 'fall', 'giftPackage', 'isGiftPackage', 'customMeasurements', 'top', 'middle', 'base', 'sleeve'];

const results = {};
terms.forEach(t => results[t] = []);

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        searchDir(filePath);
      }
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
      const content = fs.readFileSync(filePath, 'utf8');
      terms.forEach(term => {
        if (content.includes(term)) {
          // get relative path
          const relPath = path.relative(projectDir, filePath).replace(/\\/g, '/');
          if (!results[term].includes(relPath)) {
            results[term].push(relPath);
          }
        }
      });
    }
  }
}

foldersToSearch.forEach(folder => {
  const folderPath = path.join(projectDir, folder);
  if (fs.existsSync(folderPath)) {
    searchDir(folderPath);
  }
});

console.log('=== Legacy Search Results ===');
Object.entries(results).forEach(([term, files]) => {
  console.log(`\nTerm: "${term}" - Found in ${files.length} files:`);
  files.forEach(f => console.log(`  - ${f}`));
});
