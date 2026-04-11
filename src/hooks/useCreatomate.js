/**
 * Hook API Creatomate — rendu vidéo 9:16 pour Reels/TikTok.
 */

import { useCallback } from 'react'
import useAppStore from '../store/useAppStore.js'

const TEMPLATE_IDS = {
  dish_reveal:   'tmpl_xxxxxxxxxx',
  behind_scenes: 'tmpl_xxxxxxxxxx',
  daily_special: 'tmpl_xxxxxxxxxx',
  ambiance:      'tmpl_xxxxxxxxxx',
  asmr_moment:   'tmpl_xxxxxxxxxx',
}

const MUSIC_TRACKS = {
  warm_upbeat:   'track_warm_001',
  energetic:     'track_energetic_001',
  chill_ambient: 'track_chill_001',
  asmr_natural:  null,
}

export function buildCreatomatePayload(directive, clips) {
  // Réordonner les clips selon clip_order de la directive
  const orderedClips = (directive.clip_order || clips.map((_, i) => i + 1))
    .map((n) => clips[n - 1])
    .filter(Boolean)

  return {
    template_id: TEMPLATE_IDS[directive.template],
    modifications: {
      ...orderedClips.reduce((acc, clip, i) => {
        const trim = directive.clip_trims?.find(
          (t) => t.clip_index === clips.indexOf(clip)
        )
        return {
          ...acc,
          [`clip_${i + 1}_source`]: clip.uploadedUrl,
          [`clip_${i + 1}_trim_start`]: trim?.start ?? 0,
          [`clip_${i + 1}_trim_end`]: trim?.end ?? clip.duration,
        }
      }, {}),
      hook_text: directive.hook_text,
      location_text:
        directive.text_overlays?.find((o) => o.text.includes('\u{1F4CD}'))?.text || '',
      cta_text: directive.text_overlays?.at(-1)?.text || 'Réservez \u{1F446}',
      music_track: MUSIC_TRACKS[directive.music_mood],
      transition_style: directive.transition_style || 'hard_cut',
      duration: directive.total_duration,
    },
    output_format: 'mp4',
    frame_rate: 30,
    width: 1080,
    height: 1920,
  }
}

export function useCreatomate() {
  const setRenderStatus = useAppStore((s) => s.setRenderStatus)
  const setRenderId = useAppStore((s) => s.setRenderId)
  const setRenderUrl = useAppStore((s) => s.setRenderUrl)

  const startRender = useCallback(async (directive, clips) => {
    setRenderStatus('pending')
    try {
      const payload = buildCreatomatePayload(directive, clips)
      const res = await fetch('https://api.creatomate.com/v1/renders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CREATOMATE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setRenderId(data[0].id)
      setRenderStatus('rendering')
      return data[0].id
    } catch (e) {
      setRenderStatus('error')
      throw e
    }
  }, [setRenderStatus, setRenderId])

  const pollRender = useCallback(async (renderId) => {
    const res = await fetch(
      `https://api.creatomate.com/v1/renders/${encodeURIComponent(renderId)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CREATOMATE_KEY}`,
        },
      }
    )
    const data = await res.json()
    if (data.status === 'succeeded') {
      setRenderUrl(data.url)
      setRenderStatus('done')
    } else if (data.status === 'failed') {
      setRenderStatus('error')
    }
    return data.status
  }, [setRenderUrl, setRenderStatus])

  return { startRender, pollRender }
}
