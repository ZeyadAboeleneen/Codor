const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');
const localeDir = path.join(appDir, '[locale]');

if (!fs.existsSync(localeDir)) {
  fs.mkdirSync(localeDir);
}

const itemsToMove = [
  'about', 'account', 'admin', 'auth', 'cart', 'checkout', 'contact', 'debug', 
  'favorites', 'products', 'user',
  'error.tsx', 'layout.tsx', 'not-found.tsx', 'page.tsx', 'globals.css'
];

for (const item of itemsToMove) {
  const oldPath = path.join(appDir, item);
  const newPath = path.join(localeDir, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item}`);
  } else {
    console.log(`Not found: ${item}`);
  }
}
