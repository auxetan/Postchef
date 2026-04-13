/**
 * Whisper API — transcription avec word-level timestamps.
 * Retourne un tableau { word, start, end } avec timestamps absolus sur la timeline.
 */
import { extractAudioFromVideo } from './extractAudio.js'
import { transcribeAudio } from './serverApi.js'

/**
 * Transcrit un Blob audio avec timestamps par mot.
 * @param {Blob}   audioBlob
 * @param {string} language  — 'fr' | 'en' | 'es' | etc.
 * @returns {Promise<{ words: Array<{word,start,end}>, text: string }>}
 */
export async function transcribeWithWords(audioBlob, language = 'fr') {
  const data = await transcribeAudio(audioBlob, {
    language,
    filename: 'audio.wav',
  })

  return {
    words: (data.words || []).map((w) => ({ word: w.word, start: w.start, end: w.end })),
    text:  data.text,
  }
}

/**
 * Transcrit N clips dans l'ordre final, offset les timestamps pour la timeline absolue.
 * @param {Array}  clips          — clips avec { file, duration }
 * @param {Array}  clipTrims      — [{ clip_index, start, end }]
 * @param {Array}  orderedIndices — clip_order 1-based
 * @param {string} language
 * @returns {Promise<Array<{word,start,end}>>}
 */
export async function transcribeClipSequence(clips, clipTrims, orderedIndices, language) {
  const allWords = []
  let cursor = 0

  for (const n of orderedIndices) {
    const clipIdx = n - 1
    const clip    = clips[clipIdx]
    if (!clip?.file) { cursor += clip?.duration ?? 0; continue }

    const trim      = clipTrims?.find((t) => t.clip_index === clipIdx)
    const trimStart = trim?.start ?? 0
    const trimEnd   = trim?.end   ?? clip.duration
    const length    = trimEnd - trimStart

    try {
      const audioBlob = await extractAudioFromVideo(clip.file)
      const { words } = await transcribeWithWords(audioBlob, language)

      words
        .filter((w) => w.end > trimStart && w.start < trimEnd)
        .forEach((w) => {
          allWords.push({
            word:  w.word,
            start: cursor + Math.max(0, w.start - trimStart),
            end:   cursor + Math.min(length, w.end - trimStart),
          })
        })
    } catch (e) {
      console.warn(`[whisper] clip ${clipIdx} ignoré`, e)
    }

    cursor += length
  }

  return allWords
}
