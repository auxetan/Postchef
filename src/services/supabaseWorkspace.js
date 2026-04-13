import { applyRemoteSnapshot, createRemoteSnapshot } from '../lib/appStateDefaults.js'

function ignoreNotFound(error) {
  if (!error) return null
  if (error.code === 'PGRST116') return null
  return error
}

export async function loadWorkspaceForUser(supabase, authUser) {
  const [profileRes, restaurantRes, appStateRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', authUser.id).maybeSingle(),
    supabase.from('restaurants').select('*').eq('user_id', authUser.id).maybeSingle(),
    supabase.from('app_state').select('*').eq('user_id', authUser.id).maybeSingle(),
  ])

  const profileError = ignoreNotFound(profileRes.error)
  const restaurantError = ignoreNotFound(restaurantRes.error)
  const appStateError = ignoreNotFound(appStateRes.error)

  if (profileError) throw profileError
  if (restaurantError) throw restaurantError
  if (appStateError) throw appStateError

  return applyRemoteSnapshot({
    authUser,
    profile: profileRes.data,
    restaurant: restaurantRes.data,
    appState: appStateRes.data,
  })
}

export async function saveWorkspaceForUser(supabase, authUser, state) {
  const snapshot = createRemoteSnapshot(state, authUser)

  const operations = await Promise.all([
    supabase.from('profiles').upsert(snapshot.profile, { onConflict: 'user_id' }),
    supabase.from('restaurants').upsert(snapshot.restaurant, { onConflict: 'user_id' }),
    supabase.from('app_state').upsert(snapshot.appState, { onConflict: 'user_id' }),
  ])

  operations.forEach(({ error }) => {
    if (error) throw error
  })
}
