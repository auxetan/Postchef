/**
 * DEMO_MODE — les clés API sont côté serveur (pas de VITE_ prefix).
 * Ces flags permettent d'afficher des badges "Démo / Simulé" sur les features mockées.
 * En production avec les bonnes clés .env.local, tout est branché.
 */
export const DEMO_MODE = false // Toutes les clés sont côté serveur — jamais VITE_

export function isDemo(feature) {
  switch (feature) {
    case 'analytics':
      return true // réseaux sociaux non connectés — données illustratives
    case 'trends':
      return true // contenu curatéé, pas de flux live
    case 'chef-ia':
    case 'ideas':
    case 'restaurant-brain':
      return false // branché via /api/* — clés côté serveur
    default:
      return false
  }
}
