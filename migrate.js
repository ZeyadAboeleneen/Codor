const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const folders = ['app', 'components'];

folders.forEach(folder => {
  const dirPath = path.join(__dirname, folder);
  if (fs.existsSync(dirPath)) {
    walkDir(dirPath, filePath => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (content.includes('import { useLocale } from "@/lib/locale-context"')) {
          content = content.replace(/import { useLocale } from "@\/lib\/locale-context"\n?/g, '');
          modified = true;
        }
        
        if (content.includes('import { useTranslation } from "@/lib/translations"')) {
          content = content.replace(/import { useTranslation } from "@\/lib\/translations"\n?/g, 'import { useTranslations } from "next-intl"\n');
          modified = true;
        }

        if (content.includes('const { settings } = useLocale()')) {
          content = content.replace(/[ \t]*const { settings } = useLocale\(\)\n?/g, '');
          modified = true;
        }

        if (content.match(/const t = useTranslation\([^)]*\)/)) {
          content = content.replace(/const t = useTranslation\([^)]*\)/g, 'const t = useTranslations()');
          modified = true;
        }

        // Handle case where useLocale is imported but not used directly next to useTranslation
        if (content.includes('settings.language')) {
           // wait this could break if settings is removed but still referenced somewhere
        }

        if (modified) {
          fs.writeFileSync(filePath, content);
          console.log(`Updated ${filePath}`);
        }
      }
    });
  }
});
