# PostChef V2 — Plan de mise en production

> **Date** : 13 avril 2026
> **Objectif** : Passer PostChef d'un prototype frontend-only (localStorage + mock data) a un produit SaaS securise et fonctionnel avec Supabase, auth, IA reelle, et zero faille de securite.

---

## Table des matieres

1. [Etat des lieux](#1--etat-des-lieux)
2. [Limites actuelles](#2--limites-actuelles-critiques)
3. [Phase 1 — Securite & Backend Proxy](#3--phase-1--securite--backend-proxy)
4. [Phase 2 — Supabase & Authentification](#4--phase-2--supabase--authentification)
5. [Phase 3 — Review technique & Bugs](#5--phase-3--review-technique--bugs)
6. [Phase 4 — Review visuelle](#6--phase-4--review-visuelle)
7. [Phase 5 — Features IA](#7--phase-5--features-ia)
8. [Schema de la base de donnees](#8--schema-de-la-base-de-donnees-propose)
9. [Variables d'environnement](#9--variables-denvironnement)
10. [Premier prompt a envoyer](#10--premier-prompt-a-envoyer)

---

## 1 — Etat des lieux

### Ce qui est fait (build OK, `npm run dev` fonctionnel)

| Categorie | Detail | Status |
|---|---|---|
| **Stack** | React 18 + Vite 5 + Tailwind 3 + Zustand + Framer Motion | OK |
| **Onboarding** | 8 etapes completes (Step1-Step8) avec transitions animees | OK |
| **Layout** | AppShell + Sidebar (desktop) + BottomNav floating pill (mobile) | OK |
| **Pages** | Landing, Dashboard, Calendar, Ideas, Trends, Studio, Analytics, Account, AiChat | OK |
| **PWA** | manifest.json + Service Worker + hook usePWAInstall | OK |
| **Design system** | Tokens pc-*, glass effects, Plus Jakarta Sans, composants UI | OK |
| **Plans/Paywall** | 3 plans (Starter/Pro Mensuel/Pro Annuel) + feature gating frontend | OK |
| **IA — Idees** | Generation 8 idees via Claude (avec fallback mock) | OK |
| **IA — Menu photo** | Claude Vision analyse les photos de menu | OK |
| **IA — Quick Capture** | Photo -> legende + hashtags via Claude Vision | OK |
| **IA — Video Script** | Generation de scripts 5 etapes via Claude | OK |
| **IA — Virality Engine** | Analyse multimodale 3 frames + directive complete | OK |
| **IA — Restaurant Brain** | Google Places avis -> Claude insights | OK |
| **IA — DALL-E** | Generation images plats + b-roll via OpenAI | OK |
| **IA — Whisper** | Transcription audio video avec timestamps | OK |
| **Video** | Shotstack render + Pexels stock + Cloudinary upload | OK |
| **Deploiement** | Config Vercel (vercel.json SPA rewrite) | OK |

### Ce qui n'est PAS fait

| Element | Impact |
|---|---|
| Authentification | Aucun login, aucune session, aucune protection des routes |
| Base de donnees | Tout est en localStorage — donnees perdues si l'utilisateur change de navigateur |
| Backend / API proxy | Aucun — tous les appels API sont faits depuis le navigateur |
| Securite des cles API | CRITIQUE — toutes les cles sont dans le bundle JS client |
| Paiement (Stripe) | Le changement de plan est un simple `setPlan()` sans transaction |
| Chef IA Chat | Interface OK mais reponses 100% simulees (keyword matching) |
| Analytics | 100% mock data, aucune donnee reelle |

---

## 2 — Limites actuelles (CRITIQUES)

### SECURITE — Niveau de risque : ELEVE

| Probleme | Gravite | Detail |
|---|---|---|
| **Cles API dans le bundle JS** | CRITIQUE | Les 6 cles API (Anthropic, OpenAI, Shotstack, Pexels, Google Places, Cloudinary) sont lisibles par quiconque ouvre DevTools sur le site deploye. Un attaquant peut voler les cles et generer des couts illimites sur tes comptes. |
| **Appels API directs du navigateur** | CRITIQUE | 11 fichiers font des `fetch()` directement vers des API externes (api.anthropic.com, api.openai.com, etc.) depuis le frontend. Le header `'anthropic-dangerous-direct-browser-access': 'true'` est un signal d'alarme nomme ainsi par Anthropic eux-memes. |
| **Aucune authentification** | ELEVE | N'importe qui peut acceder a `/app/*` sans login. Les donnees "utilisateur" sont dans localStorage, n'importe qui sur le meme poste peut les voir. |
| **Aucun rate limiting** | ELEVE | Sans proxy backend, rien n'empeche un utilisateur de spammer les API IA et de generer des couts enormes. |
| **Plan modifiable cote client** | MOYEN | `setPlan('pro-annual')` dans la console suffit a debloquer toutes les features premium. |

### Fichiers concernes par l'exposition des cles

```
src/pages/Ideas.jsx                          -> VITE_ANTHROPIC_KEY
src/components/features/QuickCapture.jsx     -> VITE_ANTHROPIC_KEY
src/components/features/VideoScriptGenerator.jsx -> VITE_ANTHROPIC_KEY
src/components/features/ViralityEngine.jsx   -> VITE_ANTHROPIC_KEY
src/components/ui/MenuPhotoUpload.jsx        -> VITE_ANTHROPIC_KEY
src/hooks/useRestaurantBrain.js              -> VITE_ANTHROPIC_KEY + VITE_GOOGLE_PLACES_KEY
src/components/features/DishPhotoGenerator.jsx -> VITE_OPENAI_KEY
src/components/features/BRollSlots.jsx       -> VITE_OPENAI_KEY
src/utils/whisper.js                         -> VITE_OPENAI_KEY
src/utils/shotstack.js                       -> VITE_SHOTSTACK_KEY
src/utils/pexels.js                          -> VITE_PEXELS_KEY
src/utils/ingestAsset.js                     -> VITE_SHOTSTACK_KEY + VITE_CLOUDINARY_*
```

### ARCHITECTURE

| Probleme | Impact |
|---|---|
| **Zero persistance serveur** | Donnees perdues si clear localStorage, changement de navigateur/appareil |
| **user.id toujours null** | Impossible de lier des donnees a un utilisateur |
| **user.prenom = 'Marco' hardcode** | Tous les utilisateurs s'appellent Marco |
| **Mock data melangees aux vraies** | Le Calendar affiche des mockPosts non supprimables a cote des vrais posts |
| **Chef IA Chat simule** | Premium gate OK mais les reponses sont du keyword matching, pas de l'IA |
| **Analytics 100% mock** | Aucune metrique reelle, donnees inventees |

### VISUEL / UX

| Probleme | Impact |
|---|---|
| **Studio et Trends inaccessibles sur mobile** | Le BottomNav a 5 tabs, le Sidebar en a 7. Studio et Trends ne sont pas dans la nav mobile. |
| **Pas de page Login / Signup** | L'onboarding ne cree pas de compte, il stocke juste en local |
| **Pas de redirect onboarding** | Un utilisateur peut acceder a `/app` sans avoir fait l'onboarding |
| **Purple (#7C3AED) inline** | Couleur du Chef IA utilisee en inline, pas dans le design system Tailwind |

---

## 3 — Phase 1 : Securite & Backend Proxy

**Objectif** : Plus aucune cle API dans le frontend. Tous les appels passent par un proxy serveur.

**Duree estimee** : 1 session

### Taches detaillees

| # | Tache | Fichiers concernes | Detail |
|---|---|---|---|
| 1.1 | **Creer `/api/claude.js`** (Vercel Serverless) | Nouveau fichier | Proxy pour les 6 endpoints Anthropic. Recoit le prompt du frontend, appelle Claude cote serveur, retourne la reponse. La cle `ANTHROPIC_KEY` est une variable d'env Vercel (sans prefix `VITE_`). |
| 1.2 | **Creer `/api/openai.js`** | Nouveau fichier | Proxy pour DALL-E 3 (images) et Whisper (transcription). La cle `OPENAI_KEY` reste serveur-only. |
| 1.3 | **Creer `/api/google-places.js`** | Nouveau fichier | Proxy pour l'API Google Places (recherche d'avis). La cle `GOOGLE_PLACES_KEY` reste serveur-only. |
| 1.4 | **Creer `/api/shotstack.js`** | Nouveau fichier | Proxy pour Shotstack (submit render + poll status). La cle `SHOTSTACK_KEY` reste serveur-only. |
| 1.5 | **Creer `/api/pexels.js`** | Nouveau fichier | Proxy pour Pexels (recherche videos stock). La cle `PEXELS_KEY` reste serveur-only. |
| 1.6 | **Migrer les 11 fichiers frontend** | Voir liste ci-dessus | Remplacer chaque `fetch('https://api.anthropic.com/...')` par `fetch('/api/claude')`, etc. Supprimer tous les `import.meta.env.VITE_*` sauf Supabase. |
| 1.7 | **Supprimer `.env.example` secrets** | `.env.example` | Ne garder que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Documenter les vars serveur dans un `.env.server.example`. |
| 1.8 | **Rate limiting basique** | Chaque `/api/*.js` | Limiter a ~60 req/min par IP pour eviter les abus. |
| 1.9 | **Validation des inputs** | Chaque `/api/*.js` | Valider que les payloads envoyes au proxy sont bien formes avant de les transmettre aux API externes. |
| 1.10 | **Mettre a jour `vercel.json`** | `vercel.json` | Ajouter la config pour les API routes si necessaire. |

### Resultat attendu
- DevTools -> Network : aucune requete vers `api.anthropic.com`, `api.openai.com`, etc.
- Aucune cle API visible dans le bundle JS (`dist/assets/*.js`)
- Toutes les features IA fonctionnent via le proxy

---

## 4 — Phase 2 : Supabase & Authentification

**Objectif** : Auth reelle + persistance des donnees dans Supabase.

**Duree estimee** : 1-2 sessions

### Cles a fournir

| Cle | Ou la trouver | Securite |
|---|---|---|
| `SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL | Publique (OK cote client) |
| `SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon public | Publique (protegee par RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > service_role | **JAMAIS** cote client, uniquement dans les Vercel env vars serveur |

### Taches detaillees

| # | Tache | Detail |
|---|---|---|
| 2.1 | **Installer `@supabase/supabase-js`** | `npm install @supabase/supabase-js` |
| 2.2 | **Creer `src/lib/supabase.js`** | Client Supabase initialise avec `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| 2.3 | **Creer/valider le schema DB** | Voir [Section 8](#8--schema-de-la-base-de-donnees-propose) pour le schema complet |
| 2.4 | **Activer Row Level Security (RLS)** | Chaque table : `SELECT/INSERT/UPDATE/DELETE WHERE auth.uid() = user_id` |
| 2.5 | **Creer les pages Auth** | `/login`, `/signup`, `/forgot-password` — design coherent avec le reste |
| 2.6 | **Implementer le AuthProvider** | Context React pour la session, auto-refresh du token |
| 2.7 | **Route guard `/app/*`** | Redirect vers `/login` si non authentifie |
| 2.8 | **Redirect post-onboarding** | Apres Step8, creer le profil Supabase + redirect `/app` |
| 2.9 | **Migrer Zustand -> Supabase** | Posts, ideas, savedIdeas, reels, brandKit, usage — sync avec Supabase |
| 2.10 | **Garder Zustand comme cache local** | Zustand = cache rapide, Supabase = source de verite. Sync au montage. |
| 2.11 | **Migrer le profil utilisateur** | `user.prenom`, `email`, `plan` -> table `profiles` dans Supabase |
| 2.12 | **Verification du plan cote serveur** | Les API routes verifient le plan de l'utilisateur avant d'executer des features premium |

---

## 5 — Phase 3 : Review technique & Bugs

**Objectif** : Zero bug, zero warning, zero inconsistance.

### Taches detaillees

| # | Bug/Probleme | Fichier | Fix |
|---|---|---|---|
| 3.1 | `user.prenom = 'Marco'` hardcode | `src/store/useAppStore.js` | Remplacer par `''` ou la valeur de l'onboarding |
| 3.2 | `user.id = null` toujours | `src/store/useAppStore.js` | Lier a `auth.uid()` de Supabase |
| 3.3 | `setPlan()` sans paiement | `src/pages/Account.jsx` | Gater derriere Stripe Checkout (ou desactiver en V1) |
| 3.4 | mockPosts melanges aux vrais posts | `src/pages/Calendar.jsx` | Afficher les mocks UNIQUEMENT si l'utilisateur n'a aucun post reel, avec un badge "Exemple" |
| 3.5 | Chef IA Chat simule | `src/pages/AiChat.jsx` | Remplacer `getAIResponse()` par un vrai appel a `/api/claude` |
| 3.6 | Analytics 100% mock | `src/pages/Analytics.jsx` | Calculer les stats reelles depuis les posts Supabase (ou afficher "Bientot disponible") |
| 3.7 | Usage reset timezone | `src/store/useAppStore.js` | Verifier le comportement avec differents fuseaux horaires |
| 3.8 | Service Worker cache stale | `public/sw.js` | Verifier la strategie de mise a jour du cache |
| 3.9 | Pas de redirect onboarding | `src/App.jsx` | Si `onboarding.completed === false` et route `/app/*`, redirect vers `/onboarding` |
| 3.10 | Console warnings React | Global | Nettoyer tous les warnings (key props, deps manquantes, etc.) |
| 3.11 | Error boundaries | Global | Ajouter un ErrorBoundary global pour eviter les ecrans blancs |
| 3.12 | VITE_GOOGLE_PLACES_KEY absent du .env.example | `.env.example` | Ajouter la variable (sera migree en var serveur Phase 1) |

---

## 6 — Phase 4 : Review visuelle

**Objectif** : UX parfaite sur mobile, tablet et desktop.

### Taches detaillees

| # | Probleme | Detail |
|---|---|---|
| 4.1 | **Studio et Trends absents du BottomNav mobile** | Ajouter un acces — soit via "Plus" menu, soit en reorganisant la nav (ex: remplacer Compte par un menu "Plus" qui contient Compte + Studio + Trends) |
| 4.2 | **Responsive de chaque page** | Tester et fixer les 9 pages sur viewport 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px+. |
| 4.3 | **Couleur #7C3AED inline** | Ajouter `pc-purple` dans `tailwind.config.js` et remplacer tous les inline styles |
| 4.4 | **Onboarding flow complet** | Verifier chaque etape : navigation avant/arriere, validation des champs, transitions, edge cases (champs vides, selections multiples) |
| 4.5 | **Empty states** | Chaque page sans donnees doit afficher un message clair + CTA (pas un ecran vide) |
| 4.6 | **Loading states** | Chaque appel API doit avoir un skeleton/spinner coherent |
| 4.7 | **Error states** | Message d'erreur user-friendly si une API echoue (pas un crash) |
| 4.8 | **Accessibilite de base** | Focus states visibles, aria-labels sur les boutons icones, contrastes suffisants |
| 4.9 | **Landing page** | Verifier le rendu mobile, les CTA, le flow vers onboarding |
| 4.10 | **Transitions entre pages** | Verifier que les animations Framer Motion sont fluides, pas de flash blanc |

---

## 7 — Phase 5 : Features IA

**Objectif** : Toutes les features IA fonctionnent avec des vrais appels Claude/OpenAI via le proxy.

### Taches detaillees

| # | Feature | Etat actuel | A faire |
|---|---|---|---|
| 5.1 | **Google Maps / Avis restaurants** | Ebauche dans `useRestaurantBrain.js` | Connecter au proxy `/api/google-places`, ameliorer le prompt Claude pour extraire des insights content actionables (forces, opportunites, idees de posts basees sur les avis). |
| 5.2 | **Chef IA Chat** | Simule (keyword matching) | Remplacer par de vrais appels Claude via `/api/claude`. Contexte : profil restaurant + historique de conversation. Prompt systeme : expert en content marketing restaurant. |
| 5.3 | **Generation de descriptions** | Basique dans Ideas.jsx | Ameliorer : descriptions optimisees par plateforme (Instagram vs TikTok), avec emojis, hashtags, CTA. Prendre en compte la tonalite du restaurant. |
| 5.4 | **Generation d'images menu** | DALL-E 3 dans DishPhotoGenerator | Connecter au proxy `/api/openai`. Ameliorer le prompt pour du food photography professionnel. Ajouter le choix du style (overhead, 45deg, close-up). |
| 5.5 | **Photo originale -> photo pro** | Non implemente | Nouveau flow : upload photo brute du plat -> Claude Vision analyse (composition, lumiere, couleurs) -> genere un prompt DALL-E optimise -> image stylisee "pro". Le but n'est pas de remplacer la photo mais de generer une version "inspirante" pour les reseaux. |
| 5.6 | **Quick Capture ameliore** | Legende + hashtags basiques | Enrichir : suggestion de post complet (accroche + corps + CTA + hashtags), adapte a la plateforme selectionnee, avec 3 variantes de ton. |
| 5.7 | **Virality Engine** | Fonctionnel mais appel direct | Connecter au proxy. Ameliorer les prompts avec le contexte restaurant (avis Google, specialites). Ajouter un score de confiance sur les predictions. |
| 5.8 | **Scripts video contextualises** | Generation basique | Enrichir avec le contexte restaurant (plats stars des avis Google, style de clientele, evenements saisonniers). |
| 5.9 | **Tendances personnalisees** | Mock data | Croiser les tendances reelles (TikTok trends, hashtags locaux) avec le profil du restaurant pour des suggestions 100% pertinentes. Necessite potentiellement un scraping ou une API tierce. |
| 5.10 | **Analyse du menu** | Claude Vision fonctionnel | Ameliorer : extraire les plats + prix, generer un calendrier de posts base sur les plats, suggerer des "hero dishes" a mettre en avant. |

---

## 8 — Schema de la base de donnees (propose)

> A valider avec les tables que tu as deja creees dans Supabase.

### Table `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT,
  email TEXT,
  plan TEXT DEFAULT 'starter',         -- starter | pro-monthly | pro-annual
  plan_expiry TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `restaurants`
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  cuisine_types TEXT[],                -- array de types de cuisine
  specialite TEXT,
  couverts TEXT,                       -- tranche : "20-50", "50-100", etc.
  clientele_profils TEXT[],
  objectif TEXT,
  plateformes TEXT[],                  -- instagram, tiktok, facebook
  frequence INTEGER DEFAULT 3,        -- posts par semaine
  styles TEXT[],
  google_place_id TEXT,               -- pour l'API Google Places
  menu_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `posts`
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day TEXT,
  type TEXT,                           -- photo, video, story, reel, carrousel
  description TEXT,
  hook TEXT,
  brief TEXT,
  legende TEXT,
  plateformes TEXT[],
  status TEXT DEFAULT 'planifie',      -- planifie | en_cours | publie
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `ideas`
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hook TEXT,
  format TEXT,
  plateforme TEXT,
  tags TEXT[],
  is_saved BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `reels`
```sql
CREATE TABLE reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  render_id TEXT,
  render_url TEXT,
  status TEXT,                         -- queued | rendering | done | failed
  directive JSONB,                     -- la directive de viralite complete
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `brand_kits`
```sql
CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1D9E75',
  accent_color TEXT DEFAULT '#0F6E56',
  font_family TEXT DEFAULT 'Plus Jakarta Sans',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `usage_tracking`
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ideas_used_this_week INTEGER DEFAULT 0,
  ideas_used_this_month INTEGER DEFAULT 0,
  photos_generated_this_month INTEGER DEFAULT 0,
  reels_this_month INTEGER DEFAULT 0,
  scripts_this_month INTEGER DEFAULT 0,
  captions_this_month INTEGER DEFAULT 0,
  week_reset_date DATE,
  month_reset_date DATE
);
```

### Table `chat_messages` (pour Chef IA)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                  -- user | assistant
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Policies RLS (a appliquer sur CHAQUE table)
```sql
-- Exemple pour la table posts :
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own posts"
  ON posts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);
```

---

## 9 — Variables d'environnement

### Cote client (dans `.env` / `.env.local`)
```env
# Supabase — ces cles sont PUBLIQUES par design (protegees par RLS)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Cote serveur (dans Vercel Dashboard > Settings > Environment Variables)
```env
# Supabase — cle admin, JAMAIS dans le frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# API IA
ANTHROPIC_KEY=sk-ant-...
OPENAI_KEY=sk-...

# Services video
SHOTSTACK_KEY=...
SHOTSTACK_HOST=https://api.shotstack.io/edit/stage

# Media
PEXELS_KEY=...
CLOUDINARY_CLOUD=...
CLOUDINARY_PRESET=...

# Google
GOOGLE_PLACES_KEY=...
```

> **Regle d'or** : si une variable commence par `VITE_`, elle est dans le bundle JS public.
> Seules `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` doivent avoir ce prefix.

---

## 10 — Premier prompt a envoyer

> Copie-colle ce prompt une fois que tu m'auras donne les cles Supabase et confirme le schema DB.

```
Voici les infos pour commencer la Phase 1 (Securite) + Phase 2 (Supabase) :

SUPABASE_URL = [colle ici]
SUPABASE_ANON_KEY = [colle ici]

Pour les cles API tierces (Anthropic, OpenAI, etc.), je les configurerai
directement dans Vercel Dashboard — tu n'en as pas besoin dans le code.

Schema DB :
- [ ] J'ai deja cree les tables dans Supabase (dis-moi lesquelles)
- [ ] Je veux que tu me proposes le schema et je le cree moi-meme
- [ ] Je veux que tu generes le SQL complet et je l'execute dans le SQL Editor Supabase

Auth :
- [ ] Auth Supabase (email/password)
- [ ] Auth Supabase + Google OAuth
- [ ] Clerk (comme prevu dans PROJECT.md)

Lance la Phase 1 (securite) en premier. Cree les API routes Vercel
serverless, migre les 11 fichiers frontend pour utiliser le proxy,
et supprime toutes les cles VITE_* sauf Supabase.
```

---

## Ordre d'execution

```
Phase 1 — Securite          (session 1)
    |
    v
Phase 2 — Supabase + Auth   (session 2)
    |
    v
Phase 3 — Bugs techniques   (session 2-3)
    |
    v
Phase 4 — Review visuelle   (session 3)
    |
    v
Phase 5 — Features IA       (session 4-5)
```

> La securite est NON-NEGOCIABLE avant tout deploiement.
> Sans la Phase 1, deployer le site = offrir ses cles API au public.

---

*Document genere le 13 avril 2026 — PostChef V2*
