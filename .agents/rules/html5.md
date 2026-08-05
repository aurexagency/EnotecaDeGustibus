---
trigger: always_on
---

# REGOLA HTML5: Semantic Code & Form Payload Strictness

1.  **Tag Semantici Obbligatori**: Evita la "div-soup". Usa sempre `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, ed `<aside>` in modo contestualmente corretto.
2.  **Accessibilità (a11y)**: Ogni bottone e link deve avere un attributo `aria-label` descrittivo. Il contrasto dei testi deve essere testato per AA standard.
3.  **Contatti & Booking Engine**: Qualsiasi form generato per la rotta `/contatti` DEVE includere i seguenti campi precisi, senza eccezioni:
    * Nome e Cognome (Input text, Required)
    * Mail (Input email, Required) e Numero di Telefono (Input tel, Required)
    * Numero di Persone (Select o Input number)
    * Orario di Arrivo (Input time)
    * Allergie/Intolleranze (Textarea, Optional)
    * Selezione Percorso (Checkbox o Radio buttons interattivi per le etichette).