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
  let changed = false;
  
  if (content.includes('#1f57d6 0%, #1541a7 50%, #0e2b70 100%')) {
    content = content.split('#1f57d6 0%, #1541a7 50%, #0e2b70 100%').join('var(--accent-light, #3B82F6) 0%, var(--accent-color, #2563EB) 50%, var(--accent-hover, #1D4ED8) 100%');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
