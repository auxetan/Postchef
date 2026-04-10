# PostChef Studio — Plan de Développement : Virality Engine
> Prompt de développement détaillé · Version 1.0

---

## 🎯 Vision du Feature

**Objectif :** Ajouter une page `/app/studio` à PostChef permettant à un restaurateur de filmer quelques clips bruts sur son téléphone, et d'obtenir en 60 secondes un Reel vertical prêt à publier sur TikTok / Instagram — optimisé par une IA de viralité qui structure, monte, et écrit le texte pour maximiser la rétention et l'engagement.

**Ce que ce n'est PAS :** un éditeur vidéo. Le restaurateur ne touche à rien. Il uploade, il clique "Générer", il publie.

**Stack existante à respecter :**
- React 18 + Vite + Tailwind CSS + Framer Motion
- Zustand (store persisté avec localStorage)
- React Router v6 (`/app/studio` à ajouter dans `App.jsx`)
- Design System PostChef DA v2.0 (zéro gradient, zéro shadow, vert #1D9E75, font Inter)
- API Claude Haiku via `VITE_ANTHROPIC_KEY`
- API Creatomate via `VITE_CREATOMATE_KEY` (nouvelle)

---

## 📐 Architecture Générale

```
┌─────────────────────────────────────────────────────┐
│                   StudioPage.jsx                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ClipUploader │→ │ViralityEngine│→ │VideoPreview│  │
│  │  (Step 1)  │  │  (Step 2)    │  │  (Step 3)  │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────┘
         ↓                  ↓                ↓
   Upload clips        Claude LLM      Creatomate API
   (browser API)    (virality JSON)   (render MP4)
```

**Flow utilisateur (3 étapes, ~90 secondes total) :**
1. **Upload** — Filmer 1 à 4 clips (ou sélectionner depuis galerie). Durée max par clip : 30s.
2. **Analyse IA** — PostChef analyse les clips, génère un `ViralityDirective` JSON, affiche le plan de montage avec score de viralité.
3. **Rendu & Export** — Creatomate assemble la vidéo. L'utilisateur télécharge le MP4 et copie la caption.

---

## 🗂️ Fichiers à Créer / Modifier

### Nouveaux fichiers
```
src/
├── pages/
│   └── Studio.jsx                        ← Page principale (nouveau)
├── components/
│   └── features/
│       ├── ClipUploader.jsx              ← Upload multi-clips (nouveau)
│       ├── ViralityEngine.jsx            ← Analyse IA + affichage directive (nouveau)
│       ├── TemplateCard.jsx              ← Carte de sélection de template (nouveau)
│       └── VideoRenderStatus.jsx        ← Polling statut rendu Creatomate (nouveau)
├── hooks/
│   └── useCreatomate.js                  ← Hook API Creatomate (nouveau)
└── utils/
    └── viralityPrompt.js                 ← Prompt Claude pour la virality engine (nouveau)
```

### Fichiers existants à modifier
```
src/App.jsx                  ← Ajouter route /app/studio
src/components/layout/
  ├── Sidebar.jsx            ← Ajouter entrée "Studio" avec icône Clapperboard
  └── BottomNav.jsx          ← Ajouter onglet "Studio" (icône Film)
src/store/useAppStore.js     ← Ajouter slice studio + quota videoReel
src/utils/plans.js           ← Ajouter feature videoReelPerMonth (0 / 5 / 20)
```

---

## 📦 Store Zustand — Nouveau Slice `studio`

Dans `useAppStore.js`, ajouter après le slice `ideas` :

```javascript
// STUDIO SLICE
studio: {
  clips: [],           // [{ id, file, url, duration, thumbnail, analysisLabel }]
  directive: null,     // ViralityDirective JSON généré par Claude
  renderStatus: null,  // null | 'pending' | 'rendering' | 'done' | 'error'
  renderUrl: null,     // URL du MP4 final Creatomate
  renderId: null,      // ID du render Creatomate pour polling
  lastGenerated: null, // ISO date
},

// ACTIONS STUDIO
setClips: (clips) => set((s) => ({ studio: { ...s.studio, clips } })),
addClip: (clip) => set((s) => ({
  studio: { ...s.studio, clips: [...s.studio.clips, clip] }
})),
removeClip: (id) => set((s) => ({
  studio: { ...s.studio, clips: s.studio.clips.filter(c => c.id !== id) }
})),
setDirective: (directive) => set((s) => ({ studio: { ...s.studio, directive } })),
setRenderStatus: (status) => set((s) => ({ studio: { ...s.studio, renderStatus: status } })),
setRenderUrl: (url) => set((s) => ({ studio: { ...s.studio, renderUrl: url } })),
setRenderId: (id) => set((s) => ({ studio: { ...s.studio, renderId: id } })),
resetStudio: () => set((s) => ({
  studio: { clips: [], directive: null, renderStatus: null, renderUrl: null, renderId: null, lastGenerated: null }
})),
```

**Usage quota à ajouter dans `usage` :**
```javascript
videoReelUsedThisMonth: 0,   // reset 1er du mois
```

**Action :**
```javascript
incrementVideoReelUsed: () => set((s) => ({
  usage: { ...s.usage, videoReelUsedThisMonth: s.usage.videoReelUsedThisMonth + 1 }
})),
```

---

## 🔑 Feature Flags — `plans.js`

Ajouter dans chaque plan :

```javascript
starter:    { videoReelPerMonth: 0 }
pro_monthly: { videoReelPerMonth: 5 }
pro_annual:  { videoReelPerMonth: 20 }
```

Coût estimé par Reel généré : ~$0.07 (Creatomate 720p 15sec) + $0.003 (Claude Haiku) = **$0.073/reel**
→ Marge Pro Monthly sur cette feature : 98.7%

---

## 📄 `viralityPrompt.js` — Le Cœur Intelligent

```javascript
// src/utils/viralityPrompt.js

export function buildViralityPrompt({ restaurant, clips, platform, objective }) {
  const clipDescriptions = clips.map((c, i) =>
    `Clip ${i + 1}: durée ${c.duration.toFixed(1)}s — ${c.analysisLabel || 'contenu inconnu'}`
  ).join('\n');

  return `Tu es un expert en contenu viral pour les restaurants sur TikTok et Instagram Reels en 2025.

CONTEXTE RESTAURANT :
- Nom : ${restaurant.name}
- Ville : ${restaurant.city}
- Cuisine : ${restaurant.cuisineTypes?.join(', ') || 'Non précisé'}
- Spécialité : ${restaurant.specialite || 'Non précisée'}
- Style clientèle : ${restaurant.clientele?.profils?.join(', ') || 'généraliste'}
- Objectif : ${objective}

CLIPS DISPONIBLES :
${clipDescriptions}

PLATEFORME CIBLE : ${platform}

MISSION : Génère un "ViralityDirective" JSON optimisé pour la viralité maximale.
Les règles de viralité restaurant 2025 que tu dois appliquer :
1. Les 2 premières secondes doivent être un "pattern interrupt" visuel ou textuel
2. La durée idéale est 8-15 secondes (rétention maximale)
3. Le texte du hook doit apparaître dans les 2 premières secondes, court (max 8 mots)
4. Les coupes doivent suivre un rythme qui correspond à la musique (cuts every 2-4s)
5. Toujours finir par un CTA clair (réserver / passer / lien en bio)
6. Pour TikTok : favoriser les formats "reveal" et "asmr food"
7. Pour Instagram : favoriser les formats "aesthetic" et "behind the scenes"

Réponds UNIQUEMENT avec ce JSON valide, sans commentaires :

{
  "template": "dish_reveal|behind_scenes|daily_special|ambiance|asmr_moment",
  "hook_type": "pattern_interrupt|question|provocateur|reveal|asmr",
  "hook_text": "texte court et viral (max 8 mots)",
  "clip_order": [1, 2, 3],
  "clip_trims": [
    { "clip_index": 0, "start": 0.0, "end": 3.5 },
    { "clip_index": 1, "start": 1.0, "end": 4.0 }
  ],
  "text_overlays": [
    { "text": "...", "timing_start": 0, "timing_end": 2.5, "position": "top|center|bottom", "style": "bold_white|subtle_dark|accent_green" },
    { "text": "📍 ${restaurant.city}", "timing_start": 4, "timing_end": 7, "position": "bottom", "style": "subtle_dark" },
    { "text": "Réservez 👆 lien en bio", "timing_start": 9, "timing_end": 12, "position": "center", "style": "bold_white" }
  ],
  "transition_style": "hard_cut|smooth_fade|zoom_transition",
  "music_mood": "warm_upbeat|energetic|chill_ambient|asmr_natural",
  "music_bpm_range": "slow_60-80|medium_90-110|fast_120-140",
  "total_duration": 12,
  "virality_score": 85,
  "virality_reasons": [
    "Reason 1 why this will perform well",
    "Reason 2"
  ],
  "caption": "Caption complète prête à publier (150 chars max, avec emojis)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`;
}
```

---

## 🎬 Templates Creatomate — Structure JSON

Créer 5 templates dans le dashboard Creatomate (une fois l'API key configurée). Pour chaque template, voici la structure JSON à envoyer à l'API de rendu :

### Template `dish_reveal` (le plus viral)
```javascript
// src/hooks/useCreatomate.js

export function buildCreatomatePayload(directive, clips) {
  // clips = tableau d'URLs signées après upload vers Cloudinary ou directement Creatomate

  return {
    template_id: TEMPLATE_IDS[directive.template], // ID Creatomate du template
    modifications: {
      // Clips
      ...clips.reduce((acc, clip, i) => ({
        ...acc,
        [`clip_${i + 1}_source`]: clip.uploadedUrl,
        [`clip_${i + 1}_trim_start`]: directive.clip_trims[i]?.start || 0,
        [`clip_${i + 1}_trim_end`]: directive.clip_trims[i]?.end || clip.duration,
      }), {}),

      // Textes
      hook_text: directive.hook_text,
      location_text: directive.text_overlays.find(o => o.text.includes('📍'))?.text || '',
      cta_text: directive.text_overlays.at(-1)?.text || 'Réservez 👆',

      // Audio (mood → track ID mappé dans une table de constantes)
      music_track: MUSIC_TRACKS[directive.music_mood],

      // Durée totale
      duration: directive.total_duration,
    },
    output_format: 'mp4',
    frame_rate: 30,
    width: 1080,
    height: 1920,  // 9:16 vertical
  };
}

const TEMPLATE_IDS = {
  dish_reveal:    'tmpl_xxxxxxxxxx',   // À remplir après création dans Creatomate
  behind_scenes:  'tmpl_xxxxxxxxxx',
  daily_special:  'tmpl_xxxxxxxxxx',
  ambiance:       'tmpl_xxxxxxxxxx',
  asmr_moment:    'tmpl_xxxxxxxxxx',
};

const MUSIC_TRACKS = {
  warm_upbeat:    'track_warm_001',    // Musiques libres de droits à charger dans Creatomate
  energetic:      'track_energetic_001',
  chill_ambient:  'track_chill_001',
  asmr_natural:   null,               // Pas de musique, sons naturels du clip
};
```

**Hook API Creatomate :**
```javascript
// src/hooks/useCreatomate.js

export function useCreatomate() {
  const setRenderStatus = useAppStore(s => s.setRenderStatus);
  const setRenderId = useAppStore(s => s.setRenderId);
  const setRenderUrl = useAppStore(s => s.setRenderUrl);

  const startRender = async (directive, clips) => {
    setRenderStatus('pending');
    try {
      const payload = buildCreatomatePayload(directive, clips);
      const res = await fetch('https://api.creatomate.com/v1/renders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CREATOMATE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setRenderId(data[0].id);
      setRenderStatus('rendering');
      return data[0].id;
    } catch (e) {
      setRenderStatus('error');
      throw e;
    }
  };

  // Polling du statut (appeler toutes les 3 secondes)
  const pollRender = async (renderId) => {
    const res = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_CREATOMATE_KEY}` }
    });
    const data = await res.json();
    if (data.status === 'succeeded') {
      setRenderUrl(data.url);
      setRenderStatus('done');
    } else if (data.status === 'failed') {
      setRenderStatus('error');
    }
    return data.status;
  };

  return { startRender, pollRender };
}
```

---

## 🖥️ `Studio.jsx` — Page Principale

```jsx
// src/pages/Studio.jsx
// Structure en 3 étapes linéaires (wizard)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClipUploader from '../components/features/ClipUploader';
import ViralityEngine from '../components/features/ViralityEngine';
import VideoRenderStatus from '../components/features/VideoRenderStatus';
import { useAppStore } from '../store/useAppStore';
import { getFeature } from '../utils/plans';

export default function Studio() {
  const [step, setStep] = useState(1); // 1: Upload | 2: Directive | 3: Render
  const plan = useAppStore(s => s.user.plan);
  const reelUsed = useAppStore(s => s.usage.videoReelUsedThisMonth);
  const reelMax = getFeature(plan, 'videoReelPerMonth');
  const quotaReached = reelMax !== Infinity && reelUsed >= reelMax;

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F7F7F5] border-b border-[#E8E8E6] px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-[26px] font-[800] text-[#0A0A0A] tracking-[-0.04em]">Studio</h1>
            <p className="text-[13px] text-[#737373] mt-0.5">Transforme tes clips en Reels viraux</p>
          </div>
          {/* Quota badge */}
          {reelMax !== Infinity && (
            <div className="text-[11px] font-[700] uppercase tracking-[0.10em] text-[#737373] border-b border-[#E8E8E6] pb-0.5">
              {reelUsed}/{reelMax} reels ce mois
            </div>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 mt-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <ClipUploader
              key="upload"
              onComplete={() => setStep(2)}
              quotaReached={quotaReached}
            />
          )}
          {step === 2 && (
            <ViralityEngine
              key="directive"
              onBack={() => setStep(1)}
              onRenderStart={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <VideoRenderStatus
              key="render"
              onNewVideo={() => { /* resetStudio + back to step 1 */ setStep(1); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }) {
  const steps = ['Tes clips', 'Analyse IA', 'Ton Reel'];
  return (
    <div className="flex items-center justify-center gap-3 px-6 pt-5">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === currentStep;
        const done = n < currentStep;
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-[700] transition-colors ${
              done ? 'bg-[#1D9E75] text-white' :
              active ? 'bg-[#0A0A0A] text-white' :
              'bg-[#E8E8E6] text-[#A3A3A3]'
            }`}>{done ? '✓' : n}</div>
            <span className={`text-[12px] font-[500] ${active ? 'text-[#0A0A0A]' : 'text-[#A3A3A3]'}`}>{label}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[#E8E8E6] mx-1" />}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 📱 `ClipUploader.jsx`

```jsx
// src/components/features/ClipUploader.jsx
// Gestion upload 1-4 clips vidéo depuis mobile/desktop

// FONCTIONNALITÉS :
// - Input file accept="video/*" multiple (max 4 fichiers)
// - Drag & drop zone
// - Preview thumbnail généré via <video> + canvas.toDataURL()
// - Affichage durée de chaque clip (via video.duration)
// - Suppression individuelle de clip
// - Bouton "Analyser mes clips" → déclenche l'étape 2

// GÉNÉRATION DU THUMBNAIL :
// Pour chaque clip uploadé :
//   const video = document.createElement('video');
//   video.src = URL.createObjectURL(file);
//   video.currentTime = 0.5;
//   video.onseeked = () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = 180; canvas.height = 320;
//     canvas.getContext('2d').drawImage(video, 0, 0, 180, 320);
//     resolve(canvas.toDataURL('image/jpeg', 0.7));
//   };

// ANALYSE BASIQUE (label automatique basé sur la durée) :
// < 3s → "Plan détail"
// 3-8s → "Plan principal"
// > 8s → "Séquence longue"

// STATE LOCAL :
// - clips: [{ id, file, url, duration, thumbnail, analysisLabel }]
// - dragging: boolean

// UX :
// - Zone de drop avec animation Framer Motion sur drag
// - Chaque clip = card avec thumbnail 9:16, durée badge, croix de suppression
// - Ordre drag-n-drop (optionnel V2)
// - CTA disabled si 0 clips, enabled dès 1 clip
// - Message "Astuce : 2-4 clips courts donnent les meilleurs résultats"
```

---

## 🧠 `ViralityEngine.jsx`

```jsx
// src/components/features/ViralityEngine.jsx
// Le cerveau : analyse Claude + affichage du ViralityDirective

// ÉTATS INTERNES :
// - status: 'idle' | 'analyzing' | 'ready' | 'error'
// - platform: 'TikTok' | 'Instagram'
// - objective: 'notoriété' | 'réservations' | 'plat du jour' | 'ambiance'

// FLOW :
// 1. Affiche sélecteur plateforme + objectif (2 chips each)
// 2. Bouton "Lancer l'analyse IA" → appel Claude
// 3. Pendant l'analyse : animation avec messages progressifs :
//    "Analyse de tes clips..." (0-1s)
//    "Identification des meilleures séquences..." (1-2s)
//    "Calcul du score de viralité..." (2-3s)
//    "Construction du montage optimal..." (3-4s)
// 4. Affichage du ViralityDirective avec :
//    - Score de viralité (grand nombre coloré)
//    - Template sélectionné (avec icône)
//    - Hook text (grande typo bold)
//    - Plan de montage (ordre clips avec timecodes)
//    - Textes overlay (liste avec timing)
//    - Humeur musicale (badge)
//    - Caption + hashtags (copiables)
// 5. Bouton "Générer mon Reel" → upload clips vers Creatomate + startRender

// APPEL CLAUDE :
// const response = await fetch('https://api.anthropic.com/v1/messages', {
//   method: 'POST',
//   headers: { 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
//   body: JSON.stringify({
//     model: 'claude-haiku-4-5-20251001',
//     max_tokens: 1024,
//     messages: [{ role: 'user', content: buildViralityPrompt({ restaurant, clips, platform, objective }) }]
//   })
// });
// const json = JSON.parse(response.content[0].text);
// setDirective(json);

// AFFICHAGE DU VIRALITY SCORE :
// Score > 80 → vert #1D9E75 + label "Potentiel viral élevé"
// Score 60-80 → amber + label "Bon potentiel"
// Score < 60 → gris + label "Potentiel modéré"

// CARTE "PLAN DE MONTAGE" :
// Affiche pour chaque clip dans directive.clip_order :
//   [miniature clip] [Clip N] [trim_start → trim_end] [durée]
// Avec flèches de séquence entre les clips
```

---

## ⏳ `VideoRenderStatus.jsx`

```jsx
// src/components/features/VideoRenderStatus.jsx
// Polling du rendu Creatomate + affichage résultat

// ÉTATS :
// - pending : "Préparation du rendu..."
// - rendering : progress bar animée + "Assemblage de ton Reel... (~30s)"
// - done : Preview vidéo + boutons download/copy caption
// - error : Message d'erreur + bouton retry

// POLLING :
// useEffect(() => {
//   if (renderId && renderStatus === 'rendering') {
//     const interval = setInterval(async () => {
//       const status = await pollRender(renderId);
//       if (status === 'succeeded' || status === 'failed') clearInterval(interval);
//     }, 3000);
//     return () => clearInterval(interval);
//   }
// }, [renderId, renderStatus]);

// ÉCRAN "DONE" :
// - <video> avec src={renderUrl} controls loop autoPlay muted (preview)
// - Bouton "Télécharger le Reel" → download via <a href={renderUrl} download>
// - Bouton "Copier la caption" → clipboard
// - Bouton "Copier les hashtags" → clipboard
// - Score de viralité rappelé
// - Bouton "Créer un nouveau Reel" → resetStudio()
// - Bouton "Ajouter au calendrier" → addPost() dans le store

// DESIGN :
// Fond blanc, rounded-2xl, border border-[#E8E8E6]
// Le player vidéo fait toute la largeur, ratio 9:16 (max-height: 60vh)
```

---

## 🗺️ Navigation — Modifications Requises

### `App.jsx` — Ajouter la route
```jsx
import Studio from './pages/Studio';

// Dans <Route path="/app" element={<AppShell />}>
<Route path="studio" element={<Studio />} />
```

### `Sidebar.jsx` — Desktop
```jsx
// Ajouter dans la liste des navItems (après "Idées", avant "Tendances") :
{ path: '/app/studio', label: 'Studio', icon: Clapperboard }
// Import: import { Clapperboard } from 'lucide-react'
```

### `BottomNav.jsx` — Mobile
```jsx
// Ajouter onglet "Studio" avec icône Film
// Remplacer ou s'assurer que 5 onglets tiennent (réduire les labels si nécessaire)
// Onglets suggérés mobile : Accueil | Calendrier | Studio | Idées | Compte
```

---

## ⚙️ Variables d'Environnement

Ajouter dans `.env.local` :
```
VITE_ANTHROPIC_KEY=sk-ant-...      # Déjà existant
VITE_CREATOMATE_KEY=...            # Nouveau — récupérer sur https://creatomate.com/
```

---

## 📋 Ordre d'Implémentation Recommandé

### Sprint 1 — Fondations (Jour 1-2)
- [ ] Ajouter slice `studio` dans `useAppStore.js`
- [ ] Ajouter `videoReelPerMonth` dans `plans.js`
- [ ] Créer `viralityPrompt.js` avec `buildViralityPrompt()`
- [ ] Créer `useCreatomate.js` avec `startRender()` et `pollRender()`
- [ ] Créer route `/app/studio` dans `App.jsx`
- [ ] Créer `Studio.jsx` avec step indicator uniquement (UI shell)

### Sprint 2 — Upload & Analyse (Jour 3-4)
- [ ] Créer `ClipUploader.jsx` avec upload, thumbnail, durée
- [ ] Tester thumbnail generation via canvas
- [ ] Créer `ViralityEngine.jsx` — sélecteur platform/objectif
- [ ] Intégrer appel Claude avec `buildViralityPrompt()`
- [ ] Affichage du JSON directive (debug d'abord, UI propre ensuite)

### Sprint 3 — Rendu Creatomate (Jour 5-7)
- [ ] Créer compte Creatomate + récupérer API key
- [ ] Construire les 5 templates dans l'éditeur Creatomate
- [ ] Charger 4-5 musiques libres de droits (warm_upbeat, energetic, chill, asmr)
- [ ] Mapper `TEMPLATE_IDS` et `MUSIC_TRACKS` dans `useCreatomate.js`
- [ ] Tester le rendu end-to-end avec clips réels
- [ ] Créer `VideoRenderStatus.jsx` avec polling + preview

### Sprint 4 — Polish & Quota (Jour 8-9)
- [ ] Ajouter navigation (Sidebar + BottomNav)
- [ ] Gestion des quotas (gate derrière plan Pro)
- [ ] États d'erreur (upload échoué, render failed, quota atteint)
- [ ] Animations Framer Motion sur transitions d'étapes
- [ ] Test sur mobile (upload depuis caméra)

### Sprint 5 — Validation (Jour 10)
- [ ] Test end-to-end sur téléphone réel
- [ ] Tester avec 1, 2, 3 et 4 clips
- [ ] Tester les 5 templates
- [ ] Vérifier que les MP4 sont bien 9:16 et lisibles Instagram/TikTok
- [ ] Mesurer temps de rendu moyen

---

## 💡 Améliorations V2 (Post-lancement)

1. **Détection automatique des scènes** — Envoyer la thumbnail de chaque clip à Claude Vision pour qu'il identifie "plat", "cuisine", "salle", "chef", "texture" → meilleure analyse
2. **Trending sounds** — Intégrer un endpoint qui retourne les top sons TikTok de la semaine et les suggère dans le directive
3. **A/B testing de hooks** — Générer 3 variantes de hook et laisser l'utilisateur choisir
4. **Auto-publish** — Via TikTok API et Instagram Graph API (déjà prévu en V2 PostChef)
5. **Analytics de performance** — Tracker les vues/engagement par Reel généré avec PostChef

---

## 🧮 Unit Economics du Feature Studio

| Métrique | Valeur |
|---|---|
| Coût rendu Creatomate (720p, 15sec) | ~$0.07 |
| Coût Claude Haiku (analyse) | ~$0.003 |
| **Coût total par Reel généré** | **~$0.073** |
| Revenu par utilisateur Pro Monthly | €29/mois |
| Quota Pro Monthly | 5 reels/mois |
| Coût infra max (5 reels) | **~$0.37** |
| **Marge sur cette feature** | **~98.7%** |

---

*Document généré le 11 avril 2026 — PostChef Studio V1.0*
