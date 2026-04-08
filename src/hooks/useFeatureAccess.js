import useAppStore from '../store/useAppStore.js'
import { getFeature, canAccess, requiredPlanFor, PLAN_DISPLAY_NAMES } from '../utils/plans.js'

/**
 * Hook principal pour vérifier l'accès aux features.
 *
 * Usage :
 *   const { can, feature, plan } = useFeatureAccess()
 *   if (!can('dishPhotoGenerator')) return <FeatureLock feature="dishPhotoGenerator" />
 */
export default function useFeatureAccess() {
  const plan = useAppStore((s) => s.user.plan)

  return {
    plan,
    planName: PLAN_DISPLAY_NAMES[plan] || plan,

    /** true si le plan courant a accès à cette feature */
    can: (feature) => canAccess(plan, feature),

    /** valeur de la feature (ex: 5 pour ideasPerWeek sur starter) */
    feature: (feature) => getFeature(plan, feature),

    /** plan minimum requis pour cette feature */
    requiredPlan: (feature) => requiredPlanFor(feature),

    /** nom affiché du plan requis */
    requiredPlanName: (feature) => PLAN_DISPLAY_NAMES[requiredPlanFor(feature)] || '',
  }
}
