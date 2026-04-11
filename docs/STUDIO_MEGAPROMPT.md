# MEGAPROMPT — Studio PostChef, parité Opus Clip réelle

> Prompt autonome pour agent IA. Copie-colle intégralement dans une nouvelle session.
> Objectif : passer la feature `Studio` d'un prototype UI à un pipeline de production vidéo fonctionnel, aligné sur Opus Clip.

---

## 0. Contexte projet

**Repo** : `auxetan/Postchef` (GitHub), branche `main`
**Stack** : React 18 + Vite 5 + Tailwind + Zustand + Framer Motion + React Router. Pas de backend. SPA déployée sur Vercel.
**Langue UI** : français. Commentaires et UI en français, variables en anglais.

**Working directory** : utilise un git worktree pour tes modifications. Ne touche JAMAIS au répertoire racine du repo. Commits atomiques par phase.

**Fichiers clés existants à connaître** :

```
src/pages/Studio.jsx                         — entrée pipeline 3 étapes (clips → analyse → render)
src/components/features/ClipUploader.jsx     — upload clips + génération 3 frames base64/clip
src/components/features/ViralityEngine.jsx   — orchestrateur analyse Claude + édition directive
src/components/features/TimelinePreview.jsx  — timeline visuelle
src/components/features/MusicSelector.jsx    — sélecteur musique
src/components/features/HookVariantPicker.jsx — choix hook A/B/C
src/components/features/ViralityAxesScore.jsx — score 4 axes (Hook/Flow/Value/Trend)
src/components/features/CaptionStylePicker.jsx — style + langue captions
src/components/features/BrandKitPicker.jsx   — logo/couleurs/font
src/components/features/BRollSlots.jsx       — B-roll IA (génère des IMAGES DALL-E aujourd'hui)
src/components/features/ViralityTips.jsx     — suggestions basées sur axes
src/components/features/VideoRenderStatus.jsx — polling render
src/components/features/ReelHistory.jsx      — historique des reels créés
src/hooks/useCreatomate.js                   — hook API Creatomate (CASSÉ, cf §2)
src/utils/viralityPrompt.js                  — prompt Claude avec Vision multimodale
src/utils/uploadClip.js                      — upload vers CDN (vérifier impl)
src/store/useAppStore.js                     — store Zustand persisté (contient studio, brandKit, reels)
```

**Dépendances déjà installées** : `framer-motion`, `react`, `react-dom`, `react-router-dom`, `zustand`, `tailwindcss`. Tu as le droit d'ajouter : `remotion`, aucun autre SDK lourd sans justification.

---

## 1. Décisions techniques arrêtées — NE PAS REMETTRE EN QUESTION

1. **Rendu vidéo** → bascule de Creatomate vers **Shotstack API** (`https://api.shotstack.io/edit/v1`).
   - Raison : Shotstack ne requiert pas de templates pré-créés, il accepte une JSON edit décrivant la timeline complète. Parfait pour une génération dynamique.
   - L'env Sandbox est gratuite (`https://api.shotstack.io/edit/stage`).
   - Clé env : `VITE_SHOTSTACK_KEY`, host env : `VITE_SHOTSTACK_HOST=https://api.shotstack.io/edit/v1` (ou `/stage`).

2. **Transcription (ASR)** → **OpenAI Whisper API** (`https://api.openai.com/v1/audio/transcriptions`).
   - Modèle `whisper-1`, `response_format: verbose_json`, `timestamp_granularities: ["word"]`.
   - Clé env : `VITE_OPENAI_KEY` (déjà utilisée pour DALL-E). Le même OPENAI_KEY couvre Whisper + DALL-E.
   - Coût : $0.006/min — acceptable.
   - Supporte 50+ langues détectées automatiquement.

3. **Stock footage** → **Pexels Videos API** (`https://api.pexels.com/videos/search`).
   - Gratuit, clé env : `VITE_PEXELS_KEY`.
   - Retourne URLs MP4 directement utilisables par Shotstack.

4. **Upload CDN** → **Cloudinary unsigned upload** (preset unsigned) ou **Shotstack Ingest API** (`/ingest/sources`).
   - Préférence : Shotstack Ingest si disponible dans le plan, sinon Cloudinary.
   - Clé env : `VITE_CLOUDINARY_CLOUD`, `VITE_CLOUDINARY_PRESET` (si Cloudinary).

