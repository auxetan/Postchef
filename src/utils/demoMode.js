/**
 * DEMO_MODE — true si les variables d'env réelles ne sont pas configurées.
 *
 * En production avec les bonnes clés, ce flag doit être false.
 * Il permet d'afficher des badges "Démo / Simulé" sur les features mockées,
 * et d'éviter de présenter des données fictives comme des données réelles.
 */
export const DEMO_MODE = !import.meta.env.VITE_OPENAI_KEY &&
                         !import.meta.env.VITE_ANTHROPIC_KEY

/**
 * Retourne true si une feature spécifique est en mode démo.
 * Permet d'affiner le flag par feature si certaines sont branchées et d'autres non.
 */
export function isDemo(feature) {
  switch (feature) {
    case 'analytics':
      return true // toujours mock tant que pas branché
    case 'trends':
      return true // toujours mock tant que pas branché
    case 'chef-ia':
      return !import.meta.env.VITE_ANTHROPIC_KEY
    case 'ideas':
      return !import.meta.env.VITE_ANTHROPIC_KEY
    case 'restaurant-brain':
      return !import.meta.env.VITE_GOOGLE_PLACES_KEY
    default:
      return DEMO_MODE
  }
}
