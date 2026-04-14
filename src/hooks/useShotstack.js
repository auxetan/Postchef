/**
 * useShotstack — remplace useCreatomate.
 * Soumet un render Shotstack, poll toutes les 4s, met à jour le store.
 */
import { useCallback, useRef, useEffect } from 'react'
import useAppStore from '../store/useAppStore.js'
import useToastStore from '../store/useToastStore.js'
import { buildShotstackEdit, submitRender, pollRender } from '../utils/shotstack.js'

const POLL_INTERVAL_MS = 4_000
const POLL_TIMEOUT_MS  = 10 * 60 * 1_000 // 10 minutes max

export function useShotstack() {
  const setRenderStatus = useAppStore((s) => s.setRenderStatus)
  const setRenderId     = useAppStore((s) => s.setRenderId)
  const setRenderUrl    = useAppStore((s) => s.setRenderUrl)
  const toast           = useToastStore((s) => s.toast)
  const pollRef         = useRef(null)
  const timeoutRef      = useRef(null)

  const stopPolling = () => {
    if (pollRef.current)    { clearInterval(pollRef.current);  pollRef.current    = null }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
  }

  useEffect(() => () => stopPolling(), [])

  const startRender = useCallback(
    async (directive, clips, { wordTimings = [], brollVideos = [], brandKit = {} } = {}) => {
      setRenderStatus('pending')
      try {
        const edit     = buildShotstackEdit({ directive, clips, wordTimings, brollVideos, brandKit })
        const renderId = await submitRender(edit)
        setRenderId(renderId)
        setRenderStatus('rendering')

        // B7 — Timeout de sécurité : 10 min max
        timeoutRef.current = setTimeout(() => {
          stopPolling()
          setRenderStatus('error')
          toast('Le rendu a expiré — réessaie')
        }, POLL_TIMEOUT_MS)

        pollRef.current = setInterval(async () => {
          try {
            const { status, url, error } = await pollRender(renderId)
            if (status === 'done' && url) {
              setRenderUrl(url)
              setRenderStatus('done')
              stopPolling()
            } else if (status === 'failed') {
              setRenderStatus('error')
              stopPolling()
              toast('Le rendu a échoué — réessaie')
              console.warn('[shotstack] render failed', error)
            }
          } catch (e) {
            console.warn('[shotstack poll]', e)
          }
        }, POLL_INTERVAL_MS)

        return renderId
      } catch (e) {
        setRenderStatus('error')
        throw e
      }
    },
    [setRenderStatus, setRenderId, setRenderUrl, toast]
  )

  return { startRender }
}
