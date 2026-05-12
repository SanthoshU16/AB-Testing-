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
  
  content = content.replace(/rgba\(29,\s*78,\s*216,\s*([0-9.]+)\)/g, (match, p1) => {
    return `color-mix(in srgb, var(--accent-hover, #1D4ED8) calc(${p1} * 100%), transparent)`;
  });

  content = content.replace(/rgba\(14,\s*43,\s*112,\s*([0-9.]+)\)/g, (match, p1) => {
    return `color-mix(in srgb, var(--accent-dark, #0e2b70) calc(${p1} * 100%), transparent)`;
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated shadows in', file);
  }
});
