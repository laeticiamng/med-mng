const fs = require('fs');

// Direct fix for Index.tsx syntax error
const indexPath = 'src/pages/Index.tsx';
let content = fs.readFileSync(indexPath, 'utf8');

// Replace the broken line directly
content = content.replace(
  `<div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/)">`,
  `<div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>`
);

fs.writeFileSync(indexPath, content);
console.log('Fixed Index.tsx onClick syntax error');