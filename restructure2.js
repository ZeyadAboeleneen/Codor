const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');
const localeDir = path.join(appDir, '[locale]');

const copyRecursiveSync = function(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const itemsToMove = [
  'account', 'admin', 'auth', 'cart', 'checkout', 'contact', 'debug', 
  'favorites', 'products', 'user',
  'error.tsx', 'layout.tsx', 'not-found.tsx', 'page.tsx', 'globals.css'
];

for (const item of itemsToMove) {
  const oldPath = path.join(appDir, item);
  const newPath = path.join(localeDir, item);
  if (fs.existsSync(oldPath)) {
    copyRecursiveSync(oldPath, newPath);
    console.log(`Copied ${item}`);
    // Optional: we can delete later using rm -rf in powershell
  } else {
    console.log(`Not found: ${item}`);
  }
}
