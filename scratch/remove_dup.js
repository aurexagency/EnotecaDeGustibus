const fs = require('fs');
let html = fs.readFileSync('vini.html', 'utf8');
const lines = html.split('\r\n');

// From the analysis:
// Line 2909 (index 2908) = </ul>  -> this is the end of the NEW block we want to keep
// Line 2910 (index 2909) = <!-- ── Bottiglia 1 ── -->  -> start of old duplicate
// Line 3556 (index 3555) = </ul>  -> end of old duplicate
// Line 3557 (index 3556) = (blank line after old </ul>)

// We want to remove lines 2910 to 3556 inclusive (1-indexed)
// That's indices 2909 to 3555 (0-indexed)

console.log('Total lines:', lines.length);
console.log('Line 2909:', lines[2908]);
console.log('Line 2910:', lines[2909]);
console.log('Line 3556:', lines[3555]);
console.log('Line 3557:', lines[3556]);

const newLines = [...lines.slice(0, 2909), ...lines.slice(3556)];
console.log('New total lines:', newLines.length);

fs.writeFileSync('vini.html', newLines.join('\r\n'));
console.log('Done!');
