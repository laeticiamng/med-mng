const fs = require('fs');

// Fix the syntax error in Index.tsx
const indexPath = 'src/pages/Index.tsx';
let content = fs.readFileSync(indexPath, 'utf8');

// Fix the broken onClick line
content = content.replace(
  /onClick=\{\(\) => navigate\('\/\)\}/g,
  "onClick={() => navigate('/')}"
);

fs.writeFileSync(indexPath, content);
console.log('Fixed Index.tsx syntax error');