# PROMPT — Coder l'application PostChef complète

## Contexte

Tu vas coder **PostChef**, une web app PWA SaaS complète pour les restaurants indépendants.
Tu as accès à 3 fichiers de référence qui définissent tout le projet :
- `PROJECT.md` — spec produit, stack technique, modèle éco, roadmap
- `DA.md` — direction artistique complète (palette, typo, composants, règles design)
- `mockup_v2.html` — prototype HTML interactif avec les 8 écrans navigables, c'est **la référence visuelle exacte** à reproduire fidèlement

**Lis ces 3 fichiers en entier avant de coder quoi que ce soit.**

---

## Ce que tu dois produire

Une application React complète, fonctionnelle, prête à être lancée avec `npm run dev`. Voici les livrables attendus :

### 1. Setup du projet
```
npm create vite@latest postchef -- --template react
cd postchef
npm install react-router-dom@6 zustand framer-motion
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind avec les tokens PostChef exactement comme dans DA.md :
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'pc-green':       '#1D9E75',
      'pc-green-dark':  '#0F6E56',
      'pc-green-mid':   '#5DCAA5',
      'pc-green-light': '#E1F5EE',
      'pc-text':        '#0a0a0a',
      'pc-muted':       '#6b7280',
      'pc-hint':        '#9ca3af',
      'pc-border':      '#e5e7eb',
      'pc-divider':     '#f3f4f6',
      'pc-bg':          '#f9fafb',
    },
    borderRadius: {
      'pill': '100px',
      'card': '20px',
      'elem': '16px',
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    },
    letterSpacing: {
      'hero':    '-0.05em',
      'title':   '-0.03em',
      'section': '-0.02em',
      'caps':    '0.08em',
    }
  }
}
```

