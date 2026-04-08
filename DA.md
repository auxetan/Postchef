# PostChef — Direction Artistique v2.0

> *Mise à jour : avril 2026 — Post-redesign "Bold Editorial"*

---

## Philosophie design

**Bold. Editorial. Humain.**

PostChef ne ressemble pas à un outil IA générique. Il ressemble à un magazine food premium qui t'aide à travailler. Confiant, lisible, sans décoration superflue. La typographie EST le design — pas les dégradés, pas les blobs, pas les gradients iridescents.

Référence mentale : *"Si un chef étoilé concevait un outil SaaS pour ses collègues."*

### Ce qu'on était (v1)
Pills partout, vert dominant, cards avec shadows, boutons ronds → aspect SaaS générique, trop IA, trop Notion-clone.

### Ce qu'on est maintenant (v2)
Fond chaud papier, ink scale, typographie heavy comme design, vert chirurgical, boutons nets et carrés → editorial food magazine meets productivity tool.

---

## Palette

### Fond & surfaces — warm neutrals (pas blue-grey)
```css
--pc-bg:      #F7F7F5  /* Fond page — chaud, papier, pas SaaS */
--pc-surface: #FFFFFF  /* Cards, headers */
--pc-rule:    #EFEFED  /* Séparateurs très légers */
--pc-divider: #F2F2F0  /* Sections internes */
```

### Ink scale — pas de greys froids
```css
--pc-ink:   #0A0A0A  /* Titres, gros texte */
--pc-ink-2: #404040  /* Corps principal */
--pc-ink-3: #737373  /* Secondaire, descriptions */
--pc-ink-4: #A3A3A3  /* Hints, labels, timestamps */
```

### Borders — warm tone
```css
--pc-border: #E8E8E6  /* Cards, inputs, separateurs */
```

### Vert — signature, utilisé CHIRURGICALEMENT
```css
--pc-green:       #1D9E75  /* CTA unique, pip actif, lien accent */
--pc-green-dark:  #0F6E56  /* Hover états verts */
--pc-green-light: #EBF9F2  /* Tint très léger, badges */
```

### États sémantiques
```css
--warning: #F59E0B
--error:   #EF4444
--success: #1D9E75  (= pc-green)
```

---

## Typographie

### Police
**Inter** — variable font, tous les poids. Fallback : system-ui.
Activer : `font-feature-settings: 'ss01' 1, 'cv01' 1` (alternates Inter).

### Échelle (règles strictes)

| Rôle | Size | Weight | Tracking | Couleur |
|---|---|---|---|---|
| Page title | 26px | 900 (Black) | -0.04em | pc-ink |
| Section stat | 48px | 900 (Black) | -0.05em | pc-ink |
| Card title | 15px | 700 (Bold) | -0.01em | pc-ink |
| Corps | 13–14px | 400 (Regular) | 0 | pc-ink-2 |
| Secondaire | 12–13px | 500 | 0 | pc-ink-3 |
| **Section label** | **10px** | **700** | **+0.10em** | **pc-ink-4** |
| Micro | 9–10px | 600 | +0.04em | pc-ink-4 |

### Règle d'or : le Section Label
```
SECTION LABEL ──────────────────────
```
Pattern systématique : `10px / 700 / UPPERCASE / tracking 0.10em / couleur pc-ink-4 / suivi d'une ligne #EFEFED`.
C'est la **signature éditoriale PostChef** — chaque section majeure l'utilise.

### Règles absolues
- Titres : JAMAIS Title Case → sentence case
- ALL CAPS uniquement pour les labels 10px
- Line-height corps : 1.6–1.65
- Line-height titres : 1.0–1.15
- Nunca < 11px en production

---

## Espacement & Layout

### Padding page
- Mobile : `px-6` (24px) — plus généreux que v1 (20px)
- Header : `pt-7 pb-5` (top lourd pour respiration)
- Desktop : `max-w-2xl mx-auto` centré dans `lg:ml-[220px]`

### Rythme vertical
- Entre sections majeures : `space-y-8` (32px)
- Entre éléments dans section : `space-y-2` (8px)
- Gap grid : `gap-2` ou `gap-3`

### Border radius (v2 — abandonne les pills généralisées)
| Composant | Radius |
|---|---|
| Page card | 16px (`rounded-card`) |
| Élément interactif | 12px (`rounded-elem`) |
| Bouton | 10px (`rounded-btn`) |
| Input | 10px (`rounded-btn`) |
| Badge/tag | 6px |
| Pill (exception) | 100px — UNIQUEMENT pour chips de filtre, jamais pour boutons CTA |

---

## Composants

### Bouton primaire (noir)
```css
background: #0A0A0A;
color: white;
border-radius: 10px;
padding: 10px 16px;
font-size: 13px;
font-weight: 700;
/* hover */ background: #404040;
```
Usage : Save, Confirmer, actions secondaires importantes.

### Bouton CTA vert (exceptionnel)
```css
background: #1D9E75;
color: white;
border-radius: 10px;
/* hover */ background: #0F6E56;
```
Usage : UNIQUEMENT "Générer", "Planifier", onboarding CTA principal.
**Maximum 1 bouton vert visible à l'écran.**

### Bouton outline (tertiary)
```css
background: #F7F7F5;
border: 1px solid #E8E8E6;
color: #404040;
border-radius: 10px;
/* hover */ border-color: #0A0A0A; color: #0A0A0A;
```

### Card standard
```css
background: white;
border: 1px solid #E8E8E6;
border-radius: 16px;
padding: 20px;
/* PAS de box-shadow jamais */
```

