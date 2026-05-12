const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('/Users/santhosh/Document/Armor Bridge/frontend/src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/background:\s*linear-gradient\(180deg,\s*#0a2540\s*0%,\s*#1541a7\s*100%\);/g, 'background: linear-gradient(180deg, #0a2540 0%, var(--accent-dark, #1541a7) 100%);');
  content = content.replace(/color:\s*#1541a7\s*;/g, 'color: var(--accent-dark, #1541a7);');
  content = content.replace(/--liquid-text:\s*#1541a7\s*;/g, '--liquid-text: var(--accent-dark, #1541a7);');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
