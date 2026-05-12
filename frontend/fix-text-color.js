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
  
  content = content.replace(/color:\s*#1f57d6\s*;/g, 'color: var(--accent-color, #2563EB);');
  content = content.replace(/color:\s*#1f57d6\s*!important;/g, 'color: var(--accent-color, #2563EB) !important;');
  
  content = content.replace(/background:\s*linear-gradient\(180deg,\s*#1f57d6\s*0%,\s*#1541a7\s*100%\);/g, 'background: linear-gradient(180deg, var(--accent-color, #2563EB) 0%, var(--accent-dark, #1541a7) 100%);');
  
  content = content.replace(/background:\s*linear-gradient\(135deg,\s*#1f57d6,\s*#0e2b70\);/g, 'background: linear-gradient(135deg, var(--accent-color, #2563EB), var(--accent-dark, #0e2b70));');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated colors in', file);
  }
});