### Card hero (fond noir)
```css
background: #0A0A0A;
border-radius: 16px;
padding: 20px;
color: white;
```
Usage : idée IA en vedette sur Dashboard, CTA fort.

### Section label + rule pattern
```jsx
<div className="flex items-center gap-3 mb-4">
  <span className="pc-section-label">{label}</span>
  <div className="flex-1 h-px bg-pc-rule" />
</div>
```

### Liste de rows (tableau éditorial)
```css
/* Container */
border: 1px solid #E8E8E6;
border-radius: 16px;
overflow: hidden;

/* Rows */
divide-y divide-pc-rule;
px-5 py-[14px];
hover: bg-pc-bg;
```
→ Remplacement des cards multiples — plus éditorial, plus dense, plus lisible.

### Status indicator
Pas de badge pill — un dot coloré 6–7px :
```css
.dot-idee:      background: #D4D4D4
.dot-a-tourner: background: #F59E0B
.dot-publie:    background: #1D9E75
```

### Tabs (navigation secondaire)
Underline style uniquement :
```css
/* Active */ border-bottom: 2px solid #0A0A0A; color: #0A0A0A;
/* Inactive */ border-bottom: 2px solid transparent; color: #A3A3A3;
/* Green variant (formats) */ border-bottom: 2px solid #1D9E75;
```
Jamais de background sur les tabs.

### Filtres / chips
Underline tab style (pas de pills en background) pour les filtres texte.
Pills acceptées uniquement pour les badges plateforme (Instagram/TikTok) dans les cards.

---

## Iconographie

- **Stroke width** : 1.75px (plus fin que v1 — 1.8px)
- **Viewbox** : 16×16 standardisé
- **Style** : outline only, strokeLinecap="round"
- **Taille** : 16px sidebar, 20px bottomNav, 14–16px dans cards

---

## Navigation

### Sidebar desktop (220px)
- Fond : white, border-right 1px #E8E8E6
- Logo : 18px / Black / tracking -0.04em
- Nav item active : fond `#F7F7F5` + pip vert 3px à gauche + icon vert
- Nav item inactif : text pc-ink-4, hover text pc-ink-2 + fond #F7F7F5
- Plan badge en bas : text seulement, couleur dynamique par plan
- **PAS de fond coloré sur l'item actif** — juste la couleur du texte + pip

### BottomNav mobile
- Fond : white, border-top 1px #E8E8E6
- Active : icon + label en pc-green
- Inactif : icon + label en pc-ink-4
- Safe-area-inset-bottom gérée

---

## Écrans / Pages

### Headers de page (sticky)
```
bg-white | border-b | px-6 pt-7 pb-5
Titre 26px Black -0.04em
Sous-titre 12px ink-4 (date, nom resto, etc.)
```

### Dashboard
- Titre = nom du restaurant (26px Black)
- Métriques : 48px Black, tabular-nums
- Post list : row table avec dot statut
- Idée hero : card noire (fond #0A0A0A)
- Idée secondaire : card blanche classique

### Idées IA
- Filtres : underline tabs
- IdeaCard : badge plateforme en haut, hook 15px Bold au centre
- Actions : "Brief" = outline btn noir, "Planifier" = vert
- Brief étendu : fond #FAFAF9, labels 10px caps

### Analytics
- KPI : 36px Black, tabular-nums
- Graphe barres : max bar = #0A0A0A, autres = #E8E8E6
- Heatmap : opacity unique couleur vert (rgba green, 0.12→1.0)
- Top posts : row table avec numéro bold à gauche

### Compte
- Sections séparées par Rules, pas de cards imbriquées
- Plan switcher : active = bg coloré (noir/bleu/vert selon plan)
- Form inputs : bg #F7F7F5, focus border #0A0A0A

---

## Règles absolues — NE JAMAIS ENFREINDRE

1. **Fond** : toujours `#F7F7F5` (jamais #f9fafb, jamais blanc pur)
2. **Vert** : maximum 1 bouton vert par écran. Pip actif = vert. Liens accent = vert. C'est tout.
3. **Shadows** : ZÉRO. Pas de box-shadow sur les cards. Jamais.
4. **Gradients** : ZÉRO décoratif. La card hero noire est l'unique exception (fond plein #0A0A0A).
5. **Pills** : uniquement pour les filtres actifs et badges plateforme. JAMAIS pour les boutons CTA.
6. **Taille mini** : 11px. Jamais en dessous.
7. **Contraste** : WCAG AA (4.5:1) minimum sur tout texte.
8. **Section label** : pattern systématique sur chaque section majeure.
9. **Onboarding** : ce composant conserve les pills et le vert dominant (c'est intentionnel — ton différent de l'app).

---

## Ton de voix

**Chef** — la mascotte IA.
- Expert, direct, bienveillant. Pro du contenu, pas techno-geek.
- Jamais condescendant, jamais familier excessif.
- Formules : courtes, actionnables, résultat visible.

| Contexte | Formulation |
|---|---|
| Accueil | "Bonjour, je suis Chef. En 5 questions, je construis ton calendrier de posts." |
| Loading | "J'analyse ton profil restaurant…" |
| Succès | "Idées générées. Voilà ta semaine." |
| Erreur | "Quelque chose n'a pas fonctionné. Réessaie." |
| Quota | "5 idées utilisées cette semaine. Réinitialisation lundi." |

---

*PostChef DA Guide v2.0 — Bold Editorial — avril 2026*
