---
trigger: always_on
---

# REGOLA ANIMAZIONI: Cinematic & Reduced Motion

1.  **Stile dell'Animazione**: Le animazioni devono essere "Cinematiche". Solo fade-in lenti, micro-interazioni sui bottoni (es. hover dell'accento Oro) e transizioni di pagina fluide. Nessun effetto "bounce", "zoom" eccessivo o movimenti frenetici.
2.  **Accessibilità del Movimento**: TUTTE le animazioni devono essere racchiuse in una media query `@media (prefers-reduced-motion: reduce)`. Se l'utente preferisce non avere animazioni, l'interfaccia deve disabilitarle istantaneamente ricorrendo a transizioni di stato dirette.