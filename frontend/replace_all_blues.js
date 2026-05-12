const fs = require('fs');
const path = require('path');

function processContent(content) {
  let newContent = content;
  
  // Replace hex colors
  newContent = newContent.replace(/#3B82F6/gi, 'var(--accent-light, #3B82F6)');
  newContent = newContent.replace(/#0071e3/gi, 'var(--accent-color, #0071e3)');
  newContent = newContent.replace(/#0077ED/gi, 'var(--accent-hover, #0077ED)');
  newContent = newContent.replace(/#1E40AF/gi, 'var(--accent-dark, #1E40AF)');
  newContent = newContent.replace(/#a1c4fd/gi, 'var(--accent-light, #a1c4fd)');
  newContent = newContent.replace(/#c2e9fb/gi, 'var(--accent-light, #c2e9fb)');
  newContent = newContent.replace(/#0056b3/gi, 'var(--accent-dark, #0056b3)');
  
  // Replace rgba for #2563EB (37, 99, 235)
  newContent = newContent.replace(/rgba\(\s*37\s*,\s*99\s*,\s*235\s*,\s*([0-9.]+)\s*\)/g, (match, alpha) => {
    return `color-mix(in srgb, var(--accent-color, #2563EB) calc(${alpha} * 100%), transparent)`;
  });

  // Replace rgba for #3B82F6 (59, 130, 246)
  newContent = newContent.replace(/rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*([0-9.]+)\s*\)/g, (match, alpha) => {
    return `color-mix(in srgb, var(--accent-light, #3B82F6) calc(${alpha} * 100%), transparent)`;
  });

  // Replace rgba for #0071e3 (0, 113, 227)
  newContent = newContent.replace(/rgba\(\s*0\s*,\s*113\s*,\s*227\s*,\s*([0-9.]+)\s*\)/g, (match, alpha) => {
    return `color-mix(in srgb, var(--accent-color, #0071e3) calc(${alpha} * 100%), transparent)`;
  });

  return newContent;
}

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
      // Don't modify personalization.component.ts directly for these core variables
      if (fullPath.endsWith('personalization.component.ts')) continue;
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = processContent(content);
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Done');
