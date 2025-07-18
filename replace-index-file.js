const fs = require('fs');

// Replace the broken Index.tsx with the fixed version
const brokenPath = 'src/pages/Index.tsx';
const fixedPath = 'src/pages/IndexFixed.tsx';

if (fs.existsSync(fixedPath)) {
  const fixedContent = fs.readFileSync(fixedPath, 'utf8');
  fs.writeFileSync(brokenPath, fixedContent);
  fs.unlinkSync(fixedPath); // Remove the temporary file
  console.log('Successfully replaced Index.tsx with fixed version');
} else {
  console.error('Fixed version not found');
}