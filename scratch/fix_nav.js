const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'chi-siamo.html',
    'vini.html',
    'distillati.html',
    'birra-olio.html',
    'contatti.html',
    'prenota-degustazione.html',
    'prenota-evento.html'
];

for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
        console.log(`File non trovato: ${file}`);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');

    // Header Home
    content = content.replace(/<a href="([^"]+)"\s*class="nav-link" id="nav-home">Home<\/a>/g, '<a href="/index.html" class="nav-link" id="nav-home">Home</a>');
    
    // Header Chi Siamo
    content = content.replace(/<a href="([^"]+)"\s*class="nav-link" id="nav-chisiamo">Chi Siamo<\/a>/g, '<a href="/chi-siamo.html" class="nav-link" id="nav-chisiamo">Chi Siamo</a>');
    
    // Header Contatti
    content = content.replace(/<a href="([^"]+)"\s*class="nav-link" id="nav-contatti">Contatti<\/a>/g, '<a href="/contatti.html" class="nav-link" id="nav-contatti">Contatti</a>');

    // Header Logo link
    content = content.replace(/<a href="#hero"\s*class="site-logo"/g, '<a href="/index.html" class="site-logo"');

    // Footer - Link Navigazione
    // Only replace exactly in footer context (we can use regex carefully)
    // For Home
    content = content.replace(/<li><a href="(#hero|\.\/index\.html)">Home<\/a><\/li>/g, '<li><a href="/index.html#hero">Home</a></li>');
    
    // I Nostri Vini (or #catalogo)
    content = content.replace(/<li><a href="(#catalogo|\.\/vini\.html[^"]*)">I Nostri Vini<\/a><\/li>/g, '<li><a href="/index.html#catalogo">I Nostri Vini</a></li>');
    
    // Degustazioni (or #esperienze)
    content = content.replace(/<li><a href="(#esperienze|\.\/prenotazione-degustazione\.html[^"]*|\.\/prenota-degustazione\.html[^"]*)">Degustazioni<\/a><\/li>/g, '<li><a href="/index.html#esperienze">Degustazioni</a></li>');
    
    // Chi Siamo (or #advisory)
    content = content.replace(/<li><a href="(#advisory|\.\/chi-siamo\.html[^"]*)">Chi Siamo<\/a><\/li>/g, '<li><a href="/chi-siamo.html">Chi Siamo</a></li>');
    
    // Contatti
    content = content.replace(/<li><a href="(#footer-contact|\.\/contatti\.html[^"]*)">Contatti<\/a><\/li>/g, '<li><a href="/contatti.html">Contatti</a></li>');

    // Footer - Esperienze
    content = content.replace(/<li><a href="(#esperienze|\.\/prenotazione-degustazione\.html[^"]*|\.\/prenota-degustazione\.html[^"]*)">Degustazione Guidata<\/a><\/li>/g, '<li><a href="/index.html#esperienze">Degustazione Guidata</a></li>');
    content = content.replace(/<li><a href="(#esperienze|\.\/prenotazione-degustazione\.html[^"]*|\.\/prenota-degustazione\.html[^"]*)">Degustazione Conviviale<\/a><\/li>/g, '<li><a href="/index.html#esperienze">Degustazione Conviviale</a></li>');
    content = content.replace(/<li><a href="(#esperienze|\.\/prenotazione-evento\.html[^"]*|\.\/prenota-evento\.html[^"]*)">Masterclass<\/a><\/li>/g, '<li><a href="/index.html#esperienze">Masterclass</a></li>');
    
    // Consulenza B2B & Regali Aziendali
    content = content.replace(/<li><a href="(#advisory|\.\/chi-siamo\.html[^"]*)">Consulenza B2B<\/a><\/li>/g, '<li><a href="/chi-siamo.html">Consulenza B2B</a></li>');
    content = content.replace(/<li><a href="(#advisory|\.\/chi-siamo\.html[^"]*)">Regali Aziendali<\/a><\/li>/g, '<li><a href="/chi-siamo.html">Regali Aziendali</a></li>');

    // Update window.location.href in HTML for buttons/cards if they exist
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?prenotazione-evento\.html'/g, "window.location.href='/prenota-evento.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?prenotazione-degustazione\.html'/g, "window.location.href='/prenota-degustazione.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?chi-siamo\.html'/g, "window.location.href='/chi-siamo.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?contatti\.html'/g, "window.location.href='/contatti.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?vini\.html'/g, "window.location.href='/vini.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?distillati\.html'/g, "window.location.href='/distillati.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?birra-olio\.html'/g, "window.location.href='/birra-olio.html'");
    content = content.replace(/window\.location\.href\s*=\s*'(\.\/)?index\.html'/g, "window.location.href='/index.html'");

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
}

// Update main.js
const mainJsPath = path.join(__dirname, '..', 'main.js');
if (fs.existsSync(mainJsPath)) {
    let mainJs = fs.readFileSync(mainJsPath, 'utf-8');
    
    mainJs = mainJs.replace(/actionUrl:\s*'\.\/prenotazione-evento\.html'/g, "actionUrl: '/prenota-evento.html'");
    mainJs = mainJs.replace(/actionUrl:\s*'\.\/prenotazione-degustazione\.html'/g, "actionUrl: '/prenota-degustazione.html'");
    mainJs = mainJs.replace(/actionUrl:\s*'\.\/contatti\.html'/g, "actionUrl: '/contatti.html'");
    
    fs.writeFileSync(mainJsPath, mainJs, 'utf-8');
    console.log('Updated main.js');
}
