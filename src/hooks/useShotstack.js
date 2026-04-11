/**
 * useShotstack — remplace useCreatomate.
 * Soumet un render Shotstack, poll toutes les 4s, met à jour le store.
 */
import { useCallback, useRef, useEffect } from 'react'
import useAppStore from '../store/useAppStore.js'
import { buildShotstackEdit, submitRender, pollRender } from '../utils/shotstack.js'

export function useShotstack() {
  const setRenderStatus = useAppStore((s) => s.setRenderStatus)
  const setRenderId     = useAppStore((s) => s.setRenderId)
  const setRenderUrl    = useAppStore((s) => s.setRenderUrl)
  const pollRef         = useRef(null)

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const startRender = useCallback(
    async (directive, clips, { wordTimings = [], brollVideos = [], brandKit = {} } = {}) => {
      setRenderStatus('pending')
      try {
        const edit     = buildShotstackEdit({ directive, clips, wordTimings, brollVideos, brandKit })
        const renderId = await submitRender(edit)
        setRenderId(renderId)
        setRenderStatus('rendering')

        pollRef.current = setInterval(async () => {
          try {
            const { status, url, error } = await pollRender(renderId)
            if (status === 'done' && url) {
              setRenderUrl(url)
              setRenderStatus('done')
              clearInterval(pollRef.current)
            } else if (status === 'failed') {
              setRenderStatus('error')
              clearInterval(pollRef.current)
              console.warn('[shotstack] render failed', error)
            }
          } catch (e) {
            console.warn('[shotstack poll]', e)
          }
        }, 4000)

        return renderId
      } catch (e) {
        setRenderStatus('error')
        throw e
      }
    },
    [setRenderStatus, setRenderId, setRenderUrl]
  )

  return { startRender }
}
