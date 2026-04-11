/**
 * Extrait l'audio d'un fichier vidéo en WAV mono 16kHz via Web Audio API.
 * Retourne un Blob audio utilisable par Whisper.
 */
export async function extractAudioFromVideo(file) {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx    = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
  let audioBuffer
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  } finally {
    audioCtx.close()
  }
  return audioBufferToWav(audioBuffer)
}

function audioBufferToWav(buffer) {
  const sampleRate  = buffer.sampleRate
  const length      = buffer.length
  const ab          = new ArrayBuffer(44 + length * 2)
  const view        = new DataView(ab)
  const channelData = buffer.numberOfChannels > 1 ? mixToMono(buffer) : buffer.getChannelData(0)

  writeStr(view, 0,  'RIFF')
  view.setUint32( 4, 36 + length * 2, true)
  writeStr(view, 8,  'WAVE')
  writeStr(view, 12, 'fmt ')
  view.setUint32(16, 16,         true)
  view.setUint16(20, 1,          true) // PCM
  view.setUint16(22, 1,          true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2,          true)
  view.setUint16(34, 16,         true)
  writeStr(view, 36, 'data')
  view.setUint32(40, length * 2, true)

  let offset = 44
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }
  return new Blob([ab], { type: 'audio/wav' })
}

function writeStr(view, offset, str) {
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
