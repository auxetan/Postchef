/**
 * Shotstack — build edit JSON, POST /render, poll /render/:id
 * Doc : https://shotstack.io/docs/api/
 */
import { postJson } from './serverApi.js'

const FONT_TO_STYLE = {
  sans:    'future',
  serif:   'marker',
  display: 'blockbuster',
}

// Transitions par style de caption pour plus de variété
const CAPTION_TRANSITIONS = {
  kinetic:     { in: 'zoom',      out: 'fade' },
  neon:        { in: 'slideUp',   out: 'fade' },
  bold_impact: { in: 'zoom',      out: 'zoom' },
  karaoke:     { in: 'slideLeft', out: 'fade' },
  classic:     {},
  minimal:     {},
}

/**
 * Construit une edit Shotstack 9:16 à partir d'une directive PostChef.
 */
export function buildShotstackEdit({ directive, clips, wordTimings = [], brollVideos = [], brandKit }) {
  const ordered = (directive.clip_order || clips.map((_, i) => i + 1))
    .map((n) => clips[n - 1])
    .filter(Boolean)

  let cursor = 0
  const videoClips = []
  const clipAbsoluteTimes = new Map()

  ordered.forEach((clip) => {
    const clipIdx = clips.indexOf(clip)
    const trim = directive.clip_trims?.find((t) => t.clip_index === clipIdx)
    const trimStart = trim?.start ?? 0
    const trimEnd   = trim?.end   ?? clip.duration
    const length    = trimEnd - trimStart

    videoClips.push({
      asset: { type: 'video', src: clip.uploadedUrl, trim: trimStart },
      start: cursor,
      length,
      fit: 'cover',
    })
    clipAbsoluteTimes.set(clipIdx, { start: cursor, end: cursor + length })
    cursor += length

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
  })

  const totalDuration = cursor

  const captionClips = buildCaptionTrack({
    style:        directive.caption_style,
    wordTimings,
    textOverlays: directive.text_overlays,
    brandKit,
  })

  const logoClips = (brandKit?.logoUrl)
    ? [{
        asset:    { type: 'image', src: brandKit.logoUrl },
        start:    0,
        length:   totalDuration,
        position: 'bottomRight',
        offset:   { x: -0.03, y: 0.03 },
        scale:    0.15,
      }]
    : []

  const soundtrack = directive.music_track_url
    ? { src: directive.music_track_url, effect: 'fadeInFadeOut', volume: 0.35 }
    : undefined

  return {
    timeline: {
      background: '#000000',
      ...(soundtrack && { soundtrack }),
      tracks: [
        { clips: captionClips },
        { clips: logoClips },
        { clips: videoClips },
      ],
    },
    output: {
      format: 'mp4',
      size:   { width: 1080, height: 1920 },
      fps:    30,
    },
  }
}

function buildCaptionTrack({ style, wordTimings, textOverlays, brandKit }) {
  const primary   = brandKit?.primaryColor || '#1D9E75'
  const fontStyle = FONT_TO_STYLE[brandKit?.fontFamily] || 'future'
  const hasTiming = wordTimings.length > 0

  if (style === 'none') return []

  // ── Kinetic : mot par mot, gros, centré, couleur de marque ──
  if (style === 'kinetic' && hasTiming) {
    return wordTimings.map((w) => ({
      asset: {
        type:       'title',
        text:       w.word.toUpperCase(),
        style:      fontStyle,
        color:      '#ffffff',
        background: primary,
        size:       'large',
        position:   'center',
      },
      start:  w.start,
      length: Math.max(0.15, w.end - w.start),
      transition: CAPTION_TRANSITIONS.kinetic,
    }))
  }

  // ── Neon : mot par mot, style sketchy, couleur fluo, fond sombre ──
  if (style === 'neon' && hasTiming) {
    const neonColor = primary.toUpperCase() === '#1D9E75' ? '#39FF14' : primary
    return wordTimings.map((w) => ({
      asset: {
        type:       'title',
        text:       w.word.toUpperCase(),
        style:      'sketchy',
        color:      neonColor,
        background: 'rgba(0,0,0,0.7)',
        size:       'large',
        position:   'bottom',
      },
      start:  w.start,
      length: Math.max(0.15, w.end - w.start),
      transition: CAPTION_TRANSITIONS.neon,
    }))
  }

  // ── Bold Impact : blocs de 2 mots, style blockbuster, gros plan centré ──
  if (style === 'bold_impact' && hasTiming) {
    const blocks = []
    for (let i = 0; i < wordTimings.length; i += 2) {
      const chunk = wordTimings.slice(i, i + 2)
      blocks.push({
        text:   chunk.map((w) => w.word.toUpperCase()).join(' '),
        start:  chunk[0].start,
        length: Math.max(0.3, chunk[chunk.length - 1].end - chunk[0].start),
      })
    }
    return blocks.map((b) => ({
      asset: {
        type:     'title',
        text:     b.text,
        style:    'blockbuster',
        color:    '#ffffff',
        size:     'large',
        position: 'center',
      },
      start:  b.start,
      length: b.length,
      transition: CAPTION_TRANSITIONS.bold_impact,
    }))
  }

  // ── Karaoke : blocs de 3-4 mots, style chunk, bas de l'écran ──
  if (style === 'karaoke' && hasTiming) {
    const BLOCK = 4
    const blocks = []
    for (let i = 0; i < wordTimings.length; i += BLOCK) {
      const chunk = wordTimings.slice(i, i + BLOCK)
      blocks.push({
        text:   chunk.map((w) => w.word).join(' '),
        start:  chunk[0].start,
        length: Math.max(0.4, chunk[chunk.length - 1].end - chunk[0].start),
      })
    }
    return blocks.map((b) => ({
      asset: {
        type:       'title',
        text:       b.text,
        style:      'chunk',
        color:      '#ffffff',
        background: 'rgba(0,0,0,0.55)',
        size:       'medium',
        position:   'bottom',
      },
      start:  b.start,
      length: b.length,
      transition: CAPTION_TRANSITIONS.karaoke,
    }))
  }

  // ── Classic : blocs de 3 mots, bas de l'écran, style minimal ──
  if (style === 'classic' && hasTiming) {
    const BLOCK = 3
    const blocks = []
    for (let i = 0; i < wordTimings.length; i += BLOCK) {
      const chunk = wordTimings.slice(i, i + BLOCK)
      blocks.push({
        text:   chunk.map((w) => w.word).join(' '),
        start:  chunk[0].start,
        length: chunk[chunk.length - 1].end - chunk[0].start,
      })
    }
    return blocks.map((b) => ({
      asset: {
        type:     'title',
        text:     b.text,
        style:    'minimal',
        color:    '#ffffff',
        size:     'medium',
        position: 'bottom',
      },
      start:  b.start,
      length: b.length,
    }))
  }

  // ── Minimal ou pas de wordTimings → overlays Claude seulement ──
  return (textOverlays || []).map((o) => ({
    asset: {
      type:     'title',
      text:     o.text,
      style:    o.style === 'bold_white' ? 'future' : 'minimal',
      color:    '#ffffff',
      size:     'medium',
      position: o.position || 'center',
    },
    start:  o.timing_start,
    length: Math.max(0.5, o.timing_end - o.timing_start),
  }))
}

/** POST /render — retourne l'ID */
export async function submitRender(edit) {
  const data = await postJson('/api/shotstack', {
    action: 'submit-render',
    edit,
  })
  return data.renderId
}

/** GET /render/:id — retourne { status, url, error } */
export async function pollRender(renderId) {
  return postJson('/api/shotstack', {
    action: 'poll-render',
    renderId,
  })
}
