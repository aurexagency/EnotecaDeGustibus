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
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1600);
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