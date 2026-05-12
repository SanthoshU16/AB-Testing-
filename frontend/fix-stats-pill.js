const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  const pattern = /background:\s*linear-gradient\(160deg,[\s\S]*?#1e3bb6\s*100%\);/g;
  content = content.replace(pattern, 'background: linear-gradient(160deg, var(--accent-light, #3B82F6) 0%, var(--accent-color, #2563EB) 50%, var(--accent-hover, #1D4ED8) 100%);');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } else {
    console.log('No match found in', file);
  }
}

fix('/Users/santhosh/Document/Armor Bridge/frontend/src/app/pages/learning/learning.component.css');
fix('/Users/santhosh/Document/Armor Bridge/frontend/src/app/pages/about/about.component.css');
