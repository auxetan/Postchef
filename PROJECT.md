# PostChef — Document de référence projet

## Vision
PostChef est un SaaS web PWA destiné aux restaurants indépendants qui ne savent pas quoi poster sur les réseaux sociaux. L'app génère un calendrier de contenu personnalisé, des idées de posts avec hooks IA, des briefs visuels, et une veille tendances locale — le tout en 3 minutes après onboarding.

**Tagline** : "Ton resto mérite d'être vu."

---

## Cible
- Restaurants indépendants (pas les chaînes)
- Gérants ou managers qui gèrent seuls leurs réseaux
- Pas de community manager, pas de budget pub
- Marché prioritaire : Aix-en-Provence + Marseille (beta), puis national

---

## Problème résolu
Les restaurateurs n'ont ni le temps, ni les idées, ni les compétences pour poster régulièrement sur TikTok et Instagram. Résultat : profils inactifs, visibilité nulle, clients qui choisissent le voisin.

---

## Produit

### Mascotte IA
**Chef** — pas un humain, mais un expert contenu. Ton de voix : direct, pro, bienveillant. Jamais condescendant.

### Flow onboarding (8 étapes)
1. Accueil avec Chef + promesse
2. Infos restaurant (nom, ville, type de cuisine, spécialité)
3. Clientèle (profil + tranche de quantité : 20–50 couverts/j, etc.)
4. Préférences contenu (plateformes, fréquence/semaine)
5. Social proof + graphique CA vs fréquence de posts
6. Génération du plan (loading animé avec checklist)
7. Notifications push
8. Paywall

### Features MVP (V1)
- Calendrier éditorial hebdo (drag & drop, statuts, multi-plateforme)
- Idées IA quotidiennes (hooks, formats, scripts courts)
- Briefs visuels (angle, lumière, mise en scène)
- Légendes générées prêtes à copier
- Veille tendances locale (hashtags, événements, sons TikTok)
- Analytics simple (vues estimées, meilleurs horaires)
- Notifications push hebdo
- Widget mobile (écran d'accueil)

### Pas dans le MVP (V2+)
- Publication automatique (risque API + complexité)
- Multi-utilisateurs / gestion équipe
- Export PDF (V2 — à garder sous le coude)
- App mobile native

---

## Direction Artistique (DA)

### Références
- Trading 212 / Trading Republic (finance moderne, bold, confiance)
- Duolingo (onboarding gamifié, mascotte, progression)
- Revolut (minimalisme premium, typo forte, aéré)
- AlphaTest (flow questions/réponses avec avatar)

### Palette
| Token | Hex | Usage |
|---|---|---|
| `--pc-green` | #1D9E75 | CTA primaire, accents, highlights |
| `--pc-green-dark` | #0F6E56 | Hover, cards foncées |
| `--pc-green-mid` | #5DCAA5 | Secondaire, avatars |
| `--pc-green-light` | #E1F5EE | Backgrounds, badges, chips sélectés |
| `--pc-text` | #0a0a0a | Titres, texte principal |
| `--pc-muted` | #6b7280 | Sous-titres, descriptions |
| `--pc-border` | #e5e7eb | Borders, séparateurs |
| `--pc-bg` | #f9fafb | Background général |
| `--pc-white` | #ffffff | Cards, surfaces |

### Typographie
- Font : Inter (Google Fonts) ou system-ui
- Titres : 700–900, letter-spacing négatif (-0.5px à -1.5px)
- Body : 400–500, line-height 1.6–1.7
- Labels/caps : 600, uppercase, letter-spacing +0.08em

### Composants clés
- Border-radius : 20px (cards), 16px (éléments), 100px (pills/boutons)
- Bouton primaire : background #1D9E75, color white, radius 100px, padding 14–16px, font-weight 700
- Bouton ghost : background white, border 1.5px #e5e7eb, radius 100px
- Chips sélectables : radius 100px, selected = bg #1D9E75 text white
- Cards : background white, border 1px #f3f4f6, radius 20px, aucun shadow

### Ce qu'on évite
- Gradients décoratifs
- Shadows lourds (box-shadow complexes)
- Dark patterns (faux comptes à rebours, urgence artificielle)
- Trop de couleurs (max 2 ramps)
- Onboarding > 8 étapes

---

## Stack technique

### Frontend
- **React 18** + **Vite**
- **TailwindCSS** (classes utilitaires, config custom avec tokens PostChef)
- **Framer Motion** (animations onboarding, transitions)
- **React Router v6** (navigation multi-pages)
- **Zustand** (state management onboarding + user)

### Backend
- **Node.js** + **Express**
- **Clerk** (authentification, social login Google)
- **Stripe** (abonnements, billing)

### IA
- **Claude API** (Anthropic) — génération idées, hooks, légendes, briefs
- Prompts système segmentés par type de restaurant + plateforme

### Base de données
- **Supabase** (PostgreSQL hébergé, auth secondaire, storage)
- **Cloudinary** (médias uploadés)

### PWA
- Service Worker (offline, cache)
- Web App Manifest (installable sur mobile)
- Push Notifications (Web Push API)

---

## Modèle économique

| Plan | Prix | Inclus |
|---|---|---|
| Starter | Gratuit | 7 jours · 1 plateforme · 5 idées/sem |
| Pro Mensuel | 29€/mois | Tout · sans engagement |
| Pro Annuel | 19€/mois (228€/an) | Tout · -35% · mis en avant |

**Objectif 3 mois** : 20 clients payants à Aix/Marseille = ~400–580€ MRR
**Acquisition** : démarchage direct restaurants locaux + démo live

---

## Roadmap 3 mois

| Période | Livrable |
|---|---|
| Sem 1–2 | Onboarding complet + Auth (Clerk) |
| Sem 3–4 | Dashboard + Calendrier éditorial |
| Sem 5–6 | Intégration Claude API (idées + hooks + légendes) |
| Sem 7–8 | Paywall + Stripe (abonnements) |
| Sem 9–10 | PWA + Notifications push + Widget mobile |
| Sem 11–12 | Polish UI + Beta Aix-en-Provence |

---

## Structure du projet

```
PostChef/
├── docs/
│   ├── PROJECT.md          ← ce fichier
│   └── DA.md               ← guide DA détaillé
├── design/
│   └── mockups/            ← exports des écrans
└── src/
    ├── components/         ← composants réutilisables
    ├── pages/              ← écrans (Onboarding, Dashboard, etc.)
    ├── hooks/              ← hooks custom
    ├── utils/              ← helpers, prompts Claude
    └── assets/             ← fonts, icônes, illustrations
```

---

*Dernière mise à jour : avril 2026*
