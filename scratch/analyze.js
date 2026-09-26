const fs = require('fs');
let html = fs.readFileSync('vini.html', 'utf8');
const lines = html.split('\r\n');

// Find the index of the vini-rossi section start
const rossiStart = lines.findIndex(l => l.includes('id="vini-rossi"'));
console.log('vini-rossi section starts at line:', rossiStart + 1);

// Find all </ul> after vini-rossi start
const ulCloses = [];
for (let i = rossiStart; i < lines.length; i++) {
  if (lines[i].trim() === '</ul>') {
    ulCloses.push(i + 1); // 1-indexed
  }
}
console.log('</ul> lines after vini-rossi:', ulCloses.slice(0, 5));

// Find all <!-- ── Bottiglia N ── --> comment lines after vini-rossi
const bottMatches = [];
for (let i = rossiStart; i < lines.length; i++) {
  if (lines[i].includes('Bottiglia') && lines[i].includes('──')) {
    bottMatches.push({ line: i + 1, content: lines[i].trim() });
  }
}
console.log('Total Bottiglia comments in vini-rossi section:', bottMatches.length);
bottMatches.forEach(b => console.log(`  Line ${b.line}: ${b.content}`));
