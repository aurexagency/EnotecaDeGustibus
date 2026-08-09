'use strict';

    // ── Hero Scroll-Scrubbed Frame Sequence ───────────────
    (function () {
      const canvas    = document.getElementById('hero-canvas');
      const ctx       = canvas.getContext('2d');
      const container = document.getElementById('hero-scroll-container');
      const BASE      = '/hero/vorrei_un_qualcosa_di_estremam_000/vorrei_un_qualcosa_di_estremam_';
      const TOTAL     = 100;

      const frames    = new Array(TOTAL);
      let loaded      = 0;
      let lastIdx     = -1;
      let rafPending  = false;

      // Respect prefers-reduced-motion
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function resize() {
        canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        renderFrame(lastIdx < 0 ? 0 : lastIdx);
      }

      function drawFrame(img) {
        if (!img || !img.complete) return;
        const cw = canvas.width, ch = canvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dw = img.naturalWidth  * scale;
        const dh = img.naturalHeight * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
      }

      function renderFrame(idx) {
        if (idx === lastIdx) return;
        lastIdx = idx;
        drawFrame(frames[idx]);
      }

      function getScrollIndex() {
        const rect   = container.getBoundingClientRect();
        const total  = container.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;                         // px scrolled into container
        const progress = Math.min(Math.max(scrolled / total, 0), 1);
        return Math.min(Math.round(progress * (TOTAL - 1)), TOTAL - 1);
      }

      function onScroll() {
        if (reducedMotion) return;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          renderFrame(getScrollIndex());
        });
      }

      // Preload all frames
      for (let i = 0; i < TOTAL; i++) {
        const img = new Image();
        const idx = String(i).padStart(3, '0');
        img.src   = BASE + idx + '.jpg';
        img.onload = () => {
          loaded++;
          if (i === 0) { resize(); drawFrame(img); }  // show frame 0 immediately
        };
        frames[i] = img;
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', resize,   { passive: true });
      resize();
    })();


    // ── Header scroll effect ──────────────────────────────
    // L'header rimane trasparente per tutta la durata della
    // sequenza hero (500vh). Diventa solido solo oltre.
    const header          = document.getElementById('site-header');
    const heroContainer   = document.getElementById('hero-scroll-container');

    function handleHeaderScroll() {
      const heroBottom = heroContainer.getBoundingClientRect().bottom;
      // heroBottom <= 0 significa che l'utente ha superato l'intera hero
      if (heroBottom <= 0) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll(); // check on load

    // ── Mobile Menu Toggle ────────────────────────────────
    const navToggle = document.getElementById('nav-toggle-btn');
    const navMenu   = document.getElementById('nav-menu');

    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu di navigazione');
    });

    // Chiudi menu al click su un link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Apri menu di navigazione');
      });
    });

    // Chiudi menu su ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });

    // ── Scroll Reveal ─────────────────────────────────────
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── Newsletter Form ───────────────────────────────────
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput  = newsletterForm.querySelector('#newsletter-email');
        const submitBtn   = newsletterForm.querySelector('#newsletter-btn');

        if (emailInput.value && emailInput.validity.valid) {
          submitBtn.textContent = 'Grazie ✓';
          submitBtn.disabled = true;
          submitBtn.style.background = 'var(--color-avorio)';
          emailInput.value = '';
        }
      });
    }

    // ── Tri-card keyboard accessibility ──────────────────
    document.querySelectorAll('.tri-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });


    // ══════════════════════════════════════════════════════
    // LIGHTBOX — Sistema modale per immagini prodotto
    // Intercetta `.zoomable-image`, carica data-highres o src,
    // gestisce chiusura via X / overlay / Escape.
    // ══════════════════════════════════════════════════════
    (function initLightbox() {
      'use strict';

      // ── Riferimenti DOM ───────────────────────────────
      const lightbox     = document.getElementById('lightbox-modal');
      const overlay      = document.getElementById('lightbox-overlay');
      const closeBtn     = document.getElementById('lightbox-close');
      const lightboxImg  = document.getElementById('lightbox-img');
      const lightboxCapt = document.getElementById('lightbox-caption');

      // Se la modale non è nel DOM (es. pagine diverse), esci silenziosamente
      if (!lightbox) return;

      // Elemento che aveva il focus prima dell'apertura (per ripristino)
      let previousFocus = null;

      // ── Apertura modale ───────────────────────────────
      function openLightbox(triggerImg) {
        // 1. Salva il focus corrente
        previousFocus = document.activeElement;

        // 2. Carica immagine: preferisce data-highres se esiste,
        //    altrimenti usa il src normale dell'img cliccata
        const hiResSrc = triggerImg.dataset.highres || triggerImg.src;
        lightboxImg.src = hiResSrc;
        lightboxImg.alt = triggerImg.alt || '';

        // 3. Popola la didascalia dall'attributo data-caption o dall'alt
        lightboxCapt.textContent = triggerImg.dataset.caption
          || triggerImg.alt
          || '';

        // 4. Blocca lo scroll del body
        document.body.style.overflow = 'hidden';

        // 5. Rendi visibile la modale (classe CSS)
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');

        // 6. Sposta il focus al pulsante di chiusura (accessibilità)
        //    Piccolo delay per aspettare la transizione CSS
        setTimeout(() => closeBtn.focus(), 60);
      }

      // ── Chiusura modale ───────────────────────────────
      function closeLightbox() {
        // 1. Avvia la transizione di uscita
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');

        // 2. Ripristina lo scroll del body
        document.body.style.overflow = '';

        // 3. Ripristina il focus all'elemento sorgente
        if (previousFocus) {
          previousFocus.focus({ preventScroll: true });
          previousFocus = null;
        }

        // 4. Pulisce src e alt dopo la transizione di uscita
        //    (evita flash dell'immagine precedente alla prossima apertura)
        const TRANSITION_DURATION = 550; // ms — allineato alla transizione CSS
        setTimeout(() => {
          lightboxImg.src = '';
          lightboxImg.alt = '';
          lightboxCapt.textContent = '';
        }, TRANSITION_DURATION);
      }

      // ── Event: click su immagine zoomabile ────────────
      // Utilizza event delegation su document per catturare
      // anche immagini caricate dinamicamente o in iframe/pagine
      document.addEventListener('click', (e) => {
        let img = e.target.closest('.zoomable-image');
        const cta = e.target.closest('.champ-card__cta');
        
        if (cta) {
            e.preventDefault();
            const card = cta.closest('.champ-card');
            if (card) {
                img = card.querySelector('.zoomable-image');
            }
        }

        if (!img) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        openLightbox(img);
      });

      // ── Event: click sull'overlay per chiudere ────────
      overlay.addEventListener('click', closeLightbox);

      // ── Event: click sul pulsante X per chiudere ─────
      closeBtn.addEventListener('click', closeLightbox);

      // ── Event: tasto Escape per chiudere ─────────────
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
          e.stopPropagation(); // evita conflitti con il menu mobile
          closeLightbox();
        }
      });

      // ── Accessibilità: blocca tab focus dentro la modale ─
      // (focus trap minimale: solo closeBtn ricevibile)
      lightbox.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && lightbox.classList.contains('is-open')) {
          e.preventDefault(); // tiene il focus sul close button
          closeBtn.focus();
        }
      });

    })(); // fine initLightbox


    // ══════════════════════════════════════════════════════
    // SWIPE BUTTON — Cork Pop
    // ─────────────────────────────────────────────────────
    // Gestisce il trascinamento del "tappo" con:
    //   • Bounds fisici (left: pad → right: maxX)
    //   • Fill tracker in tempo reale
    //   • DOM bubble trail durante il drag
    //   • Tension shake oltre il 70% di progresso
    //   • Canvas particle burst al completamento (cork pop)
    //   • Ritorno spring se rilasciato prima del 100%
    //   • Accessibilità keyboard (Enter/Space = trigger diretto)
    //   • Rispetto prefers-reduced-motion
    // ══════════════════════════════════════════════════════
    (function initSwipeButton() {
      'use strict';

      // ── Riferimenti DOM ─────────────────────────────────
      const btn         = document.getElementById('swipe-btn');
      const thumb       = document.getElementById('swipe-thumb');
      const fill        = document.getElementById('swipe-fill');
      const trail       = document.getElementById('swipe-trail');
      const canvas      = document.getElementById('swipe-canvas');
      const labelNormal = document.getElementById('swipe-label');
      const labelOk     = document.getElementById('swipe-label-success');

      // Uscita silenziosa se il componente non è nella pagina
      if (!btn || !thumb || !canvas) return;

      // ── Canvas 2D context ────────────────────────────────
      const ctx = canvas.getContext('2d');

      // ── Stato interno ────────────────────────────────────
      let isDragging  = false;
      let isCompleted = false;
      let startX      = 0;          // posizione pointer al pointerdown
      let currentX    = 0;          // offset thumb corrente (px)
      let maxX        = 0;          // corsa massima calcolata al pointerdown
      let lastBubbleT = 0;          // timestamp ultima bolla creata
      let bubbleRAF   = null;       // handle requestAnimationFrame per bolle
      let particleRAF = null;       // handle rAF per canvas particles
      let particles   = [];         // array particelle canvas
      let tensionFired = false;     // shake già inviato per questo drag?

      // ── Reduced Motion ───────────────────────────────────
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ── Util: dimensionamento canvas ─────────────────────
      function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = canvas.offsetWidth  * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
      }

      // ── Calcolo corsa massima ────────────────────────────
      function calcMaxX() {
        const pad  = parseFloat(getComputedStyle(btn).getPropertyValue('--swipe-pad')) || 6;
        const tsz  = parseFloat(getComputedStyle(btn).getPropertyValue('--swipe-thumb-sz')) || 52;
        maxX = btn.offsetWidth - tsz - pad * 2;
      }

      // ── Aggiorna posizione visiva thumb e fill ───────────
      function setThumbX(x) {
        // Clamp nei bounds
        x = Math.max(0, Math.min(x, maxX));
        currentX = x;

        const progress = x / maxX; // 0 → 1

        // Thumb: trasla solo X, preserva Y centrato
        thumb.style.transform = `translateY(-50%) translateX(${x}px)`;

        // Fill: si espande proporzionalmente
        fill.style.width = `${progress * 100}%`;

        // Label opacity: sfuma al 40% di progresso
        const labelOpacity = Math.max(0, 1 - progress * 2.5);
        labelNormal.style.opacity = labelOpacity;

        return progress;
      }

      // ── Crea una singola bolla DOM nel trail ─────────────
      function spawnBubble(x) {
        if (reducedMotion) return;
        const bubble = document.createElement('span');
        bubble.className = 'swipe-bubble';
        const size = 3 + Math.random() * 5;             // 3–8 px
        const dur  = (0.6 + Math.random() * 0.6).toFixed(2); // 0.6–1.2 s
        const yOff = Math.random() * 100;               // posizione verticale casuale %
        bubble.style.cssText = `
          width:${size}px;
          height:${size}px;
          left:${x - size / 2}px;
          top:${yOff}%;
          --dur:${dur}s;
        `;
        trail.appendChild(bubble);
        // Rimuovi dopo l'animazione per non sporcare il DOM
        bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
      }

      // ── Loop bolle durante il drag ───────────────────────
      function bubbleLoop(timestamp) {
        if (!isDragging) return;
        if (timestamp - lastBubbleT > 60) {   // max ~16 bolle/s
          lastBubbleT = timestamp;
          const pad = parseFloat(getComputedStyle(btn).getPropertyValue('--swipe-pad')) || 6;
          const tsz = parseFloat(getComputedStyle(btn).getPropertyValue('--swipe-thumb-sz')) || 52;
          // La bolla appare subito a sinistra del thumb
          spawnBubble(pad + tsz + currentX - 4);
        }
        bubbleRAF = requestAnimationFrame(bubbleLoop);
      }

      // ── Effetto tensione (shake) ─────────────────────────
      function triggerTension() {
        if (tensionFired) return;
        tensionFired = true;
        btn.classList.add('is-tension');
        btn.addEventListener('animationend', () => btn.classList.remove('is-tension'), { once: true });
      }

      // ══════════════════════════════════════════════════════
      // PARTICELLE CANVAS — Cork Pop burst
      // ══════════════════════════════════════════════════════
      function Particle(x, y) {
        const angle  = (Math.random() * 220 - 160) * (Math.PI / 180); // -160°..+60° (destra/su)
        const speed  = 1.5 + Math.random() * 4.5;
        this.x  = x;
        this.y  = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2;   // impulso verso l'alto
        this.r  = 2 + Math.random() * 4;
        this.life = 1.0;
        this.decay = 0.018 + Math.random() * 0.018;
        // Colori: oro, avorio, giallo chiaro
        const palette = ['255,215,0', '255,255,230', '255,240,120', '200,160,12'];
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }

      Particle.prototype.update = function () {
        this.vy += 0.12;    // gravità leggera
        this.x  += this.vx;
        this.y  += this.vy;
        this.life -= this.decay;
        this.r   *= 0.985; // si restringe lentamente
      };

      Particle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0, this.r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.life.toFixed(2)})`;
        ctx.fill();
      };

      function spawnParticleBurst(originX, originY) {
        const count = reducedMotion ? 0 : 55;
        particles = Array.from({ length: count }, () => new Particle(originX, originY));
      }

      function particleLoop() {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);

        particles = particles.filter(p => p.life > 0);

        particles.forEach(p => {
          p.update();
          p.draw(ctx);
        });

        if (particles.length > 0) {
          particleRAF = requestAnimationFrame(particleLoop);
        } else {
          ctx.clearRect(0, 0, w, h);
        }
      }

      // ══════════════════════════════════════════════════════
      // COMPLETAMENTO — Cork Pop
      // ══════════════════════════════════════════════════════
      function complete() {
        if (isCompleted) return;
        isCompleted = true;
        isDragging  = false;

        // Cancella loop bolle e vibrazione
        if (bubbleRAF) { cancelAnimationFrame(bubbleRAF); bubbleRAF = null; }
        btn.classList.remove('is-dragging', 'is-tension');
        btn.classList.add('is-complete');

        // Calcola origine burst: centro del thumb nella corsa finale
        resizeCanvas();
        const pad = parseFloat(getComputedStyle(btn).getPropertyValue('--swipe-pad')) || 6;
        const tsz = parseFloat(getComputedStyle(btn).getPropertyValue('--swipe-thumb-sz')) || 52;
        const originX = pad + tsz + maxX;
        const originY = btn.offsetHeight / 2;

        spawnParticleBurst(originX, originY);

        // Fill al 100%
        fill.style.width = '100%';

        // Avvia loop particelle
        if (particleRAF) cancelAnimationFrame(particleRAF);
        particleRAF = requestAnimationFrame(particleLoop);

        // Aggiorna aria-label per screen reader
        btn.setAttribute('aria-label', 'Prenotazione iniziata con successo');

        // Dopo 1.6 s naviga alla sezione prenotazione
        setTimeout(() => {
          const target = document.getElementById('esperienze');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Resetta il bottone 1 secondo dopo aver iniziato lo scroll
            setTimeout(() => {
              resetSwipeButton();
            }, 1000);
          }
        }, 1600);
      }

      function resetSwipeButton() {
        isCompleted = false;
        btn.classList.remove('is-complete');
        btn.setAttribute('aria-label', 'Trascina per prenotare una degustazione');
        
        // Ferma particelle e pulisci canvas
        if (particleRAF) { cancelAnimationFrame(particleRAF); particleRAF = null; }
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        particles = [];

        // Riporta il thumb a 0 con animazione
        thumb.classList.add('is-returning');
        setThumbX(0);
        fill.style.width = '0%';
        labelNormal.style.opacity = '1';

        thumb.addEventListener('transitionend', () => {
          thumb.classList.remove('is-returning');
        }, { once: true });
      }

      // ══════════════════════════════════════════════════════
      // POINTER EVENTS — Drag handler
      // ══════════════════════════════════════════════════════
      function onPointerDown(e) {
        if (isCompleted) return;
        e.preventDefault();

        isDragging    = true;
        tensionFired  = false;
        startX        = e.clientX;

        calcMaxX();
        resizeCanvas();

        btn.classList.add('is-dragging');
        btn.setPointerCapture(e.pointerId);   // cattura pointer anche fuori bounds

        // Avvia loop bolle
        if (bubbleRAF) cancelAnimationFrame(bubbleRAF);
        bubbleRAF = requestAnimationFrame(bubbleLoop);
      }

      function onPointerMove(e) {
        if (!isDragging || isCompleted) return;
        e.preventDefault();

        const delta    = e.clientX - startX;
        const progress = setThumbX(currentX + delta);
        startX         = e.clientX;  // aggiorna per movimento relativo

        // Effetto tensione quando supera il 68%
        if (progress > 0.68 && !tensionFired) {
          triggerTension();
        }

        // Se raggiunge il 100%: completa
        if (progress >= 0.995) {
          complete();
        }
      }

      function onPointerUp(e) {
        if (!isDragging || isCompleted) return;
        isDragging = false;

        // Cancella loop bolle
        if (bubbleRAF) { cancelAnimationFrame(bubbleRAF); bubbleRAF = null; }

        btn.classList.remove('is-dragging');
        btn.releasePointerCapture(e.pointerId);

        // Ritorno spring: riporta il thumb a 0
        thumb.classList.add('is-returning');
        setThumbX(0);
        fill.style.width = '0%';
        labelNormal.style.opacity = '1';

        thumb.addEventListener('transitionend', () => {
          thumb.classList.remove('is-returning');
        }, { once: true });

        tensionFired = false;
      }

      // ── Keyboard: Enter o Space triggera il completamento ─
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isCompleted) {
            calcMaxX();
            resizeCanvas();
            setThumbX(maxX);
            complete();
          }
        }
      });

      // ── Registrazione eventi pointer ─────────────────────
      btn.addEventListener('pointerdown',   onPointerDown,  { passive: false });
      btn.addEventListener('pointermove',   onPointerMove,  { passive: false });
      btn.addEventListener('pointerup',     onPointerUp);
      btn.addEventListener('pointercancel', onPointerUp);

      // ── Resize: ricalcola canvas e maxX ──────────────────
      window.addEventListener('resize', () => {
        if (!isCompleted) {
          calcMaxX();
          resizeCanvas();
        }
      }, { passive: true });

      // ── Init ─────────────────────────────────────────────
      calcMaxX();
      resizeCanvas();

    })(); // fine initSwipeButton


    // ══════════════════════════════════════════════════════
    // SWIPE-ACTION FACTORY — Wine Pour & Cork Pop
    // ─────────────────────────────────────────────────────
    // Gestisce i nuovi componenti .swipe-action in modo
    // completamente riutilizzabile. Ogni istanza riceve:
    //   { btnId, type: 'pour'|'cork', actionUrl, snapThreshold }
    //
    // Meccanica drag:
    //   • Pointer Events con pointer capture (touch + mouse)
    //   • Fill % in tempo reale su onPointerMove
    //   • Bolle DOM nel trail durante il drag
    //   • Shake CSS al 68% di progresso (effetto tensione)
    //   • Se rilascio > snapThreshold (85%): snap 100% → azione
    //   • Se rilascio < snapThreshold: spring-back a 0
    //   • Completamento: particelle canvas (cork) / flash (pour)
    //   • Accessibilità: Enter/Space → trigger immediato
    //   • prefers-reduced-motion: animazioni skip, azione diretta
    // ══════════════════════════════════════════════════════
    (function initSwipeActions() {
      'use strict';

      // ── Reduced Motion globale ───────────────────────────
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ── Factory principale ───────────────────────────────
      function createSwipeAction(config) {
        const {
          btnId,           // ID del container .swipe-action
          type,            // 'pour' | 'cork'
          actionUrl,       // URL di destinazione al completamento
          snapThreshold,   // frazione 0–1 oltre cui scatta lo snap (default 0.85)
          tensionAt,       // frazione 0–1 al quale scatta la tensione (default 0.68)
        } = Object.assign({
          type: 'cork',
          snapThreshold: 0.85,
          tensionAt: 0.68,
        }, config);

        // ── DOM refs ─────────────────────────────────────────
        const btn         = document.getElementById(btnId);
        if (!btn) return; // elemento non presente in questa pagina

        // Ricostruiamo gli ID degli sotto-elementi basandoci sull'ID del btn
        // oppure tramite querySelector (più robusto)
        const fill        = btn.querySelector('.swipe-action__fill');
        const trail       = btn.querySelector('.swipe-action__trail');
        const thumb       = btn.querySelector('.swipe-action__thumb');
        const labelNormal = btn.querySelector('.swipe-action__label:not(.swipe-action__label--success)');
        const labelOk     = btn.querySelector('.swipe-action__label--success');
        const canvas      = btn.querySelector('.swipe-action__canvas');

        if (!fill || !thumb || !canvas) return;

        const ctx = canvas.getContext('2d');

        // ── Stato interno ─────────────────────────────────────
        let isDragging   = false;
        let isCompleted  = false;
        let startX       = 0;
        let currentX     = 0;
        let maxX         = 0;
        let lastBubbleT  = 0;
        let bubbleRAF    = null;
        let particleRAF  = null;
        let particles    = [];
        let tensionFired = false;

        // ── Dimensionamento canvas ───────────────────────────
        function resizeCanvas() {
          const dpr = window.devicePixelRatio || 1;
          canvas.width  = canvas.offsetWidth  * dpr;
          canvas.height = canvas.offsetHeight * dpr;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }

        // ── Calcolo corsa massima ─────────────────────────────
        function calcMaxX() {
          const pad = 6; // --sa-pad
          const tsz = parseFloat(getComputedStyle(thumb).width) || 56;
          maxX = Math.max(0, btn.offsetWidth - tsz - pad * 2);
        }

        // ── Aggiorna thumb + fill ─────────────────────────────
        function setThumbX(x) {
          x = Math.max(0, Math.min(x, maxX));
          currentX = x;
          const p = maxX > 0 ? x / maxX : 0;

          thumb.style.transform = `translateY(-50%) translateX(${x}px)`;
          fill.style.width = `${p * 100}%`;

          if (labelNormal) {
            labelNormal.style.opacity = Math.max(0, 1 - p * 2.5).toFixed(2);
          }

          return p;
        }

        // ── Bolle DOM durante il drag ─────────────────────────
        function spawnBubble(x) {
          if (reducedMotion || !trail) return;
          const bubble = document.createElement('span');
          bubble.className = 'swipe-bubble';
          const size = 3 + Math.random() * 5;
          const dur  = (0.6 + Math.random() * 0.6).toFixed(2);
          const yOff = 15 + Math.random() * 70; // % verticale entro pillola
          bubble.style.cssText =
            `width:${size}px;height:${size}px;` +
            `left:${x - size / 2}px;top:${yOff}%;` +
            `--dur:${dur}s;`;
          trail.appendChild(bubble);
          bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
        }

        function bubbleLoop(ts) {
          if (!isDragging) return;
          if (ts - lastBubbleT > 65) {
            lastBubbleT = ts;
            const tsz = parseFloat(getComputedStyle(thumb).width) || 56;
            spawnBubble(6 + tsz + currentX - 4);
          }
          bubbleRAF = requestAnimationFrame(bubbleLoop);
        }

        // ── Effetto tensione ──────────────────────────────────
        function triggerTension() {
          if (tensionFired || reducedMotion) return;
          tensionFired = true;
          btn.classList.add('is-tension');
          btn.addEventListener('animationend', () => btn.classList.remove('is-tension'), { once: true });
        }

        // ══════════════════════════════════════════════════════
        // PARTICELLE CANVAS — Cork Pop burst
        // ══════════════════════════════════════════════════════
        function SAParticle(x, y) {
          const angle = (Math.random() * 260 - 200) * (Math.PI / 180);
          const speed = 1.5 + Math.random() * 5;
          this.x  = x;  this.y = y;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed - 2.5;
          this.r  = 2 + Math.random() * 4;
          this.life  = 1.0;
          this.decay = 0.016 + Math.random() * 0.020;
          // Palette oro/avorio/ambra
          const pal = ['255,215,0', '255,255,210', '255,235,100', '210,165,10'];
          this.color = pal[Math.floor(Math.random() * pal.length)];
        }
        SAParticle.prototype.update = function () {
          this.vy += 0.14;
          this.x  += this.vx;
          this.y  += this.vy;
          this.life -= this.decay;
          this.r   *= 0.984;
        };
        SAParticle.prototype.draw = function (c) {
          c.beginPath();
          c.arc(this.x, this.y, Math.max(0, this.r), 0, Math.PI * 2);
          c.fillStyle = `rgba(${this.color},${this.life.toFixed(2)})`;
          c.fill();
        };

        function spawnBurst(ox, oy) {
          const count = reducedMotion ? 0 : (type === 'cork' ? 60 : 30);
          particles = Array.from({ length: count }, () => new SAParticle(ox, oy));
        }

        function particleLoop() {
          const w = canvas.offsetWidth;
          const h = canvas.offsetHeight;
          ctx.clearRect(0, 0, w, h);
          particles = particles.filter(p => p.life > 0);
          particles.forEach(p => { p.update(); p.draw(ctx); });
          if (particles.length > 0) {
            particleRAF = requestAnimationFrame(particleLoop);
          } else {
            ctx.clearRect(0, 0, w, h);
          }
        }

        // ══════════════════════════════════════════════════════
        // COMPLETAMENTO
        // ══════════════════════════════════════════════════════
        function complete() {
          if (isCompleted) return;
          isCompleted = true;
          isDragging  = false;

          if (bubbleRAF) { cancelAnimationFrame(bubbleRAF); bubbleRAF = null; }
          btn.classList.remove('is-dragging', 'is-tension');
          btn.classList.add('is-complete');

          // Burst particelle
          resizeCanvas();
          const tsz = parseFloat(getComputedStyle(thumb).width) || 56;
          const originX = 6 + tsz + maxX;
          const originY = btn.offsetHeight / 2;
          spawnBurst(originX, originY);
          if (particleRAF) cancelAnimationFrame(particleRAF);
          particleRAF = requestAnimationFrame(particleLoop);

          // Aggiorna ARIA
          btn.setAttribute('aria-label', 'Azione completata, apertura in corso');

          // ── Cork: "eject" thumb fuori destra ─────────────
          if (type === 'cork') {
            thumb.style.transition = 'transform 0.30s cubic-bezier(0.55,0,1,0.45), opacity 0.20s ease 0.10s';
            thumb.style.transform  = `translateY(-50%) translateX(${maxX + 80}px)`;
            thumb.style.opacity    = '0';
          }

          // ── Pour: flash gold border ───────────────────────
          if (type === 'pour') {
            btn.style.boxShadow = '0 0 0 2px rgba(255,215,0,0.55), inset 0 0 28px rgba(255,215,0,0.10)';
          }

          // Redirect dopo 1.5 s
          setTimeout(() => {
            if (actionUrl) window.location.href = actionUrl;
          }, 1500);
        }

        // ── Reset (non usato nel redirect, ma utile per debug) ─
        function reset() {
          isCompleted = false;
          btn.classList.remove('is-complete');
          btn.setAttribute('aria-label', btn.dataset.ariaOriginal || 'Trascina per procedere');
          if (particleRAF) { cancelAnimationFrame(particleRAF); particleRAF = null; }
          ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
          particles = [];
          btn.style.boxShadow = '';
          thumb.style.transition = '';
          thumb.style.opacity    = '1';
          thumb.classList.add('is-returning');
          setThumbX(0);
          fill.style.width = '0%';
          if (labelNormal) labelNormal.style.opacity = '1';
          thumb.addEventListener('transitionend', () => thumb.classList.remove('is-returning'), { once: true });
        }

        // ══════════════════════════════════════════════════════
        // POINTER EVENTS
        // ══════════════════════════════════════════════════════
        function onPointerDown(e) {
          if (isCompleted) return;
          // Solo pulsante sinistro su mouse; touch è sempre valido
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          e.preventDefault();

          isDragging   = true;
          tensionFired = false;
          startX       = e.clientX;

          calcMaxX();
          resizeCanvas();

          btn.classList.add('is-dragging');
          btn.setPointerCapture(e.pointerId);

          if (bubbleRAF) cancelAnimationFrame(bubbleRAF);
          bubbleRAF = requestAnimationFrame(bubbleLoop);
        }

        function onPointerMove(e) {
          if (!isDragging || isCompleted) return;
          e.preventDefault();

          const delta    = e.clientX - startX;
          const progress = setThumbX(currentX + delta);
          startX         = e.clientX;

          // Tensione
          if (progress > tensionAt && !tensionFired) {
            triggerTension();
          }

          // Completamento immediato a 100%
          if (progress >= 0.995) {
            complete();
          }
        }

        function onPointerUp(e) {
          if (!isDragging || isCompleted) return;
          isDragging = false;

          if (bubbleRAF) { cancelAnimationFrame(bubbleRAF); bubbleRAF = null; }
          btn.classList.remove('is-dragging');
          btn.releasePointerCapture(e.pointerId);

          const progress = maxX > 0 ? currentX / maxX : 0;

          if (progress >= snapThreshold) {
            // ── Snap al 100% e completa ──
            thumb.classList.add('is-returning');
            setThumbX(maxX);
            thumb.addEventListener('transitionend', () => {
              thumb.classList.remove('is-returning');
              complete();
            }, { once: true });
            // Fallback: se transitionend non scatta (es. reduced-motion)
            setTimeout(() => { if (!isCompleted) complete(); }, 600);
          } else {
            // ── Spring-back elastico ──
            thumb.classList.add('is-returning');
            setThumbX(0);
            fill.style.width = '0%';
            if (labelNormal) labelNormal.style.opacity = '1';
            thumb.addEventListener('transitionend', () => thumb.classList.remove('is-returning'), { once: true });
            tensionFired = false;
          }
        }

        // ── Keyboard accessibility ──────────────────────────
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isCompleted) {
              calcMaxX();
              resizeCanvas();
              setThumbX(maxX);
              if (reducedMotion) {
                // Salta animazione, esegui azione subito
                complete();
              } else {
                thumb.classList.add('is-returning');
                setTimeout(complete, 120);
              }
            }
          }
        });

        // ── Registra Pointer Events ─────────────────────────
        btn.addEventListener('pointerdown',   onPointerDown,  { passive: false });
        btn.addEventListener('pointermove',   onPointerMove,  { passive: false });
        btn.addEventListener('pointerup',     onPointerUp);
        btn.addEventListener('pointercancel', onPointerUp);

        // ── Resize ─────────────────────────────────────────
        window.addEventListener('resize', () => {
          if (!isCompleted) { calcMaxX(); resizeCanvas(); }
        }, { passive: true });

        // ── Init ───────────────────────────────────────────
        calcMaxX();
        resizeCanvas();

      } // fine createSwipeAction

      // ══════════════════════════════════════════════════════
      // INIZIALIZZAZIONE ISTANZE
      // ══════════════════════════════════════════════════════

      // 1. Cork Pop — "Partecipa a un Evento" (index.html → contatti.html)
      createSwipeAction({
        btnId:     'sa-eventi',
        type:      'cork',
        actionUrl: './contatti.html',
      });

      // 2. Wine Pour — "Prenota la Degustazione" (index.html → contatti.html)
      createSwipeAction({
        btnId:     'sa-degustazione',
        type:      'pour',
        actionUrl: './contatti.html',
      });

      // 3. Cork Pop — "Chiedi un Consiglio" (index.html #advisory → contatti.html)
      createSwipeAction({
        btnId:     'sa-advisory',
        type:      'cork',
        actionUrl: './contatti.html',
      });

      // 4. Cork Pop — "Chiedi un Consiglio" (chi-siamo.html → contatti.html)
      createSwipeAction({
        btnId:     'sa-chisiamo-consiglio',
        type:      'cork',
        actionUrl: './contatti.html',
      });

    })(); // fine initSwipeActions