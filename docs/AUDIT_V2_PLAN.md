# PostChef — Audit V1 & Plan d'attaque V2

> **Date de l'audit :** 2026-04-14
> **Scope :** Diagnostic complet du code existant + roadmap V2 + megaprompt pour IA exécutante
> **Objectif produit V2 :** Permettre au restaurateur de publier sur les réseaux sociaux avec le **minimum de friction** — de l'idée à la publication, en un tap.

---

## TABLE DES MATIÈRES

1. [Audit complet de la V1](#1-audit-complet-de-la-v1)
2. [Code mort et dette technique](#2-code-mort-et-dette-technique)
3. [État réel des fonctionnalités](#3-état-réel-des-fonctionnalités)
4. [Problèmes UX majeurs](#4-problèmes-ux-majeurs)
5. [Plan d'attaque V2 — Phases 0 à 5](#5-plan-dattaque-v2--phases-0-à-5)
6. [Stack technique recommandée](#6-stack-technique-recommandée)
7. [Megaprompt IA — Instructions d'exécution](#7-megaprompt-ia--instructions-dexécution)

---

## 1. AUDIT COMPLET DE LA V1

### 1.1 Bugs critiques (à corriger IMMÉDIATEMENT)

| ID | Fichier | Bug | Impact |
|----|---------|-----|--------|
| **B1** | `src/pages/Calendar.jsx:77-83` | Les posts stockés avec `day: "Lundi"` sont mappés au lundi de la semaine courante. En naviguant sur un autre mois, les posts apparaissent au mauvais endroit. | Posts mal placés dans le calendrier |
| **B2** | `src/pages/Account.jsx:266` | `setPlan()` met à jour Zustand localement mais ne déclenche aucun paiement ni validation backend. Un utilisateur peut changer son plan en JS (DevTools). | **Faille de sécurité** — contournement total du paywall |
| **B3** | `src/pages/Account.jsx:131` | `deleteAccount()` appelle `signOut()` + reset state mais ne supprime jamais les données Supabase (`profiles`, `restaurants`, `app_state`). | **Non-conformité RGPD** |
| **B4** | `src/services/supabaseWorkspace.js` | Les 3 upserts (profiles, restaurants, app_state) sont exécutés en `Promise.all()`. Si un échoue, les autres sont déjà committés. | État incohérent possible en BDD |

### 1.2 Bugs importants

| ID | Fichier | Bug | Impact |
|----|---------|-----|--------|
| **B5** | `src/pages/AiChat.jsx` | L'historique de conversation est en `useState` local — perdu au refresh. | Mauvaise UX pour feature Premium à 99€/mois |
| **B6** | `src/pages/AiChat.jsx:8-17` | Rate-limit DALL-E (3/h) uniquement côté client — bypass facile en rafraîchissant la page. | Coûts API non contrôlés |
| **B7** | `src/hooks/useShotstack.js` | Polling toutes les 4s sans timeout. Si Shotstack plante, le polling continue indéfiniment. | Memory leak + UX bloquée |
| **B8** | `src/pages/Ideas.jsx:154` | Parsing JSON fragile : assume des code blocks markdown, mais l'API peut renvoyer du JSON brut. | Crash silencieux, fallback mock |
| **B9** | `src/pages/Ideas.jsx:157` | Sur TOUTE erreur (réseau, parsing, quota), fallback sur `mockIdeas` sans distinguer la cause. | L'utilisateur croit avoir ses vraies idées générées |

### 1.3 Bugs mineurs

| ID | Fichier | Bug |
|----|---------|-----|
| **B10** | `src/pages/Trends.jsx` | Typos multiples : "Idee" au lieu de "Idée", "Reinitialiser", "Evenements" |
| **B11** | `src/pages/Dashboard.jsx` | "Pref à publier" au lieu de "Prêt à publier" (typo statut) |
| **B12** | `src/pages/Analytics.jsx:61` | Calcul weekly : `const idx = 6 - diff` peut produire un index négatif si posts datés dans le futur |
| **B13** | `src/context/AuthContext.jsx` | Erreurs de save workspace loguées en console uniquement — pas de toast utilisateur |

---

## 2. CODE MORT ET DETTE TECHNIQUE

| Fichier | Problème | Action |
|---------|----------|--------|
| `src/utils/demoMode.js` | `DEMO_MODE` jamais importé, `isDemo()` jamais appelé | **Supprimer** |
| `src/utils/mockData.js` | `mockPosts` exporté mais jamais importé | Supprimer l'export |
| `src/pages/Dashboard.jsx` | `itemVariants` (Framer Motion) défini mais tous les enfants utilisent la même variante | Simplifier |
| Partout | Couleurs hardcodées (`#2563eb`, `#F59E0B`, `#A3A3A3`) au lieu des design tokens Tailwind | Migrer vers tokens `pc-*` |
| Partout | Terminologie incohérente : "Quota épuisé" vs "Quota atteint", statuts avec couleurs différentes entre pages | Unifier dans un dictionnaire |

---

## 3. ÉTAT RÉEL DES FONCTIONNALITÉS

### 3.1 Fonctionnalités RÉELLES (connectées à des APIs)

| Feature | API | État |
|---------|-----|------|
| Auth + sync workspace | Supabase | Fonctionne, mode démo en fallback |
| Génération d'idées | Claude Haiku | Fonctionne, prompt caching actif |
| Scripts vidéo | Claude | Fonctionne |
| Captions / légendes | Claude | Fonctionne |
| Photo de plat | DALL-E 3 | Fonctionne |
| Analyse viralité (vision) | Claude Vision | Fonctionne, multi-frame |
| Transcription audio | Whisper | Fonctionne |
| Rendu vidéo | Shotstack | Fonctionne (polling sans timeout) |
| Stock footage | Pexels | Fonctionne |
| Restaurant Brain | SerpAPI | Fonctionne, mais 250 req/mois max |
| Chef IA (tool-calling) | Claude + DALL-E | Fonctionne, Premium only |

### 3.2 Fonctionnalités SIMULÉES / INCOMPLÈTES

| Feature | État | Problème |
|---------|------|----------|
| Analytics réseaux sociaux | **100% mock** | Heatmap hardcodée, recommandations génériques, stats inventées |
| Trends / Sons trending | **100% mock** | Données statiques, pas de scraping live, typos |
| Connexion Instagram/TikTok/Facebook | Boutons désactivés | **Aucune intégration** API réseaux sociaux |
| Publication sur réseaux | **Inexistant** | Aucune possibilité de poster depuis l'app |
| Programmation de posts | Calendrier local seulement | Pas de scheduler réel, pas de file d'attente |
| Paiement / Stripe | **Inexistant** | Plan changeable librement côté client |
| Hashtags | Génération client-side | Algorithme basique, pas d'IA, pas de trending data |
| Notifications push | Permission demandée | Aucun Service Worker pour envoyer des notifs |
| Export vidéo | Shotstack rendu | Pas de téléchargement direct, pas de partage |

---

## 4. PROBLÈMES UX MAJEURS

1. **Paywall incohérent** : Studio bloque tout pour Starter, Ideas montre des features partielles, AiChat affiche un paywall — **3 patterns différents**.
2. **Pas de publication réelle** : L'app crée du contenu mais ne peut pas le publier — **c'est le gap critique**.
3. **Données simulées mélangées aux vraies** : Analytics mélange stats réelles PostChef et stats mock réseaux sociaux sans séparation claire.
4. **Calendrier = to-do list** : Sans publication automatique, le calendrier n'est qu'une liste de tâches glorifiée.
5. **Pas de guidance filmage intégrée** : `FilmingMode.jsx` existe mais n'est pas intégré dans un flow clair "je veux filmer maintenant".
6. **Montage automatique partiel** : Le rendu Shotstack fonctionne mais le flow clip → analyse → montage est complexe et peu guidé.

---

## 5. PLAN D'ATTAQUE V2 — PHASES 0 À 5

### Vision produit V2

> *Un restaurateur filme un plat avec son téléphone. PostChef s'occupe du reste : montage, sous-titres, légende, hashtags, et publication sur tous ses réseaux — en un tap.*

### Priorisation résumée

```
Phase 0  [Semaine 1]       Corrections critiques
Phase 1  [Semaines 2-5]    Publication réseaux sociaux        ← GAME CHANGER
Phase 2  [Semaines 5-7]    Montage automatique                ← DIFFÉRENCIATEUR
Phase 3  [Semaines 7-9]    Guidance filmage + idées
Phase 4  [Semaines 9-11]   Analytics réelles
Phase 5  [Semaines 11-13]  Monétisation + scaling
```

---

### PHASE 0 — Corrections critiques (1 semaine)

**Objectif :** Stabiliser la V1 avant de construire dessus.

| Tâche | Détail | Fichier principal |
|-------|--------|-------------------|
| Fix B1 — Calendrier dates | Stocker les posts en ISO date (`2026-04-14`), pas en `day: "Lundi"`. Migrer les posts existants. | `src/pages/Calendar.jsx`, `src/store/useAppStore.js` |
| Fix B2 — Sécuriser les plans | Valider le plan côté serveur (Supabase RLS + vérification API). Bloquer `setPlan` client-side, route API dédiée. | `src/pages/Account.jsx`, `api/plan.js` (nouveau) |
| Fix B3 — Suppression compte | Implémenter DELETE réel sur les 3 tables Supabase + auth.users via service role. | `api/delete-account.js` (nouveau) |
| Fix B4 — Transaction workspace | Upserts séquentiels avec rollback ou Postgres function atomique. | `src/services/supabaseWorkspace.js` |
| Fix B7 — Timeout polling | Ajouter timeout de 10 min + AbortController sur polling Shotstack. | `src/hooks/useShotstack.js` |
| Fix B8-B9 — Parsing & erreurs Ideas | JSON parsing robuste (avec/sans code blocks) + toast distinguant erreur réseau / quota / parsing. | `src/pages/Ideas.jsx` |
| Fix typos B10-B11 | Corriger toutes les fautes d'accents dans Trends, Dashboard. | Recherche globale |
| Nettoyer code mort | Supprimer `demoMode.js`, `mockPosts`. | `src/utils/` |
| Unifier design tokens | Remplacer toutes les couleurs hardcodées par les tokens `pc-*`. | Grep global `#[0-9A-F]{6}` |

---

### PHASE 1 — Publication réelle sur les réseaux (3-4 semaines)

**Objectif :** Le restaurateur peut publier depuis PostChef. **C'est LA feature manquante.**

#### Approche recommandée : API unifiée Ayrshare

Plutôt que d'intégrer Instagram Graph API + TikTok Content API + Facebook Graph API séparément (6-8 semaines, audit TikTok obligatoire, app review Meta), utiliser **Ayrshare** (~60€/mois) qui couvre 15+ plateformes en une seule intégration.

**Alternative gratuite :** self-host Postiz (14k stars GitHub, Next.js) mais maintenance infra.

| Étape | Détail | Livrables |
|-------|--------|-----------|
| 1.1 — Connexion comptes | OAuth flow via Ayrshare pour lier Instagram, TikTok, Facebook | `src/pages/ConnectSocials.jsx`, `api/ayrshare/connect.js` |
| 1.2 — Publication directe | Bouton "Publier" sur chaque post du calendrier → envoi via API | `api/ayrshare/publish.js`, modif `Calendar.jsx` |
| 1.3 — Programmation | Scheduler : choisir date + heure → Ayrshare programme le post | Table `scheduled_posts` Supabase |
| 1.4 — Horaires optimaux | Suggérer les meilleurs créneaux (données 2026 : Mar-Jeu 10-11h ou 14-18h food) | `src/components/features/OptimalTimeSuggest.jsx` |
| 1.5 — Adaptation multi-plateforme | Ratio 9:16 (Reels/TikTok), 1:1 (Feed), texte tronqué par plateforme | `src/utils/platformAdapters.js` |
| 1.6 — Statut de publication | Mise à jour post.status : `scheduled` → `publishing` → `published`/`failed` | Webhook Ayrshare + Supabase |

**Inspiration code :** étudier l'architecture scheduling/publication de [Postiz](https://github.com/gitroomhq/postiz-app) (TypeScript/Next.js, 14k stars).

---

### PHASE 2 — Montage automatique intelligent (2-3 semaines)

**Objectif :** Le restaurateur filme, l'app monte. **Zéro compétence technique requise.**

| Étape | Détail | Livrables |
|-------|--------|-----------|
| 2.1 — Flow simplifié | Nouveau flow : "Filmer" → upload → choix de template → rendu auto | Refonte `src/pages/Studio.jsx` |
| 2.2 — Templates restaurant | 5 templates pré-configurés : Recette rapide (15s), Plat signature (30s), Coulisses cuisine (20s), Avis client (15s), Menu du jour (10s) | `src/utils/shotstackTemplates.js` |
| 2.3 — Auto-sous-titres | Whisper → overlay texte animé automatique (déjà partiel, finaliser) | Amélioration `useShotstack.js` |
| 2.4 — Auto-musique | Sélection automatique de musique libre de droits selon le mood détecté par Claude | Intégration Epidemic Sound / Uppbeat API |
| 2.5 — B-roll automatique | Claude analyse le clip → suggère B-roll → insertion auto depuis Pexels | Amélioration `BRollSlots.jsx` |
| 2.6 — Export & partage | Télécharger le reel OU publier directement (connecté à Phase 1) | Modif `VideoRenderStatus.jsx` |

**Inspiration :** [OpusClip](https://opus.clip) (analyse auto + découpe intelligente), [CapCut](https://capcut.com) (templates + auto-captions), [Submagic](https://submagic.co) (sous-titres animés).

---

### PHASE 3 — Idées et guidance filmage (2 semaines)

**Objectif :** Le restaurateur sait exactement **QUOI filmer** et **COMMENT**.

| Étape | Détail | Livrables |
|-------|--------|-----------|
| 3.1 — Shot Guide intégré | Pour chaque idée : guide visuel avec angle de caméra (overhead, close-up, POV), durée cible, check-list de plans | Amélioration `ShotGuide.jsx` |
| 3.2 — Storyboard IA | Claude génère un storyboard 3-5 plans (ex: "Plan 1 : Vue overhead des ingrédients crus, 3s") | `src/components/features/StoryboardGenerator.jsx` |
| 3.3 — Mode filmage guidé | Overlay caméra avec timer + instructions temps réel ("Maintenant filme le dressage, 5s") | Refonte `FilmingMode.jsx` |
| 3.4 — Trends en temps réel | Remplacer les mock data par un scraping/API réel des sons trending TikTok | RapidAPI TikTok ou Apify |
| 3.5 — Idées contextuelles | Générer des idées basées sur : saison, météo locale, événements (Saint-Valentin, Fête des mères), menu du jour | Prompt engineering Claude |

**Techniques virales food 2026 à intégrer :**
- **ASMR cooking** (textures, sons de cuisson, friture)
- **Cheese pull / sauce drizzle** (close-up sensoriel)
- **Before/after transformation** (ingrédients bruts → plat final)
- **POV "Le chef prépare votre commande"**
- **"Menu secret" reveal**
- **Speed cooking** (timelapse 15s d'une recette)
- **Réaction client** (première bouchée)

---

### PHASE 4 — Analytics réelles + feedback loop (2 semaines)

**Objectif :** Remplacer les fausses stats par de la vraie data.

| Étape | Détail |
|-------|--------|
| 4.1 — Stats réelles | Via Ayrshare/API : vues, likes, commentaires, partages par post |
| 4.2 — Dashboard performance | Graphiques réels : engagement par plateforme, évolution followers, meilleurs posts |
| 4.3 — Heatmap dynamique | Calculer les meilleurs créneaux à partir des données réelles du restaurateur |
| 4.4 — Feedback loop IA | Claude analyse les performances passées pour ajuster les recommandations ("Vos Reels cuisine marchent 3× mieux que vos photos menu") |
| 4.5 — Score de régularité | Gamification : streak de publication, objectif hebdo, badges |

---

### PHASE 5 — Monétisation et scaling (2 semaines)

| Étape | Détail |
|-------|--------|
| 5.1 — Stripe integration | Paiement réel pour Pro (29€) et Premium (99€) — Stripe Checkout + Webhooks |
| 5.2 — Trial 14 jours | Free trial Pro complet, puis downgrade Starter |
| 5.3 — Notifications push réelles | Service Worker + Firebase Cloud Messaging pour rappels de publication |
| 5.4 — Persistance Chef IA | Sauvegarder l'historique de chat en Supabase |
| 5.5 — Onboarding connecté | Connecter les réseaux sociaux dès l'onboarding (étape 4) |

---

## 6. STACK TECHNIQUE RECOMMANDÉE

| Besoin | Solution | Coût |
|--------|----------|------|
| Publication multi-plateforme | Ayrshare API | ~60€/mois |
| Paiement | Stripe (Checkout + Webhooks) | 1.4% + 0.25€/tx |
| Notifications push | Firebase Cloud Messaging | Gratuit |
| Trends scraping | RapidAPI TikTok ou Apify | ~30€/mois |
| Musique libre de droits | Uppbeat API / Epidemic Sound | ~20€/mois |
| Rendu vidéo (existant) | Shotstack | Existant |
| IA (existant) | Claude + DALL-E + Whisper | Existant |

**Total coûts additionnels V2 :** ~110€/mois (hors IA) pour débloquer la vraie valeur produit.

---

## 7. MEGAPROMPT IA — INSTRUCTIONS D'EXÉCUTION

> **À copier-coller intégralement pour briefer une IA qui doit exécuter le plan V2.**

```
# Contexte projet

Tu travailles sur PostChef, une app SaaS React/Vite/Tailwind/Zustand/Supabase destinée
aux restaurateurs indépendants français pour créer et publier du contenu sur les
réseaux sociaux (Instagram, TikTok, Facebook).

La V1 est techniquement solide (prompt caching Claude, tool-calling, vision multi-frame,
rendu vidéo Shotstack) MAIS souffre d'un gap critique : l'app crée du contenu mais ne
peut pas le publier. Les restaurateurs doivent copier-coller leurs légendes et uploader
leurs vidéos manuellement sur chaque réseau — exactement la friction que l'app promet
d'éliminer.

# Objectif produit V2

Un restaurateur filme un plat avec son téléphone. PostChef s'occupe du reste :
montage, sous-titres, légende, hashtags, et publication sur tous ses réseaux — en un tap.

# Ordre d'exécution OBLIGATOIRE

Tu suis les phases 0 → 5 dans l'ordre. Tu ne commences PAS la phase N+1 avant que la
phase N soit 100% terminée, testée et mergée. Chaque phase se termine par :
  1. Tests manuels sur toutes les fonctionnalités touchées
  2. Type-check + build sans warning
  3. Commit + PR avec description détaillée

# Règles d'ingénierie non-négociables

1. Avant de modifier un fichier, LIS-LE intégralement. Ne devine jamais son contenu.
2. Avant d'ajouter une dépendance, vérifie qu'elle n'existe pas déjà dans package.json.
3. N'ajoute PAS de backwards-compatibility shims, feature flags inutiles, ni code commenté.
4. Respecte les design tokens Tailwind pc-* définis dans tailwind.config.js. Pas de
   couleur hardcodée (#xxx) en dur.
5. Respecte la terminologie française existante (éviter les anglicismes).
6. Toute erreur visible par l'utilisateur doit passer par useToastStore, pas console.error.
7. Toute mutation Supabase doit être protégée par RLS ET validée côté API.
8. Toute valeur monétaire ou de quota doit passer par src/utils/plans.js — source of truth.
9. Les dates sont stockées en ISO 8601 (YYYY-MM-DD), jamais en "Lundi"/"Mardi".
10. Aucune clé API en dur dans le code client. Utiliser les routes /api/*.

# Phase 0 — Corrections critiques

Tu corriges dans cet ordre :

B1 (Calendrier dates)
  - Migrer le modèle post.day/dayShort → post.scheduledAt (ISO 8601)
  - Fonction de migration au rehydrate du store Zustand
  - Calendar.jsx lit scheduledAt et calcule la grille par semaine ISO
  - Tester : créer post, naviguer mois suivant, revenir → post au bon endroit

B2 (Sécurité plans)
  - Supprimer setPlan direct dans Account.jsx
  - Créer api/plan.js qui valide le user via Supabase JWT
  - Le changement de plan DOIT passer par Stripe (Phase 5) ou être admin-only
  - D'ici là, bloquer avec un toast "Contactez le support"

B3 (RGPD delete account)
  - Créer api/delete-account.js avec service_role key
  - Supprimer : auth.users, profiles, restaurants, app_state (toutes les lignes user)
  - UI : modale de confirmation "Tapez SUPPRIMER pour confirmer"
  - Après succès : signOut + redirect vers /

B4 (Transaction workspace)
  - Option A : Postgres function save_workspace(user_id, profile, restaurant, app_state)
    qui fait les 3 UPDATE dans une transaction
  - Option B : upserts séquentiels avec rollback manuel si échec
  - Recommandation : Option A, plus robuste

B7 (Timeout polling Shotstack)
  - useShotstack.js : ajouter AbortController + timeout 10 min
  - Si timeout : set renderStatus='failed', toast "Le rendu a expiré, réessaie"

B8-B9 (Parsing Ideas)
  - Fonction parseClaudeJSON(text) qui gère : JSON pur, JSON dans ```json```, JSON dans ```
  - Distinguer les erreurs : ServerApiError.code === 'RATE_LIMIT' vs 'NETWORK' vs 'PARSE'
  - Toasts dédiés avec CTA approprié (upgrade / réessayer / contacter support)

B10-B11 (Typos)
  - grep -r "Idee\|Reinitialiser\|Evenements\|Pref à publier" src/
  - Remplacer par les versions accentuées correctes

Code mort
  - rm src/utils/demoMode.js (vérifier qu'il n'est importé nulle part d'abord)
  - Retirer export mockPosts dans mockData.js

Design tokens
  - grep -rE "#[0-9A-Fa-f]{6}" src/
  - Pour chaque couleur hardcodée : trouver l'équivalent pc-* dans tailwind.config.js
  - Si absent : l'ajouter comme nouveau token, pas en dur

Livraison Phase 0 : 1 PR par bug (B1 à B13 + nettoyage). Chaque PR indépendante.

# Phase 1 — Publication réelle via Ayrshare

1.1 Connexion comptes
  - Créer compte Ayrshare (plan Business ~60€/mois)
  - Stocker AYRSHARE_API_KEY en variable d'environnement Vercel
  - api/ayrshare/connect.js : génère l'URL OAuth Ayrshare Single Profile
  - Table Supabase `social_connections` (user_id, platform, ayrshare_profile_key,
    connected_at, status)
  - Page src/pages/ConnectSocials.jsx accessible depuis Account

1.2 Publication directe
  - api/ayrshare/publish.js : POST { postId, platforms[], mediaUrl, caption }
  - Appelle Ayrshare /api/post avec le bon payload
  - Met à jour post.status = 'publishing' puis 'published' via webhook

1.3 Programmation
  - Table Supabase `scheduled_posts` (id, user_id, post_id, scheduled_at,
    ayrshare_scheduled_id, status)
  - UI : DatePicker + TimePicker sur la modale de publication
  - Utiliser le scheduling natif Ayrshare (pas de cron maison)

1.4 Horaires optimaux
  - src/utils/optimalTimes.js : matrice par cuisine/plateforme
    Exemple : {french_food: {instagram: ['tue_10', 'wed_18', 'thu_11']}}
  - Composant OptimalTimeSuggest : chips cliquables avec les 3 meilleurs créneaux

1.5 Adaptation multi-plateforme
  - src/utils/platformAdapters.js : fonctions adaptCaption, adaptMedia, adaptHashtags
  - Caption Instagram : 2200 chars max, hashtags en commentaire (optionnel)
  - Caption TikTok : 2200 chars, hashtags inline
  - Caption Facebook : 63k chars (pas de troncation)
  - Vidéo Reels/TikTok : 9:16, max 90s
  - Photo Feed IG : 1:1 ou 4:5

1.6 Statut via webhook
  - api/ayrshare/webhook.js : reçoit les callbacks Ayrshare
  - Vérifie signature HMAC
  - Update post.status en BDD
  - Notification push si échec (Phase 5)

Livraison Phase 1 : flow end-to-end testable avec un vrai compte IG de test.

# Phase 2 — Montage automatique

2.1 Flow simplifié
  - Studio.jsx refonte en 3 étapes linéaires :
    Étape 1 : Upload (1-3 clips) ou "Filmer maintenant"
    Étape 2 : Choisir un template (5 cards visuelles)
    Étape 3 : Rendu (progress bar + preview quand ready)
  - Retirer les étapes intermédiaires optionnelles (mode avancé à part)

2.2 Templates restaurant
  - src/utils/shotstackTemplates.js exporte RESTAURANT_TEMPLATES :
    * recipe_quick (15s, 3 plans, texte gros, musique upbeat)
    * signature_dish (30s, 5 plans, transitions zoom, musique élégante)
    * behind_scenes (20s, 4 plans, caption inline, musique douce)
    * client_review (15s, plan fixe + sous-titres, musique neutre)
    * daily_menu (10s, slideshow, texte prix visible, musique corporate)
  - Chaque template = fonction (clips, brandKit, restaurant) → Shotstack edit JSON

2.3 Auto-sous-titres (finaliser)
  - Whisper renvoie déjà les word timings
  - Générer des blocs de 3-5 mots max, style kinetic par défaut
  - Position : bas à 20% du bord, safe area mobile

2.4 Auto-musique
  - Integration Uppbeat API (gratuite avec attribution ou payante ~20€/mois)
  - Claude détecte le mood du clip → mapping vers mood Uppbeat
  - Tracks sous licence commerciale (CRITIQUE : pas de copyright strike)

2.5 B-roll automatique
  - ViralityEngine détecte déjà les "gaps"
  - Pour chaque gap > 3s : query Pexels avec keywords IA, insert dans track B-roll
  - Durée max B-roll : 40% du clip total

2.6 Export & partage
  - Bouton "Télécharger" → fetch videoUrl + save local
  - Bouton "Publier maintenant" → ouvre la modale Phase 1.2
  - Bouton "Programmer" → ouvre la modale Phase 1.3

Livraison Phase 2 : user flow complet filmer → reel prêt en < 2 min.

# Phase 3 — Guidance filmage

3.1 Shot Guide intégré
  - ShotGuide.jsx enrichi : pour chaque idée, afficher un bloc visuel par plan
  - Illustrations SVG simples : overhead, close-up, POV, plan fixe
  - Durée cible par plan + checkbox "J'ai filmé ce plan"

3.2 Storyboard IA
  - Nouveau composant StoryboardGenerator.jsx
  - Au clic sur une idée : appel Claude avec prompt :
    "Génère un storyboard en 3-5 plans pour cette idée : {idée}.
    Chaque plan : numéro, description visuelle, angle caméra, durée (sec), dialogue/bruit."
  - Affichage en timeline horizontale scrollable

3.3 Mode filmage guidé
  - FilmingMode.jsx : overlay plein écran par-dessus la caméra
  - Timer visible, instruction du plan courant en gros
  - Swipe right = plan suivant, swipe left = plan précédent
  - Utiliser getUserMedia + MediaRecorder API

3.4 Trends en temps réel
  - Service src/services/tiktokTrends.js
  - API RapidAPI TikTok : /trending/sounds, /trending/hashtags
  - Cache Supabase 6h (table trends_cache)
  - Remplacer mockTrendingSounds dans Trends.jsx

3.5 Idées contextuelles
  - Prompt Claude enrichi avec :
    * Saison courante (date courante → saison)
    * Météo locale (API OpenWeather avec ville du restaurant)
    * Événements à venir (Fête des mères, Saint-Valentin, etc. → calendrier fixe)
    * Menu du jour si renseigné
  - Régénération des idées quotidiennes à minuit (cron Vercel)

Livraison Phase 3 : user ne se demande plus jamais "qu'est-ce que je filme aujourd'hui ?".

# Phase 4 — Analytics réelles

4.1 Stats réelles via Ayrshare
  - api/ayrshare/analytics.js : GET /api/analytics/post/:id
  - Poll quotidien (cron Vercel) pour chaque post publié des 30 derniers jours
  - Table Supabase post_analytics : post_id, views, likes, comments, shares, date

4.2 Dashboard performance
  - Analytics.jsx : remplacer mockStats par vraies données
  - Graphique Recharts : ligne évolutive views/likes sur 30j
  - Top 3 posts avec thumbnails

4.3 Heatmap dynamique
  - Calculer best_hours(user_id) depuis post_analytics
  - Fallback sur horaires génériques (Phase 1.4) si < 10 posts publiés

4.4 Feedback loop IA
  - À la génération d'idées : prompt Claude enrichi avec :
    "Voici les 10 derniers posts de ce restaurateur et leurs perfs : {data}.
    Génère des idées SIMILAIRES aux meilleurs performers."

4.5 Score de régularité
  - Composant StreakBadge.jsx
  - Calcul : jours consécutifs avec au moins 1 post publié
  - Objectif hebdo : atteint si N posts publiés cette semaine (N selon plan)

Livraison Phase 4 : restaurateur voit une vraie progression, pas des chiffres inventés.

# Phase 5 — Monétisation

5.1 Stripe
  - stripe products : pc_starter, pc_pro_monthly, pc_pro_annual, pc_premium
  - api/stripe/checkout.js : crée une session Checkout
  - api/stripe/webhook.js : écoute checkout.session.completed, invoice.paid, customer.subscription.deleted
  - Mise à jour profiles.plan via service role

5.2 Trial 14j
  - À l'inscription : plan = 'pro_monthly', plan_expiry = now + 14d
  - Cron quotidien : si plan_expiry < now et pas de subscription Stripe active → downgrade starter
  - Email J-3 et J-1 via Resend/Sendgrid

5.3 Push notifications
  - Service Worker src/sw.js
  - Firebase Cloud Messaging (projet Firebase)
  - Table device_tokens (user_id, fcm_token, platform, updated_at)
  - Triggers : rappel publication, post échoué, idée quotidienne

5.4 Persistance Chef IA
  - Table ai_chat_history (user_id, messages jsonb, updated_at)
  - AiChat.jsx : charger au mount, save à chaque message

5.5 Onboarding connecté
  - Ajouter étape 4.5 (après préférences) : "Connecte tes réseaux"
  - Skip possible mais badge "Non connecté" tant que non fait

Livraison Phase 5 : produit prêt pour un lancement payant.

# Checklist de fin de projet

[ ] Tous les bugs B1-B13 corrigés et vérifiés
[ ] Code mort supprimé (demoMode.js, mockPosts)
[ ] Design tokens pc-* partout (grep #[0-9A-F]{6} → 0 match)
[ ] 0 typo (accents français corrects)
[ ] Publication réelle fonctionnelle sur les 3 plateformes
[ ] 5 templates de montage restaurant opérationnels
[ ] Auto-sous-titres via Whisper
[ ] Storyboard IA opérationnel
[ ] Analytics connectées à Ayrshare
[ ] Stripe en production avec webhooks
[ ] Push notifications fonctionnelles
[ ] Historique Chef IA persistant
[ ] Build production sans warning
[ ] Tests manuels end-to-end documentés
[ ] README à jour
```

---

## 8. NOTES FINALES

- **La Phase 1 (publication) est la plus critique.** Sans elle, PostChef est un outil de création sans distribution — exactement la friction que l'app promet d'éliminer.
- **Le différenciateur** vs Buffer/Hootsuite/Postiz (schedulers génériques) : le montage automatique avec templates restaurant (Phase 2) + la guidance filmage (Phase 3).
- **Projets open source à étudier :** Postiz (architecture scheduling), Mixpost (multi-plateforme mature), OpusClip (montage auto).
- **Risque business principal :** TikTok Content Posting API nécessite un audit — Ayrshare gère ça en amont, d'où le choix recommandé.
