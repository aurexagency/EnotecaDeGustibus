const fs = require('fs');

let vini = fs.readFileSync('vini.html', 'utf8');
vini = vini.replace(/Selezione Pregiata/g, "Selezione d'Autore");
vini = vini.replace(/Poggio alle Nani/g, "Poggio alle Nane");
fs.writeFileSync('vini.html', vini);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/Esperienze Sartoriali/g, "Esperienze Sensoriali");
fs.writeFileSync('index.html', index);

console.log('Replaced');
