const fs = require('fs');
let html = fs.readFileSync('vini.html', 'utf8');

const regex = /<!-- ── Bottiglia (\d+) ── -->[\s\S]*?(?=<!-- ── (Bottiglia \d+|Domaine)|<\/ul>)/g;
let matches = [...html.matchAll(regex)];

let rossiMatches = matches.filter(m => parseInt(m[1]) >= 6 && parseInt(m[1]) <= 23 && m.index > html.indexOf('id="vini-rossi"'));

let newBlocks = [];

for (let i = 0; i < rossiMatches.length; i++) {
    let currentBlock = rossiMatches[i][0];
    let newBlock = currentBlock;
    
    if (i === 0) {
        // Bottiglia 6 -> empty text
        newBlock = newBlock.replace(/aria-label="[^"]*"/g, 'aria-label=""');
        newBlock = newBlock.replace(/alt="[^"]*"/, 'alt=""');
        newBlock = newBlock.replace(/data-caption="[^"]*"/, 'data-caption=""');
        newBlock = newBlock.replace(/<h3 class="champ-card__name">[^<]*<\/h3>/, '<h3 class="champ-card__name"></h3>');
        newBlock = newBlock.replace(/<p class="champ-card__grapes">[^<]*<\/p>/, '<p class="champ-card__grapes"></p>');
        newBlock = newBlock.replace(/<a href="#" class="champ-card__cta"/, '<a href="#" class="champ-card__cta" style="display:none;"');
    } else {
        // Bottle i gets text from i - 1
        let prevBlock = rossiMatches[i-1][0];
        
        let ariaLabelMatch = prevBlock.match(/aria-label="([^"]*)"/);
        let ariaLabel = ariaLabelMatch ? ariaLabelMatch[1] : '';
        
        let altMatch = prevBlock.match(/alt="([^"]*)"/);
        let alt = altMatch ? altMatch[1] : '';
        
        let dataCaptionMatch = prevBlock.match(/data-caption="([^"]*)"/);
        let dataCaption = dataCaptionMatch ? dataCaptionMatch[1] : '';
        
        let nameMatch = prevBlock.match(/<h3 class="champ-card__name">([^<]*)<\/h3>/);
        let name = nameMatch ? nameMatch[1] : '';
        
        let grapesMatch = prevBlock.match(/<p class="champ-card__grapes">([^<]*)<\/p>/);
        let grapes = grapesMatch ? grapesMatch[1] : '';
        
        newBlock = newBlock.replace(/aria-label="[^"]*"/g, `aria-label="${ariaLabel}"`);
        newBlock = newBlock.replace(/alt="[^"]*"/, `alt="${alt}"`);
        newBlock = newBlock.replace(/data-caption="[^"]*"/, `data-caption="${dataCaption}"`);
        newBlock = newBlock.replace(/<h3 class="champ-card__name">[^<]*<\/h3>/, `<h3 class="champ-card__name">${name}</h3>`);
        newBlock = newBlock.replace(/<p class="champ-card__grapes">[^<]*<\/p>/, `<p class="champ-card__grapes">${grapes}</p>`);
    }
    newBlocks.push(newBlock);
}

// Now replace the old blocks with new blocks in html
for (let i = 0; i < rossiMatches.length; i++) {
    html = html.replace(rossiMatches[i][0], newBlocks[i]);
}

fs.writeFileSync('vini.html', html);
console.log('Done!');
