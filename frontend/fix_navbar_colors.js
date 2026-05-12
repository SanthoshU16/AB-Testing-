const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'app', 'shared', 'navbar', 'navbar.component.css');
let content = fs.readFileSync(cssPath, 'utf8');

content = content.replace(/#1f57d6/gi, 'var(--accent-color, #1f57d6)');
content = content.replace(/#1541a7/gi, 'var(--accent-dark, #1541a7)');
content = content.replace(/#0e2b70/gi, 'color-mix(in srgb, var(--accent-dark, #0e2b70) 50%, black)');

content = content.replace(/rgba\(\s*31\s*,\s*87\s*,\s*214\s*,\s*([0-9.]+)\s*\)/g, (match, alpha) => {
  return `color-mix(in srgb, var(--accent-color, #1f57d6) calc(${alpha} * 100%), transparent)`;
});

content = content.replace(/rgba\(\s*29\s*,\s*78\s*,\s*216\s*,\s*([0-9.]+)\s*\)/g, (match, alpha) => {
  return `color-mix(in srgb, var(--accent-color, #1d4ed8) calc(${alpha} * 100%), transparent)`;
});

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Fixed navbar colors');
