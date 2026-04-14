/**
 * Shotstack — build edit JSON, POST /render, poll /render/:id
 * Doc : https://shotstack.io/docs/api/
 */
import { postJson } from './serverApi.js'
import { PC_GREEN } from './colors.js'

const FONT_TO_STYLE = {
  sans:    'future',
  serif:   'marker',
  display: 'blockbuster',
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
  const primary   = brandKit?.primaryColor || PC_GREEN
  const fontStyle = FONT_TO_STYLE[brandKit?.fontFamily] || 'future'

  if (style === 'none') return []

  if (style === 'kinetic' && wordTimings.length > 0) {
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
      transition: { in: 'zoom', out: 'fade' },
    }))
  }

  if (style === 'classic' && wordTimings.length > 0) {
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

  // minimal ou pas de wordTimings → overlays Claude seulement
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
