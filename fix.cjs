
const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/\/\/ --- Components ---[\s\S]*?\/\/ --- Components ---/g, '// --- Components ---');
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx');
