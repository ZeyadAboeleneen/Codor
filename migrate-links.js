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

        if (content.includes('import Link from "next/link"')) {
          content = content.replace(/import Link from "next\/link"/g, 'import { Link } from "@/i18n/routing"');
          modified = true;
        }

        if (content.includes('from "next/navigation"')) {
          if (content.includes('usePathname') || content.includes('useRouter') || content.includes('redirect')) {
            content = content.replace(/import {([^}]*)} from "next\/navigation"/g, (match, imports) => {
              if (imports.includes('notFound')) {
                // Keep notFound from next/navigation, separate others
                return match; // Too complex for simple regex if mixed, let's leave mixed alone or fix manually
              } else {
                return `import {${imports}} from "@/i18n/routing"`;
              }
            });
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, content);
          console.log(`Updated link/nav in ${filePath}`);
        }
      }
    });
  }
});
