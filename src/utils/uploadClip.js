/**
 * Upload un fichier vidéo vers le CDN (Shotstack Ingest ou Cloudinary).
 * Retourne une URL publique HTTPS utilisable par Shotstack.
 */
import { uploadToCdn } from './ingestAsset.js'

export async function uploadClip(file) {
  return uploadToCdn(file, file.name || 'clip.mp4')
}