Importe Inter depuis Google Fonts dans `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

---

### 2. Architecture des fichiers

```
src/
├── main.jsx
├── App.jsx                    ← routing principal
├── store/
│   └── useAppStore.js         ← Zustand : user, onboarding, posts
├── components/
│   ├── ui/
│   │   ├── Button.jsx         ← btn primaire + ghost
│   │   ├── Chip.jsx           ← chip sélectable
│   │   ├── Card.jsx           ← card standard + featured
│   │   ├── ProgressBar.jsx    ← barre onboarding
│   │   ├── ScaleSelector.jsx  ← sélecteur à échelles (couverts)
│   │   ├── MotifCard.jsx      ← carte objectif avec icône SVG
│   │   └── ChefAvatar.jsx     ← avatar mascotte Chef
│   ├── layout/
│   │   ├── AppShell.jsx       ← layout app avec sidebar/bottomnav
│   │   ├── BottomNav.jsx      ← navigation mobile (4 tabs)
│   │   └── Sidebar.jsx        ← navigation desktop
│   └── charts/
│       ├── CAChart.jsx        ← graphique CA vs fréquence (social proof)
│       └── StatsChart.jsx     ← graphique analytics dashboard
├── pages/
│   ├── onboarding/
│   │   ├── OnboardingRouter.jsx   ← gère les 8 étapes
│   │   ├── Step1Welcome.jsx
│   │   ├── Step2Restaurant.jsx
│   │   ├── Step3Clientele.jsx
│   │   ├── Step4Preferences.jsx
│   │   ├── Step5SocialProof.jsx
│   │   ├── Step6Loading.jsx
│   │   ├── Step7Notifications.jsx
│   │   └── Step8Paywall.jsx
│   ├── Dashboard.jsx
│   ├── Calendar.jsx
│   ├── Ideas.jsx
│   ├── Analytics.jsx
│   ├── Account.jsx
│   └── Landing.jsx            ← site marketing (page d'accueil publique)
├── hooks/
│   ├── useOnboarding.js
│   └── useGenerateIdeas.js    ← appel Claude API
└── utils/
    ├── claudePrompts.js       ← prompts système par contexte
    └── mockData.js            ← données fictives pour le dev
```

---

### 3. Routing (`App.jsx`)

```jsx
<Routes>
  {/* Public */}
  <Route path="/" element={<Landing />} />
  <Route path="/onboarding/*" element={<OnboardingRouter />} />

  {/* App (auth requise) */}
  <Route path="/app" element={<AppShell />}>
    <Route index element={<Dashboard />} />
    <Route path="calendar" element={<Calendar />} />
    <Route path="ideas" element={<Ideas />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="account" element={<Account />} />
  </Route>
</Routes>
```

---

### 4. Onboarding — reproduction EXACTE du mockup

**C'est la partie la plus critique. Reproduis pixel-perfect le mockup_v2.html.**

#### Architecture `OnboardingRouter.jsx`
- Gère un state `step` (1 à 8)
- Anime la transition entre étapes avec Framer Motion (`AnimatePresence` + slide)
- Sauvegarde chaque étape dans Zustand au fur et à mesure
- La barre de progression en haut reflète `(step / 8) * 100`%

#### Step 1 — Welcome
- Avatar Chef centré (80px, cercle vert clair, SVG chef)
- Bubble de dialogue : "Bonjour ! Je suis **Chef**, ton expert contenu restaurant. En 5 questions rapides, je construis ton calendrier de posts sur mesure."
- Titre bold : "Ton resto mérite d'être vu."
- Sous-titre muted
- Bouton primaire pleine largeur en bas : "Commencer — c'est gratuit"

#### Step 2 — Infos restaurant
- Champ texte : nom du restaurant
- Champ texte : ville
- Chips multi-select : type de cuisine (Française, Italienne, Japonaise, Méditerranéenne, Burger, Végétarien, Pizza, Autre)
- Champ texte optionnel : spécialité signature

#### Step 3 — Clientèle
- ScaleSelector "Combien de couverts par service ?" : [-20 petit | 20–50 moyen | 50–100 grand | 100+ très grand]
- Choice list multi-select clients : Familles et locaux / Touristes et visiteurs / Professionnels midi / Étudiants et jeunes
- MotifGrid objectif : Nouveaux clients / Fidéliser / Événements / Coulisses (icônes SVG distincts pour chaque)

#### Step 4 — Préférences contenu
- Chips plateformes : TikTok / Instagram / Facebook (multi-select)
- ScaleSelector fréquence : [1/sem | 2–3/sem | 4–5/sem | 6–7/sem]
- Chips style de contenu : Vidéo courte / Photo plat / Coulisses / Témoignages / Tendances

#### Step 5 — Social proof
- Bubble Chef : "Les données parlent d'elles-mêmes."
- CAChart : graphique barres "avant/après" par fréquence de posts (0–1, 2–3, 4–5, 6–7 posts/sem) — barres grises (avant) vs barres vertes (avec PostChef), axe Y en % gain CA
- 3 stat cards : +3h gagnées / ×4 portée organique / 850+ restos actifs
- 1 témoignage : Sophie R., Chez Sophie, Aix-en-Provence, 5 étoiles

#### Step 6 — Loading / Génération
- Spinner ring animé (border-top vert, reste vert clair)
- Titre : "Chef prépare ton plan..."
- Sous-titre : "Analyse de ta niche et de ta clientèle"
- Checklist qui se coche progressivement (avec délais JS) :
  1. Profil restaurant analysé (✓ immédiat)
  2. Tendances locales détectées (✓ après 800ms)
  3. Formats optimaux sélectionnés (✓ après 1600ms)
  4. Calendrier en cours... (✓ après 2400ms)
  5. Hooks IA générés... (✓ après 3200ms)
- Auto-avance vers Step 7 après 4000ms

#### Step 7 — Notifications
- Bubble Chef : "Active les notifications — je te rappelle tes posts chaque lundi matin."
- Aperçu notification mockée (frame téléphone stylisé avec notif PostChef)
- Bouton primaire : "Activer les notifications" → appelle `Notification.requestPermission()`
- Bouton ghost : "Peut-être plus tard"

#### Step 8 — Paywall
- Titre : "Ton plan est prêt."
- 3 plans (voir PROJECT.md pour les détails) :
  - Pro Annuel (featured, badge "Recommandé · -35%", pré-sélectionné)
  - Pro Mensuel
  - Starter gratuit 7 jours
- Bouton : "Essayer gratuitement 7 jours" → redirige vers `/app`
- Mention légale : "Sans engagement · Annulable à tout moment"

---

### 5. Pages de l'application

#### `Dashboard.jsx`
Header avec prénom du user + date du jour + nombre de posts à faire cette semaine.
- **Metric cards** (2 colonnes) : Posts planifiés cette semaine / Vues estimées (avec delta +X% vs semaine précédente)
- **Section "Calendrier de la semaine"** : liste des 3–5 posts planifiés (jour, type, description, plateformes en pill). Chaque item cliquable pour voir le brief complet.
- **Section "Idées IA du moment"** : 2 cards vertes avec hook + format + plateforme
- **Section "Veille tendances"** : 3 pills cliquables avec hashtags ou sons chauds du moment
- FAB (floating action button) vert en bas à droite : "+ Nouveau post"

#### `Calendar.jsx`
- Vue hebdomadaire par défaut (7 colonnes lun–dim)
- Chaque jour affiche les posts planifiés (card compacte avec type + plateforme pill)
- Toggle vue : Semaine / Mois
- Drag & drop des posts entre jours (utilise `@dnd-kit/core`)
- Statuts visuels : Idée (gris) / À tourner (amber) / Publié (vert)
- Bouton "+ Planifier" sur chaque jour vide
- Sidebar droite (ou modal sur mobile) : détail du post sélectionné avec brief complet, légende générée, bouton "Copier la légende"

#### `Ideas.jsx`
- Header : "Idées IA" + bouton "Générer" (appelle Claude API)
- **Filtre chips** : Tous / TikTok / Instagram / Facebook + filtre par type (Vidéo / Photo / Reel)
- **Liste d'idées** : cards avec hook accrocheur, format suggéré, plateforme, difficulté (Facile / Moyen), bouton "Ajouter au calendrier" + bouton "Générer une variante"
- **Section "Brief visuel"** : pour chaque idée sélectionnée, affiche angle de prise de vue recommandé, lumière, mise en scène, durée si vidéo
- Loading state élégant pendant la génération IA

#### `Analytics.jsx`
- **Header metric cards** (4 colonnes sur desktop, 2x2 sur mobile) :
  - Posts publiés ce mois / Vues estimées totales / Taux d'engagement / Meilleur jour de la semaine
- **StatsChart** : graphique lignes ou barres sur 4 semaines glissantes (vues par semaine)
- **Section "Top posts"** : ranking des 3 meilleurs posts avec type, plateforme, vues, engagement
- **Section "Recommandations Chef"** : 2–3 insights générés ("Tes posts le vendredi soir performent 2× mieux", "Les vidéos courtes génèrent 4× plus de vues que les photos")
- **Section "Meilleurs horaires"** : heatmap simple 7j × 4 créneaux (matin/midi/soir/nuit)

#### `Account.jsx`
Sections en cards séparées :
- **Profil restaurant** : nom, ville, type de cuisine, spécialité, photo de profil — tous éditables inline avec bouton "Sauvegarder"
- **Abonnement** : plan actuel affiché avec badge, date de renouvellement, bouton "Gérer l'abonnement" (Stripe portal)
- **Plateformes connectées** : liste TikTok / Instagram / Facebook avec statut connecté/déconnecté et bouton de connexion OAuth (prévu V2, afficher comme "Bientôt disponible" avec badge amber)
- **Préférences** : fréquence de posts souhaitée, style de contenu préféré, objectif principal — tous éditables
- **Notifications** : toggle push notifications on/off
- **Danger zone** : bouton "Supprimer mon compte" (confirmation modale requise)

#### `Landing.jsx`
Site marketing public, reproduit exactement l'écran "Site web" du mockup_v2.html, mais en version pleine page desktop/mobile :
- Navbar : logo PostChef + bouton "Essayer gratuitement"
- Hero : titre bold, tagline, CTA, 3 badges (Sans CB / 7 jours offerts / 850+ restos)
- Features grid 2×2 : Calendrier IA / Hooks viraux / Veille locale / Briefs visuels
- Section pricing : les 3 plans
- Témoignages : 2 avis
- Footer simple

---

### 6. Store Zustand (`useAppStore.js`)

```js
const useAppStore = create((set) => ({
  // Onboarding
  onboarding: {
    step: 1,
    completed: false,
    restaurant: {
      name: '',
      city: '',
      cuisineTypes: [],
      specialite: '',
      couverts: '20-50',
    },
    clientele: {
      profils: [],
      objectif: '',
    },
    preferences: {
      plateformes: [],
      frequence: '2-3/sem',
      styles: [],
    },
  },

  // User
  user: {
    id: null,
    prenom: '',
    email: '',
    plan: 'starter', // starter | pro_monthly | pro_annual
    planExpiry: null,
  },

  // Posts
  posts: [], // { id, day, type, description, plateformes, status, hook, legende, brief }

  // Ideas
  ideas: [],
  ideasLoading: false,

  // Actions
  setOnboardingStep: (step) => set((s) => ({ onboarding: { ...s.onboarding, step } })),
  updateRestaurant: (data) => set((s) => ({ onboarding: { ...s.onboarding, restaurant: { ...s.onboarding.restaurant, ...data } } })),
  updateClientele: (data) => set((s) => ({ onboarding: { ...s.onboarding, clientele: { ...s.onboarding.clientele, ...data } } })),
  updatePreferences: (data) => set((s) => ({ onboarding: { ...s.onboarding, preferences: { ...s.onboarding.preferences, ...data } } })),
  completeOnboarding: () => set((s) => ({ onboarding: { ...s.onboarding, completed: true } })),
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((s) => ({ posts: [...s.posts, post] })),
  setIdeas: (ideas) => set({ ideas }),
  setIdeasLoading: (loading) => set({ ideasLoading: loading }),
}))
```

---

### 7. Intégration Claude API (`useGenerateIdeas.js`)

```js
// hooks/useGenerateIdeas.js
import useAppStore from '../store/useAppStore'

export async function generateIdeas() {
  const { onboarding, setIdeas, setIdeasLoading } = useAppStore.getState()
  const { restaurant, clientele, preferences } = onboarding

  setIdeasLoading(true)

  const prompt = `Tu es Chef, un expert en contenu pour restaurants sur les réseaux sociaux.
  
Restaurant : ${restaurant.name} à ${restaurant.city}
Cuisine : ${restaurant.cuisineTypes.join(', ')}
Spécialité : ${restaurant.specialite}
Couverts : ${restaurant.couverts}
Clientèle : ${clientele.profils.join(', ')}
Objectif : ${clientele.objectif}
Plateformes : ${preferences.plateformes.join(', ')}
Fréquence : ${preferences.frequence}

Génère 6 idées de posts originaux et adaptés à ce restaurant. Pour chaque idée, fournis :
- hook : l'accroche (max 10 mots, percutante)
- format : type de contenu (Vidéo courte / Reel / Photo / Carrousel / Story)
- plateforme : plateforme principale recommandée
- difficulte : Facile / Moyen
- brief : description courte de comment réaliser le post (2-3 phrases)
- legende : légende prête à copier avec hashtags (max 150 mots)

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, tableau d'objets.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await res.json()
    const text = data.content[0].text
    const ideas = JSON.parse(text)
    setIdeas(ideas)
  } catch (e) {
    console.error('Erreur génération idées:', e)
  } finally {
    setIdeasLoading(false)
  }
}
```

Fais de même pour `generateCalendar()` qui génère 7 jours de posts planifiés, et `generateLegende(postContext)` pour une légende individuelle.

---

### 8. Navigation mobile (`BottomNav.jsx`)

4 onglets fixes en bas sur mobile :
```
[Dashboard] [Calendrier] [Idées] [Compte]
```
Icônes SVG simples. Onglet actif en vert (#1D9E75), inactifs en gris (#9ca3af).
Sur desktop, remplacer par une sidebar gauche 240px avec le même menu + logo en haut.

---

### 9. Données mock (`mockData.js`)

Pour le développement sans backend, génère des données réalistes :

```js
export const mockUser = {
  prenom: 'Marco',
  restaurant: 'La Trattoria',
  city: 'Marseille',
  plan: 'pro_annual',
}

export const mockPosts = [
  { id: '1', day: 'Lundi', type: 'Plat du jour en vidéo', description: 'Filme ton plat signature en 15s — lumière naturelle, sauce qui coule', plateformes: ['Instagram', 'TikTok'], status: 'a-tourner', hook: 'POV : tu prépares le meilleur plat de ta vie', legende: 'Voici notre spécialité du jour 🍝 Viens la goûter avant qu\'il n\'en reste plus ! #restaurant #marseille #foodie', brief: 'Filme en portrait, lumière naturelle côté fenêtre. Commence par une vue d\'ensemble du plat, puis zoom sur les détails. 15 secondes max.' },
  { id: '2', day: 'Mercredi', type: 'Coulisses cuisine', description: 'Prépa du matin, ambiance authentique', plateformes: ['Instagram'], status: 'idee', hook: 'La vraie cuisine, ça ressemble à ça', legende: 'Coulisses de notre cuisine ce matin 👨‍🍳 Chaque plat est préparé avec passion. #cuisiniers #restaurant #authentic', brief: 'Caméra posée sur le plan de travail. Filme la préparation sans trop t\'arranger. L\'authenticité est la clé.' },
  { id: '3', day: 'Vendredi', type: 'Avis client', description: 'Meilleur Google Review + photo du plat', plateformes: ['Instagram', 'TikTok'], status: 'publie', hook: 'Ce que nos clients disent de nous', legende: 'Merci à nos fidèles clients ❤️ C\'est pour vous qu\'on donne le meilleur chaque jour. #avis #restaurant #merci', brief: 'Screenshot stylisé de l\'avis Google (utilise Canva) + photo du plat mentionné en split screen.' },
]

export const mockIdeas = [
  { id: '1', hook: 'Ce que les touristes commandent vs les locaux', format: 'Vidéo courte', plateforme: 'TikTok', difficulte: 'Facile', brief: 'Film toi en train de pointer sur deux colonnes au tableau. Côté gauche "touristes", côté droit "habitués". Révèle les différences avec humour.', legende: 'Touristes vs locaux 😂 Vous êtes dans quelle catégorie ? #marseille #restaurant #touristes' },
  { id: '2', hook: 'POV : t\'as essayé notre spécialité pour la première fois', format: 'Reel', plateforme: 'Instagram', difficulte: 'Facile', brief: 'Demande à un client de réagir en filmant son visage au moment de la première bouchée. Authentique, non scénarisé.', legende: 'Cette réaction dit tout 🤩 Première fois à La Trattoria et déjà conquis ! #foodreaction #marseille' },
]

export const mockStats = {
  postsThisMonth: 12,
  totalViews: 8420,
  engagementRate: 4.2,
  bestDay: 'Vendredi',
  weeklyViews: [1200, 980, 1450, 1890, 2100, 1800, 2340],
}
```

---

### 10. PWA Setup

`public/manifest.json` :
```json
{
  "name": "PostChef",
  "short_name": "PostChef",
  "description": "Le copilote contenu des restaurants",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1D9E75",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Enregistre un Service Worker basique dans `main.jsx` pour la mise en cache offline.

---

### 11. Règles design absolues (depuis DA.md)

Applique ces règles sur CHAQUE composant, sans exception :

1. **Police** : Inter, importée depuis Google Fonts
2. **Pas de gradient** nulle part (ni boutons, ni backgrounds, ni cards)
3. **Pas de box-shadow** sur les cards (border 1px #f3f4f6 suffit)
4. **Boutons** : toujours border-radius 100px (pills), jamais carrés
5. **Cards** : border-radius 20px, padding 14–18px
6. **Titres** : font-weight 800–900, letter-spacing négatif, sentence case
7. **Couleurs** : max 2 ramps par écran, toujours référencer les tokens CSS
8. **Onboarding** : bouton "Peut-être plus tard" sur toutes les étapes optionnelles (notifs, paywall)
9. **Responsive** : mobile-first, padding horizontal 20px mobile, max-width 1200px desktop
10. **Accessibilité** : contraste > 4.5:1 WCAG AA sur tous les textes

---

### 12. Ce qu'il NE FAUT PAS faire

- Pas de publication automatique sur les réseaux (pas d'API TikTok/Meta pour poster)
- Pas de multi-utilisateurs / gestion d'équipe
- Pas de backend complet (utilise mockData.js pour le dev, prévoie les interfaces mais pas l'implémentation Supabase)
- Pas d'export PDF (prévu V2)
- Pas de dark patterns : pas de faux countdown, pas d'urgence artificielle
- Pas de Clerk/Stripe en dur dans le code MVP — crée des composants `<AuthGate>` et `<PaywallGate>` vides/mockés pour l'instant

---

### 13. Ordre de développement recommandé

1. Setup Vite + Tailwind + tokens + Inter
2. Composants UI de base (Button, Chip, Card, ProgressBar, ScaleSelector, MotifCard, ChefAvatar)
3. Store Zustand
4. Onboarding complet (8 étapes) — c'est la vitrine du produit
5. AppShell + BottomNav + Sidebar
6. Dashboard avec mockData
7. Calendar avec mockData
8. Ideas avec appel Claude API
9. Analytics avec mockData + StatsChart
10. Account
11. Landing page
12. PWA manifest + service worker

---

### Résultat attendu

Quand tu lances `npm run dev` :
- `/` → Landing page marketing
- `/onboarding` → Flow onboarding 8 étapes pixel-perfect vs mockup_v2.html
- `/app` → Dashboard avec données mock
- `/app/calendar` → Calendrier hebdo avec posts mock
- `/app/ideas` → Page idées avec bouton "Générer" qui appelle Claude API
- `/app/analytics` → Page stats avec graphiques
- `/app/account` → Page compte

L'app doit être **belle, fluide, professionnelle**. Chaque transition doit être animée (Framer Motion). Chaque état de chargement doit être géré. L'onboarding doit donner envie de continuer à chaque étape.

**Référence visuelle absolue : `mockup_v2.html`. Si tu as un doute sur un style, ouvre ce fichier et copie exactement.**
