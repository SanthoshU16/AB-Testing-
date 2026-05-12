const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.ts') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      
      if (fullPath.endsWith('.html')) {
        if (content.includes('#2563EB') || content.includes('#2563eb')) {
          content = content.replace(/#2563EB/gi, 'var(--accent-color, #2563EB)');
          changed = true;
        }
        if (content.includes('#1D4ED8') || content.includes('#1d4ed8')) {
          content = content.replace(/#1D4ED8/gi, 'var(--accent-hover, #1D4ED8)');
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Done');
