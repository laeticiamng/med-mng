const fs = require('fs');

// Precise fix for Index.tsx
const filePath = 'src/pages/Index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines for precise editing
let lines = content.split('\n');

// Fix line 114 (index 113) - the onClick issue
if (lines[113] && lines[113].includes("onClick={() => navigate('/)")) {
  lines[113] = lines[113].replace(
    "onClick={() => navigate('/)}",
    "onClick={() => navigate('/')}"
  );
  console.log('Fixed line 114: onClick syntax');
}

// Check for any other broken navigate calls
lines = lines.map(line => {
  if (line.includes("navigate('/)}") && !line.includes("navigate('/')")) {
    return line.replace(/navigate\('\//g, "navigate('/");
  }
  return line;
});

// Write back to file
fs.writeFileSync(filePath, lines.join('\n'));
console.log('Applied precise syntax fixes to Index.tsx');