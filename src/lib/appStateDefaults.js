export function getThisMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export function getThisMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function createDefaultOnboarding() {
  return {
    step: 1,
    completed: false,
    restaurant: {
      name: '',
      city: '',
      cuisineTypes: [],
      specialite: '',
      couverts: '20-50',
    },
    clientele: {
      profils: [],
      objectif: '',
    },
    preferences: {
      plateformes: [],
      frequence: '2-3/sem',
      styles: [],
    },
  }
}

export function createDefaultUser() {
  return {
    id: crypto.randomUUID(),
    prenom: '',
    email: '',
    plan: 'starter',
    planExpiry: null,
  }
}

export function createDefaultUsage() {
  return {
    ideasUsedThisWeek: 0,
    weekStart: getThisMonday(),
    dishPhotoUsedThisMonth: 0,
    restaurantBrainUsedThisMonth: 0,
    videoScriptUsedThisMonth: 0,
    captionUsedThisMonth: 0,
    videoReelUsedThisMonth: 0,
    monthStart: getThisMonth(),
  }
}

export function createDefaultStudio() {
  return {
    clips: [],
    directive: null,
    renderStatus: null,
    renderUrl: null,
    renderId: null,
    lastGenerated: null,
  }
}

export function createDefaultBrandKit() {
  return {
    logoDataUrl: null,
    primaryColor: '#1D9E75',
    accentColor: '#0F172A',
    fontFamily: 'sans',
  }
}

export function createDefaultStoreData() {
  return {
    onboarding: createDefaultOnboarding(),
    user: createDefaultUser(),
    usage: createDefaultUsage(),
    menuPhoto: null,
    posts: [],
    ideas: [],
    ideasLoading: false,
    savedIdeas: [],
    studio: createDefaultStudio(),
    reels: [],
    brandKit: createDefaultBrandKit(),
  }
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback
}

function safeObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
}

export function createRemoteSnapshot(state, authUser) {
  const onboarding = safeObject(state.onboarding, createDefaultOnboarding())
  const user = safeObject(state.user, createDefaultUser())
  const usage = safeObject(state.usage, createDefaultUsage())
  const brandKit = safeObject(state.brandKit, createDefaultBrandKit())

  return {
    profile: {
      user_id: authUser.id,
      email: authUser.email || user.email || '',
      first_name: user.prenom || authUser.user_metadata?.first_name || '',
      plan: user.plan || 'starter',
      plan_expiry: user.planExpiry || null,
    },
    restaurant: {
      user_id: authUser.id,
      name: onboarding.restaurant?.name || '',
      city: onboarding.restaurant?.city || '',
      cuisine_types: safeArray(onboarding.restaurant?.cuisineTypes),
      specialite: onboarding.restaurant?.specialite || '',
      couverts: onboarding.restaurant?.couverts || '20-50',
      client_profiles: safeArray(onboarding.clientele?.profils),
      objective: onboarding.clientele?.objectif || '',
      platforms: safeArray(onboarding.preferences?.plateformes),
      frequency: onboarding.preferences?.frequence || '2-3/sem',
      styles: safeArray(onboarding.preferences?.styles),
      onboarding_step: Number.isInteger(onboarding.step) ? onboarding.step : 1,
      onboarding_completed: Boolean(onboarding.completed),
    },
    appState: {
      user_id: authUser.id,
      usage,
      posts: safeArray(state.posts),
      ideas: safeArray(state.ideas),
      saved_ideas: safeArray(state.savedIdeas),
      reels: safeArray(state.reels),
      brand_kit: {
        primaryColor: brandKit.primaryColor,
        accentColor: brandKit.accentColor,
        fontFamily: brandKit.fontFamily,
      },
    },
  }
}

export function applyRemoteSnapshot({ authUser, profile, restaurant, appState }) {
  const defaults = createDefaultStoreData()

  return {
    user: {
      ...defaults.user,
      id: authUser?.id || null,
      email: authUser?.email || profile?.email || '',
      prenom:
        profile?.first_name ||
        authUser?.user_metadata?.first_name ||
        authUser?.email?.split('@')[0] ||
        defaults.user.prenom,
      plan: profile?.plan || defaults.user.plan,
      planExpiry: profile?.plan_expiry || defaults.user.planExpiry,
    },
    onboarding: {
      ...defaults.onboarding,
      step: restaurant?.onboarding_step ?? defaults.onboarding.step,
      completed: restaurant?.onboarding_completed ?? defaults.onboarding.completed,
      restaurant: {
        ...defaults.onboarding.restaurant,
        name: restaurant?.name || defaults.onboarding.restaurant.name,
        city: restaurant?.city || defaults.onboarding.restaurant.city,
        cuisineTypes: safeArray(restaurant?.cuisine_types),
        specialite: restaurant?.specialite || defaults.onboarding.restaurant.specialite,
        couverts: restaurant?.couverts || defaults.onboarding.restaurant.couverts,
      },
      clientele: {
        ...defaults.onboarding.clientele,
        profils: safeArray(restaurant?.client_profiles),
        objectif: restaurant?.objective || defaults.onboarding.clientele.objectif,
      },
      preferences: {
        ...defaults.onboarding.preferences,
        plateformes: safeArray(restaurant?.platforms),
        frequence: restaurant?.frequency || defaults.onboarding.preferences.frequence,
        styles: safeArray(restaurant?.styles),
      },
    },
    usage: {
      ...defaults.usage,
      ...safeObject(appState?.usage),
    },
    posts: safeArray(appState?.posts),
    ideas: safeArray(appState?.ideas),
    savedIdeas: safeArray(appState?.saved_ideas),
    reels: safeArray(appState?.reels),
    brandKit: {
      ...defaults.brandKit,
      ...safeObject(appState?.brand_kit),
    },
  }
}
