const fs = require('fs');
const lines = fs.readFileSync('vini.html', 'utf8').split('\r\n');
const start = lines.findIndex(l => l.includes('id="vini-rossi"'));
const end = lines.findIndex((l, i) => i > start && l.trim() === '</ul>');
console.log('Section: lines', start+1, 'to', end+1);
lines.slice(start, end).filter(l => l.includes('champ-card__name')).forEach(l => console.log(l.trim()));