5. **Auto-post** → stubs seulement. Phase 5 documentée mais PAS implémentée dans ce chantier (requiert dev accounts TikTok + Meta Business, hors scope d'un AI agent solo).

6. **Long-video mode** (1 long clip → N shorts) → NON. PostChef garde son modèle "2-4 clips courts uploadés". Opus Clip et PostChef convergent sur les features mais pas sur le workflow d'entrée. Ce choix est final.

7. **Pas de backend** → toutes les API calls sont browser-side. Accepter les `dangerouslyAllowBrowser` pour les clés IA. Ajouter un warning UI si on est en prod.

8. **Framework captions** → kinetic = titres Shotstack générés word-by-word via timestamps Whisper. Classic/Minimal = sous-titres en blocs de phrases.

---

## 2. État actuel audité — ce qui marche, ce qui est cassé

### Marche réellement (ne pas casser)
- Upload clips + extraction 3 frames → `ClipUploader.jsx`
- Appel Claude Vision multimodal (directive JSON) → `viralityPrompt.js` + `ViralityEngine.jsx:runAnalysis`
- Score multi-axes, hook variants, multi-highlights, ClipAnything, Virality Tips → tout est fonctionnel côté analyse
- Store Zustand persisté avec slice `studio`, `brandKit`, `reels`
- UI du picker de musique, brand kit, caption style

### Cassé / placeholder / UI-only (à réparer)
- `useCreatomate.js:9-13` : `TEMPLATE_IDS = { dish_reveal: 'tmpl_xxxxxxxxxx', ... }` — placeholders, aucun render ne peut aboutir
- Le `caption_style`, `brand_logo`, `broll_*_source` envoyés au payload Creatomate partent dans le vide
- `BRollSlots.jsx` génère des IMAGES statiques DALL-E, pas de la vidéo
- `CaptionStylePicker` : le dropdown langue n'a aucun effet réel (pas d'ASR)
- `BrandKitPicker` : logo/couleur stockés mais jamais appliqués à la sortie
- `uploadClip.js` : vérifier si l'implémentation pointe vers une vraie CDN ou retourne les blob URLs

