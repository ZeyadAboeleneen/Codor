const fs = require('fs');
const path = require('path');

const DIRS = ['app', 'components'];

const replacements = [
  // Gradients
  { from: /from-white/g, to: 'from-dark-600' },
  { from: /to-white/g, to: 'to-dark-500' },
  { from: /via-white/g, to: 'via-dark-600' },
  { from: /from-(stone|gray|neutral|slate)-50/g, to: 'from-dark-600' },
  { from: /to-(stone|gray|neutral|slate)-50/g, to: 'to-dark-500' },
  { from: /via-(stone|gray|neutral|slate)-50/g, to: 'via-dark-600' },
  { from: /from-(stone|gray|neutral|slate)-100/g, to: 'from-dark-500' },
  { from: /to-(stone|gray|neutral|slate)-100/g, to: 'to-dark-400' },
  
  // Specific backgrounds not caught before
  { from: /bg-white\/[0-9]+/g, to: 'bg-dark-600/80' },
  { from: /bg-white/g, to: 'bg-dark-600' }, // Just in case any are left
  { from: /bg-(stone|gray|neutral)-[0-9]{1,2}\b/g, to: 'bg-dark-500' }, // Catch bg-gray-50 etc if missed
  
  // Update text colors that should be lighter in dark mode
  { from: /text-gray-500/g, to: 'text-gray-400' },
  { from: /text-gray-600/g, to: 'text-gray-300' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const replacement of replacements) {
        content = content.replace(replacement.from, replacement.to);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

for (const dir of DIRS) {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
}

console.log('Gradient migration complete!');
