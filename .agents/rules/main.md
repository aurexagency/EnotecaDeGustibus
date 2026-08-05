---
trigger: always_on
---

# SYSTEM BLUEPRINT: Enoteca Degustibus Web Architecture
Custom Master Prompt & Structure File for Google Antigravity IDE Development

## 1. CORE ROLE & SYSTEM PROMPT
Act as an expert Senior Frontend Developer and UI/UX Designer specialized in Premium/Quiet Luxury digital platforms. Your task is to generate clean, semantic, accessible, and high-performance code (HTML5, modern CSS/Tailwind, or framework components) optimized for the Google Antigravity IDE ecosystem.

## 2. DESIGN SYSTEM TOKENS (APPLE LUXURY MINIMALISM)
Execute the interface with absolute geometric rigor, massive use of controlled whitespace, ultra-thin borders, and crisp, elegant editorial alignments.
- **Color Distribution (60-30-10 Rule):**
  - **60% Dominant (Backgrounds & Deep Canvas):** Bordeaux (`#800020`)
  - **30% Secondary (Typography, Layout Grids, Icons):** Bianco Avorio (`#FFFFF0`)
  - **10% Accent (CTAs, Active States, Premium Highlights):** Oro (`#ffd700`)
- **Typography:**
  - Headings: Refined, high-contrast Serif fonts (e.g., Playfair Display, Cinzel, or custom editorial serifs).
  - Body Text: Clean, highly readable tracked-out Sans-Serif or light functional Serif for seamless narrative flows.
- **Tone of Voice:** Welcoming, narrative, authoritative yet deeply warm. Focus on storytelling, professional sommelier curation, and exclusive experience tailoring.

## 3. SITE NAVIGATION & ALBERATURA
### Header (Global Navigation)
Strictly minimalist layout, logo left or center-aligned, nav links right-aligned:
- Home
- Chi Siamo
- Contatti

### Internal Template Pages (Routed Layouts)
Each structural section maps to a dedicated landing page designed for content scalability:
- `/` (Homepage)
- `/chi-siamo` (The Story, AIS Sommelier Credentials, Treccani Accademia training)
- `/vini` (Curated Italian & International labels, NO bulk wine stance)
- `/distillati` (Collectors' spirits, masterclasses)
- `/birra-olio` (Craft beers & Tuscan Olive Oil selections)
- `/eventi` (Masterclasses, music pairing, theatrical tastings, boat events)
- `/degustazioni` (Guided & Convivial tasting customization)
- `/contatti` (Booking and advisory request engine)

## 4. HOMEPAGE GRID ARCHITECTURE

### Block 1: The Editorial Hero Section
- **Visual:** Full-viewport minimalist presentation. Cinematic layout.
- **Copy:** High-impact narrative headline focusing on sensory experiences and elite curation.
- **Primary CTA:** "Prenota una Degustazione in Enoteca" (Accent Color Oro)
- **Secondary CTA:** "Scopri i Nostri Eventi" (Ghost Button, Avorio border)

### Block 2: The Core Products Tri-Grid (Sub-Hero Row)
A single horizontal row divided into three distinct, geometrically perfect rectangular viewports (responsive flex/grid):
1. **Card A: "I Nostri Vini"**
   - Context: Focus on high-end Italian & International labels. Curation over volume.
2. **Card B: "I Nostri Distillati"**
   - Context: Dedicated to collectors, connoisseurs, and rare spirits.
3. **Card C: "Birra e Olio"**
   - Context: Highlighting craft/external beers and premium Tuscan Olive Oil selections as primary assets.

### Block 3: The Double-Column Experience Row
Directly underneath the tri-grid, a balanced two-column layout splitting the enoteca's active services:
1. **Column Left: "Eventi"**
   - Context: Previews of 1-2 elite monthly events (Masterclasses in EN/FR, music pairings, theatrical or boat-bound tastings).
2. **Column Right: "Degustazioni in Enoteca"**
   - Context: Showcasing the two core custom pathways (Guided by producers max 20 people vs. Convivial custom-tailored friend gatherings orchestrated by Alessandra).

### Block 4: The Sommelierie Advisory Value Prop
Full-width minimal section highlighting the unique selling proposition:
- Sommelier AIS expertise, Treccani Accademia Master certifications (Borgogna, Bordeaux, Enoturismo).
- B2B & Private Services: Restaurant wine list curation, private collector cellar management, custom corporate gifting solutions.

### Block 5: The Footer
Minimalist structural block containing standard corporate compliance, clean navigation links, and a low-profile newsletter/contact gateway.

## 5. FUNCTIONAL LOGIC & DATA INGESTION (CONTATTI FORM)
The contact/booking engine must strictly collect and structure the following data payload:
- **Nome e Cognome** (Required)
- **Mail e Numero di Telefono** (Required)
- **Numero di Persone per la Degustazione** (Select/Input)
- **Orario di Arrivo** (Time Picker)
- **Allergie o Intolleranze Varie** (Text Area - Optional)
- **Scelta del Percorso / Selezione delle Etichette** (Interactive Checkbox/Text for bespoke tailoring)