### Absent complètement
- Transcription audio (ASR) — coeur d'Opus Clip
- Stock video library
- Auto-reframe (clips déjà 9:16 à l'upload PostChef, faible priorité)
- Scheduler / auto-post

---

## 3. Variables d'environnement à ajouter

Mets à jour `.env.example` avec exactement ceci (garder les clés existantes) :

```env
# PostChef — Variables d'environnement

# Anthropic (Claude)
VITE_ANTHROPIC_KEY=sk-ant-...

# OpenAI (Whisper ASR + DALL-E images)
VITE_OPENAI_KEY=sk-...

# Shotstack (rendu vidéo)
VITE_SHOTSTACK_KEY=...
VITE_SHOTSTACK_HOST=https://api.shotstack.io/edit/stage

# Pexels (stock footage)
VITE_PEXELS_KEY=...

# Cloudinary (upload CDN — optionnel si Shotstack Ingest dispo)
VITE_CLOUDINARY_CLOUD=...
VITE_CLOUDINARY_PRESET=...
```

---

## 4. Plan d'exécution — 5 phases, 1 commit par phase

Chaque phase est **atomique**. Si une phase ne compile pas (`npm run build`), ne passe pas à la suivante. Fais des checkpoints avec `git commit` après chaque phase. Utilise `TodoWrite` pour tracker.

### Règles absolues

- ❌ **NE PAS** refactorer du code qui marche déjà. Ne touche `ClipUploader`, `HookVariantPicker`, `MusicSelector`, `ViralityAxesScore`, `ViralityTips` que si c'est strictement nécessaire.
- ❌ **NE PAS** ajouter de shim de backward compat. Tu peux supprimer des champs morts.
- ❌ **NE PAS** ajouter de docs markdown, readme, ou commentaires explicatifs hors des commentaires JSDoc techniques.
- ❌ **NE PAS** créer d'helpers génériques "au cas où". Code uniquement ce qui est consommé par une autre partie du code.
- ❌ **NE PAS** installer de dépendances non listées dans §0.
- ✅ **UTILISE** la fetch API native, pas axios.
- ✅ **UTILISE** les patterns du store existant (`set((s) => ...)`).
- ✅ **UTILISE** les classes Tailwind déjà en place (`pc-surface`, `pc-border`, `pc-ink`, `pc-green`, etc.).
- ✅ **TOUJOURS** vérifier que `npm run build` passe avant commit.
- ✅ **RESPECTE** le code style JSX existant (apostrophes françaises escapées avec `"..."` ou `\'`).

---

### PHASE 1 — Shotstack : débloquer le rendu

**Objectif** : remplacer `useCreatomate.js` par un pipeline Shotstack fonctionnel qui produit une vidéo MP4 visible.

**Créer** : `src/utils/shotstack.js`

```js
/**
 * Shotstack — build edit JSON, POST /render, poll /render/:id
 * Doc : https://shotstack.io/docs/api/
 */

const HOST = import.meta.env.VITE_SHOTSTACK_HOST || 'https://api.shotstack.io/edit/stage'
const KEY  = import.meta.env.VITE_SHOTSTACK_KEY

/**
 * Construit une edit Shotstack 9:16 à partir d'une directive PostChef.
 *
 * @param {Object} params
 * @param {Object} params.directive       — ViralityDirective (Claude output)
 * @param {Array}  params.clips           — clips uploadés avec { uploadedUrl, duration }
 * @param {Array}  params.wordTimings     — [{ word, start, end }] pour captions kinetic (optionnel)
 * @param {Array}  params.brollVideos     — [{ afterClip, url, duration }] pour B-roll vidéo (optionnel)
 * @param {Object} params.brandKit        — { logoDataUrl, primaryColor }
 * @returns {Object} edit JSON prête à être envoyée
 */
export function buildShotstackEdit({ directive, clips, wordTimings = [], brollVideos = [], brandKit }) {
  const OUTPUT_W = 1080
  const OUTPUT_H = 1920

  // Ordre final des clips
  const ordered = (directive.clip_order || clips.map((_, i) => i + 1))
    .map((n) => clips[n - 1])
    .filter(Boolean)

  // Calculer les timestamps absolus de chaque clip sur la timeline
  let cursor = 0
  const videoClips = []
  const clipAbsoluteTimes = new Map() // clip_index → { start, end } sur la timeline

  ordered.forEach((clip) => {
    const clipIdx = clips.indexOf(clip)
    const trim = directive.clip_trims?.find((t) => t.clip_index === clipIdx)
    const trimStart = trim?.start ?? 0
    const trimEnd = trim?.end ?? clip.duration
    const length = trimEnd - trimStart

    videoClips.push({
      asset: {
        type: 'video',
        src: clip.uploadedUrl,
        trim: trimStart,
      },
      start: cursor,
      length,
      fit: 'cover',
    })

    clipAbsoluteTimes.set(clipIdx, { start: cursor, end: cursor + length })
    cursor += length

    // Insérer les B-roll vidéo positionnés après ce clip
    brollVideos
      .filter((b) => b.afterClip === clipIdx)
      .forEach((b) => {
        videoClips.push({
          asset: { type: 'video', src: b.url, trim: 0 },
          start: cursor,
          length: b.duration,
          fit: 'cover',
          effect: 'zoomIn',
        })
        cursor += b.duration
      })
  })

  const totalDuration = cursor

  // Track captions (kinetic word-by-word OU blocks phrases)
  const captionTrack = buildCaptionTrack({
    style: directive.caption_style,
    wordTimings,
    hookText: directive.hook_text,
    textOverlays: directive.text_overlays,
    totalDuration,
    brandKit,
  })

  // Track logo (bas-droite persistant si fourni)
  const logoTrack = brandKit?.logoDataUrl
    ? [{
        asset: { type: 'image', src: brandKit.logoDataUrl },
        start: 0,
        length: totalDuration,
        position: 'bottomRight',
        offset: { x: -0.03, y: 0.03 },
        scale: 0.15,
      }]
    : []

  // Musique de fond (si URL fournie dans directive.music_track_url)
  const soundtrack = directive.music_track_url
    ? { src: directive.music_track_url, effect: 'fadeInFadeOut', volume: 0.35 }
    : undefined

  return {
    timeline: {
      background: '#000000',
      ...(soundtrack && { soundtrack }),
      tracks: [
        { clips: captionTrack },  // top: captions
        { clips: logoTrack },     // middle: logo
        { clips: videoClips },    // bottom: main video
      ],
    },
    output: {
      format: 'mp4',
      size: { width: OUTPUT_W, height: OUTPUT_H },
      fps: 30,
    },
  }
}

/** Génère les clips captions selon le style choisi */
function buildCaptionTrack({ style, wordTimings, hookText, textOverlays, totalDuration, brandKit }) {
  const primary = brandKit?.primaryColor || '#1D9E75'

  if (style === 'none') return []

  // KINETIC : un title clip par mot avec timing précis Whisper
  if (style === 'kinetic' && wordTimings.length > 0) {
    return wordTimings.map((w) => ({
      asset: {
        type: 'title',
        text: w.word.toUpperCase(),
        style: 'future',
        color: '#ffffff',
        background: primary,
        size: 'large',
        position: 'center',
      },
      start: w.start,
      length: Math.max(0.15, w.end - w.start),
      transition: { in: 'zoom', out: 'fade' },
    }))
  }

  // CLASSIC : blocs de sous-titres groupés par ~3 mots
  if (style === 'classic' && wordTimings.length > 0) {
    const BLOCK_WORDS = 3
    const blocks = []
    for (let i = 0; i < wordTimings.length; i += BLOCK_WORDS) {
      const chunk = wordTimings.slice(i, i + BLOCK_WORDS)
      blocks.push({
        text: chunk.map((w) => w.word).join(' '),
        start: chunk[0].start,
        length: chunk[chunk.length - 1].end - chunk[0].start,
      })
    }
    return blocks.map((b) => ({
      asset: {
        type: 'title',
        text: b.text,
        style: 'minimal',
        color: '#ffffff',
        size: 'medium',
        position: 'bottom',
      },
      start: b.start,
      length: b.length,
    }))
  }

  // MINIMAL : overlays Claude seulement (pas de transcription)
  if (style === 'minimal' || !wordTimings.length) {
    return (textOverlays || []).map((o) => ({
      asset: {
        type: 'title',
        text: o.text,
        style: o.style === 'bold_white' ? 'future' : 'minimal',
        color: '#ffffff',
        size: 'medium',
        position: o.position || 'center',
      },
      start: o.timing_start,
      length: Math.max(0.5, o.timing_end - o.timing_start),
    }))
  }

  return []
}

/** POST /render et retourne l'ID */
export async function submitRender(edit) {
  const res = await fetch(`${HOST}/render`, {
    method: 'POST',
    headers: {
      'x-api-key': KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(edit),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shotstack submit failed: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.response.id
}

/** GET /render/:id — retourne { status, url } */
export async function pollRender(renderId) {
  const res = await fetch(`${HOST}/render/${renderId}`, {
    headers: { 'x-api-key': KEY },
  })
  if (!res.ok) throw new Error(`Shotstack poll failed: ${res.status}`)
  const data = await res.json()
  return {
    status: data.response.status, // queued|fetching|rendering|saving|done|failed
    url: data.response.url || null,
    error: data.response.error || null,
  }
}
```

**Créer** : `src/hooks/useShotstack.js` (remplace `useCreatomate.js`)

```js
import { useCallback, useRef, useEffect } from 'react'
import useAppStore from '../store/useAppStore.js'
import { buildShotstackEdit, submitRender, pollRender } from '../utils/shotstack.js'

export function useShotstack() {
  const setRenderStatus = useAppStore((s) => s.setRenderStatus)
  const setRenderId = useAppStore((s) => s.setRenderId)
  const setRenderUrl = useAppStore((s) => s.setRenderUrl)
  const pollIntervalRef = useRef(null)

  useEffect(() => () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
  }, [])

  const startRender = useCallback(async (directive, clips, { wordTimings, brollVideos, brandKit } = {}) => {
    setRenderStatus('pending')
    try {
      const edit = buildShotstackEdit({ directive, clips, wordTimings, brollVideos, brandKit })
      const renderId = await submitRender(edit)
      setRenderId(renderId)
      setRenderStatus('rendering')

      // Polling toutes les 4s
      pollIntervalRef.current = setInterval(async () => {
        try {
          const { status, url, error } = await pollRender(renderId)
          if (status === 'done' && url) {
            setRenderUrl(url)
            setRenderStatus('done')
            clearInterval(pollIntervalRef.current)
          } else if (status === 'failed') {
            setRenderStatus('error')
            clearInterval(pollIntervalRef.current)
            console.error('[shotstack]', error)
          }
        } catch (e) {
          console.error('[shotstack poll]', e)
        }
      }, 4000)

      return renderId
    } catch (e) {
      setRenderStatus('error')
      throw e
    }
  }, [setRenderStatus, setRenderId, setRenderUrl])

  return { startRender }
}
```

**Modifier** : `src/components/features/ViralityEngine.jsx`
- Remplacer `import { useCreatomate } from '../../hooks/useCreatomate'` par `import { useShotstack } from '../../hooks/useShotstack'`
- Remplacer `const { startRender } = useCreatomate()` par `const { startRender } = useShotstack()`
- Dans `handleGenerate`, passer `{ wordTimings: [], brollVideos: [], brandKit }` en 3e argument (wordTimings sera rempli en Phase 2)

**Supprimer** : `src/hooks/useCreatomate.js`

**Mettre à jour** : `.env.example` cf §3

**Validation Phase 1** :
- `npm run build` passe
- Avec clé Shotstack valide, clicker "Générer mon Reel" produit un vrai MP4 concatenant les clips avec les overlays Claude
- `VideoRenderStatus.jsx` affiche l'URL finale

**Commit** : `feat(studio): swap Creatomate for Shotstack — real video rendering pipeline`

---

### PHASE 2 — Whisper ASR : captions réelles transcribed

**Objectif** : extraire l'audio des clips, transcrire via Whisper, obtenir des word timings, générer vraies captions kinetic/classic.

**Créer** : `src/utils/extractAudio.js`

```js
/**
 * Extrait l'audio d'un fichier vidéo en WAV mono 16kHz via Web Audio API.
 * Retourne un Blob audio utilisable par Whisper.
 */
export async function extractAudioFromVideo(file) {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  const wavBlob = audioBufferToWav(audioBuffer)
  audioCtx.close()
  return wavBlob
}

/** Encode un AudioBuffer en Blob WAV PCM 16-bit mono */
function audioBufferToWav(buffer) {
  const numChannels = 1 // force mono
  const sampleRate = buffer.sampleRate
  const length = buffer.length
  const arrayBuffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(arrayBuffer)
  const channelData = buffer.numberOfChannels > 1
    ? mixToMono(buffer)
    : buffer.getChannelData(0)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true)
  view.setUint16(32, numChannels * 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, length * 2, true)

  // PCM samples
  let offset = 44
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
}

function mixToMono(buffer) {
  const len = buffer.length
  const out = new Float32Array(len)
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < len; i++) out[i] += data[i] / buffer.numberOfChannels
  }
  return out
}
```

**Créer** : `src/utils/whisper.js`

```js
/**
 * Whisper API — transcription avec word-level timestamps
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY

/**
 * @param {Blob} audioBlob  — WAV ou MP3
 * @param {string} language — 'fr', 'en', 'es', ... ou 'auto' pour auto-détection
 * @returns {Promise<{ words: Array<{word,start,end}>, text: string, language: string }>}
 */
export async function transcribeWithWords(audioBlob, language = 'fr') {
  if (!OPENAI_KEY) throw new Error('VITE_OPENAI_KEY manquante')

  const form = new FormData()
  form.append('file', audioBlob, 'audio.wav')
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')
  if (language && language !== 'auto') form.append('language', language)

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: form,
  })

  if (!res.ok) throw new Error(`Whisper error ${res.status}: ${await res.text()}`)
  const data = await res.json()

  return {
    words: (data.words || []).map((w) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    })),
    text: data.text,
    language: data.language,
  }
}

/**
 * Transcrit N clips, offset les timestamps pour correspondre à la timeline finale.
 * @param {Array} clips          — [{ file, duration }] dans l'ordre final
 * @param {Array} clipTrims      — [{ clip_index, start, end }]
 * @param {Array} orderedIndices — ordre des clips (1-based)
 * @param {string} language
 * @returns {Promise<Array<{word,start,end}>>} — timestamps absolus sur la timeline finale
 */
export async function transcribeClipSequence(clips, clipTrims, orderedIndices, language) {
  const { extractAudioFromVideo } = await import('./extractAudio.js')
  const allWords = []
  let cursor = 0

  for (const n of orderedIndices) {
    const clipIdx = n - 1
    const clip = clips[clipIdx]
    if (!clip) continue
    const trim = clipTrims?.find((t) => t.clip_index === clipIdx)
    const trimStart = trim?.start ?? 0
    const trimEnd = trim?.end ?? clip.duration
    const length = trimEnd - trimStart

    try {
      const audioBlob = await extractAudioFromVideo(clip.file)
      const { words } = await transcribeWithWords(audioBlob, language)
      // Filtrer aux bornes du trim et offsetter
      words
        .filter((w) => w.end > trimStart && w.start < trimEnd)
        .forEach((w) => {
          const relStart = Math.max(0, w.start - trimStart)
          const relEnd = Math.min(length, w.end - trimStart)
          allWords.push({
            word: w.word,
            start: cursor + relStart,
            end: cursor + relEnd,
          })
        })
    } catch (e) {
      console.warn(`[whisper] clip ${clipIdx} failed`, e)
    }

    cursor += length
  }

  return allWords
}
```

**Modifier** : `src/components/features/ViralityEngine.jsx`
- Importer `transcribeClipSequence`
- Dans `handleGenerate`, avant l'appel `startRender` :

```js
// Étape 1 : Whisper transcription (si captions activées)
let wordTimings = []
if (captionStyle !== 'none' && clips.some((c) => c.file)) {
  try {
    setStatus('transcribing') // ajouter cet état + UI
    wordTimings = await transcribeClipSequence(
      uploadedClips,
      finalTrims,
      clipOrder,
      captionLanguage,
    )
  } catch (e) {
    console.warn('[transcription] fallback to overlays', e)
    toast('Transcription indisponible, overlays Claude utilisés', 'info')
  }
}
```

- Ajouter l'état `transcribing` avec un écran de progress dédié (pattern identique à `analyzing`)
- Passer `wordTimings` dans `startRender(directive, uploadedClips, { wordTimings, brollVideos: [], brandKit })`

**Validation Phase 2** :
- `npm run build` passe
- Sur un clip court parlé, Whisper retourne des mots avec timestamps
- En mode `kinetic`, la vidéo Shotstack affiche les mots en popup mot-par-mot
- En mode `classic`, par blocs de 3 mots en bas d'écran
- Le sélecteur de langue fonctionne vraiment (Whisper respecte le paramètre `language`)

**Commit** : `feat(studio): real captions via Whisper word-level timestamps`

---

### PHASE 3 — B-roll vidéo via Pexels

**Objectif** : remplacer les images DALL-E statiques par de la vidéo stock, avec fallback DALL-E si rien ne matche.

**Créer** : `src/utils/pexels.js`

```js
/**
 * Pexels Videos API — https://www.pexels.com/api/documentation/#videos
 */

const KEY = import.meta.env.VITE_PEXELS_KEY

/**
 * Cherche des vidéos verticales (9:16 ou 3:4) matchant un query.
 * @param {string} query
 * @param {number} perPage
 * @returns {Promise<Array<{ id, url, duration, width, height }>>}
 */
export async function searchStockVideo(query, perPage = 5) {
  if (!KEY) return []
  const url = new URL('https://api.pexels.com/videos/search')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orientation', 'portrait')

  const res = await fetch(url, { headers: { Authorization: KEY } })
  if (!res.ok) return []
  const data = await res.json()

  return (data.videos || [])
    .map((v) => {
      // Prend la meilleure source MP4 ≤ 1920x1080 pour la perf
      const files = (v.video_files || [])
        .filter((f) => f.file_type === 'video/mp4')
        .sort((a, b) => (b.width || 0) - (a.width || 0))
      const best = files.find((f) => f.width <= 1080) || files[0]
      if (!best) return null
      return {
        id: v.id,
        url: best.link,
        duration: v.duration,
        width: best.width,
        height: best.height,
      }
    })
    .filter(Boolean)
}
```

**Modifier** : `src/components/features/BRollSlots.jsx`
- Renommer `handleGenerate` → `handleFetchStock`
- Logique : d'abord `searchStockVideo(slot.prompt)` ; si résultats, stocker `videoUrl`, `duration` dans le slot ; sinon fallback `generateDalleImage` en image statique
- Afficher un badge "Stock" ou "AI image" selon la source
- Le state doit stocker soit `videoUrl` (video) soit `imageUrl` (fallback)

```js
const handleFetchStock = async (slot, i) => {
  setLoadingIdx(i)
  try {
    const { searchStockVideo } = await import('../../utils/pexels.js')
    const results = await searchStockVideo(slot.prompt.slice(0, 80), 3)

    if (results.length > 0) {
      const best = results[0]
      const updated = [...slots]
      updated[i] = {
        ...slot,
        videoUrl: best.url,
        duration: Math.min(slot.duration, best.duration),
        source: 'pexels',
        enabled: true,
      }
      setDirective({ ...directive, b_roll_slots: updated })
      toast('B-roll vidéo trouvé ✓', 'success')
      return
    }

    // Fallback : DALL-E image
    const imageUrl = await generateDalleImage(slot.prompt)
    if (imageUrl) {
      const updated = [...slots]
      updated[i] = { ...slot, imageUrl, source: 'dalle', enabled: true }
      setDirective({ ...directive, b_roll_slots: updated })
      toast('B-roll image générée ✓', 'success')
    } else {
      navigator.clipboard?.writeText(slot.prompt)
      toast('Prompt copié', 'info')
    }
  } catch (e) {
    toast('Génération impossible', 'error')
    console.error(e)
  }
  setLoadingIdx(null)
}
```

**Modifier** : `src/utils/shotstack.js`, `buildShotstackEdit`
- Accepter à la fois `videoUrl` et `imageUrl` dans `brollVideos` :

```js
brollVideos
  .filter((b) => b.afterClip === clipIdx)
  .forEach((b) => {
    videoClips.push({
      asset: b.videoUrl
        ? { type: 'video', src: b.videoUrl, trim: 0 }
        : { type: 'image', src: b.imageUrl },
      start: cursor,
      length: b.duration,
      fit: 'cover',
      effect: 'zoomIn',
    })
    cursor += b.duration
  })
```

**Modifier** : `ViralityEngine.jsx:handleGenerate`
- Construire `brollVideos` depuis `directive.b_roll_slots.filter(s => s.enabled)` :

```js
const brollVideos = (directive.b_roll_slots || [])
  .filter((s) => s.enabled)
  .map((s) => ({
    afterClip: s.after_clip,
    videoUrl: s.videoUrl || null,
    imageUrl: s.imageUrl || null,
    duration: s.duration || 1.5,
  }))
```

**Validation Phase 3** :
- `npm run build` passe
- Avec clé Pexels valide, clicker "Générer" sur un slot B-roll ramène une vidéo stock
- Le render final Shotstack inclut bien la vidéo B-roll à la bonne position
- Le fallback DALL-E marche si Pexels ne retourne rien

**Commit** : `feat(studio): Pexels stock video B-roll with DALL-E fallback`

---

### PHASE 4 — Brand kit réellement appliqué

**Objectif** : logo, couleur, police passent de "stockés dans le store" à "visibles dans la vidéo finale".

**Rien à créer** — la phase 1 a déjà câblé `brandKit.logoDataUrl` (logo bas-droite persistant) et `brandKit.primaryColor` (background des kinetic captions) dans `buildShotstackEdit`.

**Modifier** : `src/utils/shotstack.js`
- Mapping `fontFamily` → Shotstack `style` :

```js
const FONT_TO_STYLE = {
  sans: 'future',
  serif: 'marker',
  display: 'blockbuster',
}

// Dans buildCaptionTrack, utiliser :
style: FONT_TO_STYLE[brandKit?.fontFamily] || 'future',
```

- Le logo data URL (base64) doit être uploadé d'abord vers une URL accessible par Shotstack. Shotstack n'accepte pas les data URLs. Solution : uploader via Shotstack Ingest API, ou inline via Cloudinary.

**Créer** : `src/utils/ingestAsset.js`

```js
/**
 * Upload un data URL ou Blob vers une URL publique utilisable par Shotstack.
 * Préférence : Shotstack Ingest API (gratuit, intégré).
 * Fallback : Cloudinary unsigned upload.
 */

const SHOTSTACK_KEY = import.meta.env.VITE_SHOTSTACK_KEY
const SHOTSTACK_INGEST_HOST = (import.meta.env.VITE_SHOTSTACK_HOST || '')
  .replace('/edit/', '/ingest/')

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET

export async function uploadToCdn(blobOrDataUrl, filename = 'asset') {
  const blob = typeof blobOrDataUrl === 'string'
    ? await (await fetch(blobOrDataUrl)).blob()
    : blobOrDataUrl

  // Option 1 : Shotstack Ingest
  if (SHOTSTACK_INGEST_HOST && SHOTSTACK_KEY) {
    try {
      // 1. Demander un upload URL signé
      const initRes = await fetch(`${SHOTSTACK_INGEST_HOST}/upload`, {
        method: 'POST',
        headers: { 'x-api-key': SHOTSTACK_KEY },
      })
      if (initRes.ok) {
        const { data } = await initRes.json()
        const uploadUrl = data?.attributes?.url
        if (uploadUrl) {
          await fetch(uploadUrl, { method: 'PUT', body: blob })
          return data.attributes.sourceUrl || uploadUrl.split('?')[0]
        }
      }
    } catch (e) {
      console.warn('[ingest] Shotstack upload failed, fallback Cloudinary', e)
    }
  }

  // Option 2 : Cloudinary unsigned
  if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
    const form = new FormData()
    form.append('file', blob)
    form.append('upload_preset', CLOUDINARY_PRESET)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
      { method: 'POST', body: form }
    )
    if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)
    const data = await res.json()
    return data.secure_url
  }

  throw new Error('Aucun CDN configuré (Shotstack Ingest ou Cloudinary requis)')
}
```

**Modifier** : `src/utils/uploadClip.js` — si ce fichier retourne des blob URLs locales, le remplacer par un appel à `uploadToCdn`.

**Modifier** : `src/components/features/ViralityEngine.jsx:handleGenerate`
- Avant de passer `brandKit` à `startRender`, convertir `logoDataUrl` → `logoUrl` via `uploadToCdn` (une seule fois, cacher le résultat) :

```js
let resolvedBrandKit = brandKit
if (brandKit?.logoDataUrl && !brandKit?.logoUrl) {
  try {
    const logoUrl = await uploadToCdn(brandKit.logoDataUrl, 'logo.png')
    resolvedBrandKit = { ...brandKit, logoUrl }
    useAppStore.getState().setBrandKit({ logoUrl }) // cache
  } catch (e) {
    console.warn('[brandkit] logo upload failed', e)
    resolvedBrandKit = { ...brandKit, logoDataUrl: null }
  }
}
```

- Dans `shotstack.js`, utiliser `brandKit.logoUrl` au lieu de `logoDataUrl`.

**Validation Phase 4** :
- `npm run build` passe
- Le logo uploadé est visible bas-droite de la vidéo finale
- Les kinetic captions utilisent la couleur primaire du brand kit comme background
- La police sélectionnée change le style des captions (vérifiable à l'oeil)

**Commit** : `feat(studio): brand kit actually applied to rendered video (logo, color, font)`

---

### PHASE 5 — Polish & scheduler stubs (optionnelle)

**Objectif** : ajouter les hooks pour l'auto-post futur, sans l'implémenter.

**Créer** : `src/utils/publishing.js`

```js
/**
 * STUB — Publishing aux plateformes sociales.
 * L'implémentation réelle nécessite :
 *   - Instagram Graph API (Facebook App + Business account)
 *   - TikTok Content Posting API (developer account approuvé)
 *   - YouTube Data API v3 (OAuth)
 * Non implémenté ici. Retourne toujours `{ scheduled: true }` en mock.
 */

export async function scheduleReelPost({ reelUrl, caption, hashtags, platform, scheduledAt }) {
  console.log('[publishing] STUB', { reelUrl, platform, scheduledAt })
  // TODO: implémenter via backend proxy (requis pour les secrets OAuth)
  return { scheduled: true, platform, scheduledAt, id: `stub_${Date.now()}` }
}
```

**Modifier** : `src/components/features/VideoRenderStatus.jsx`
- Après le succès du render, ajouter un bouton "Programmer sur..." qui ouvre un modal basique avec sélecteur date + plateforme et appelle `scheduleReelPost`. Le résultat est stocké dans le reel dans le store (`reel.scheduledAt`).
- Pas besoin de UI avancée — juste un stub fonctionnel branché.

**Commit** : `feat(studio): publishing stub + schedule from VideoRenderStatus`

---

## 5. Checklist finale avant handoff

Une fois les 4 phases terminées, vérifier que :

- [ ] `npm run build` passe sans warning bloquant
- [ ] Upload 2 clips courts parlés → l'analyse Claude retourne une directive complète
- [ ] Cliquer "Générer" : transcription Whisper → upload assets → Shotstack render → MP4 téléchargeable
- [ ] Les captions kinetic affichent les vrais mots du clip, pas le hook_text
- [ ] Le brand kit (logo + couleur) est visible sur la vidéo finale
- [ ] Un B-roll Pexels peut être ajouté entre deux clips et apparaît dans le render
- [ ] `git log` montre 4 (ou 5) commits atomiques, un par phase, aucun mélange

---

## 6. Hors scope — ne pas faire

Ces features d'Opus Clip sont **explicitement hors scope** de ce chantier. Ne les implémente pas, même si le temps le permet :

- **Long-video → auto-chapitrage** (Opus prend 1h de podcast, PostChef prend 4 clips courts — designs différents, décision produit)
- **Auto-reframe smart crop horizontal→vertical** (les clips PostChef sont déjà 9:16)
- **Active speaker detection** (clips courts, pas de dialogue multi-personnes)
- **Multi-camera switching**
- **Zapier integration**
- **Export vers Premiere Pro / Final Cut**
- **Real-time collaborative editing**
- **Analytics post-publication**
- **Auto-post réel** (phase 5 reste un stub — requiert backend + comptes dev approuvés côté plateformes)

Si tu identifies un besoin hors de cette liste, **arrête-toi et demande confirmation** au lieu d'implémenter.

---

## 7. Style de travail attendu

- Utilise `TodoWrite` pour tracker les 4 phases + sous-tâches
- Lance les créations de fichiers en parallèle quand elles sont indépendantes
- Commits atomiques avec messages préfixés `feat(studio):` ou `fix(studio):`
- Teste `npm run build` avant CHAQUE commit
- Pas de `console.log` oubliés dans le code final (utilise `console.warn` seulement pour les fallbacks intentionnels)
- Pas d'emoji dans le code ou les commit messages sauf ceux déjà présents dans l'UI
- Communication finale en français, concise

**Commence par la Phase 1.** N'attends pas de confirmation entre les phases si tout compile.
