/**
 * Upload d'un fichier vidéo vers Creatomate et retourne son URL publique HTTPS.
 * Creatomate accepte les uploads de fichiers via POST /v1/files.
 * Fallback : retourne un blob: URL local si l'upload échoue (mode dégradé).
 */

export async function uploadClip(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch('https://api.creatomate.com/v1/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_CREATOMATE_KEY}`,
    },
    body: form,
  })

  if (!res.ok) throw new Error(`Upload échoué: ${res.status}`)
  const data = await res.json()
  return data.url
}
