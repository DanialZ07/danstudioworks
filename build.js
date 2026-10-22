const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'dist') copyDir(srcPath, destPath);
    } else {
      if (!['build.js', 'package.json', 'package-lock.json', 'vite.config.js'].includes(item)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}
copyDir('.', 'dist');

function processHtml(dir) {
  for (const item of fs.readdirSync(dir)) {
    const itemPath = path.join(dir, item);
    if (fs.lstatSync(itemPath).isDirectory()) {
      processHtml(itemPath);
    } else if (itemPath.endsWith('.html')) {
      let content = fs.readFileSync(itemPath, 'utf8');
      content = content.replace(/<!--[\s\S]*?-->/g, '');
      fs.writeFileSync(itemPath, content);
    }
  }
}
processHtml('dist');
console.log('Build complete: Files copied and comments stripped.');
