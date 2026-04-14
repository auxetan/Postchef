import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createDefaultStoreData as createDefaults,
  createDefaultBrandKit,
  createDefaultStudio,
  createDefaultUsage,
  getThisMonday,
  getThisMonth,
} from '../lib/appStateDefaults.js'

function createDefaultAppState() {
  return createDefaults()
}

const useAppStore = create(
  persist(
    (set, get) => ({
      ...createDefaultAppState(),

      // ── Actions onboarding ──
      setOnboardingStep: (step) =>
        set((s) => ({ onboarding: { ...s.onboarding, step } })),

      updateRestaurant: (data) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            restaurant: { ...s.onboarding.restaurant, ...data },
          },
        })),

      updateClientele: (data) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            clientele: { ...s.onboarding.clientele, ...data },
          },
        })),

      updatePreferences: (data) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            preferences: { ...s.onboarding.preferences, ...data },
          },
        })),

      completeOnboarding: () =>
        set((s) => ({ onboarding: { ...s.onboarding, completed: true } })),

      // ── Actions user ──
      setUser:  (data) => set((s) => ({ user: { ...s.user, ...data } })),
      setPlan:  (plan) => set((s) => ({ user: { ...s.user, plan } })),
      hydrateFromServer: (snapshot) =>
        set((s) => ({
          user: { ...s.user, ...(snapshot.user || {}) },
          onboarding: {
            ...s.onboarding,
            ...(snapshot.onboarding || {}),
            restaurant: {
              ...s.onboarding.restaurant,
              ...(snapshot.onboarding?.restaurant || {}),
            },
            clientele: {
              ...s.onboarding.clientele,
              ...(snapshot.onboarding?.clientele || {}),
            },
            preferences: {
              ...s.onboarding.preferences,
              ...(snapshot.onboarding?.preferences || {}),
            },
          },
          usage: { ...s.usage, ...(snapshot.usage || {}) },
          posts: Array.isArray(snapshot.posts) ? snapshot.posts : s.posts,
          ideas: Array.isArray(snapshot.ideas) ? snapshot.ideas : s.ideas,
          savedIdeas: Array.isArray(snapshot.savedIdeas) ? snapshot.savedIdeas : s.savedIdeas,
          reels: Array.isArray(snapshot.reels) ? snapshot.reels : s.reels,
          brandKit: { ...s.brandKit, ...(snapshot.brandKit || {}) },
        })),
      resetSessionState: () =>
        set(() => ({
          ...createDefaultAppState(),
        })),

      // ── Actions usage ──

      incrementIdeasUsed: () =>
        set((s) => ({
          usage: { ...s.usage, ideasUsedThisWeek: (s.usage.ideasUsedThisWeek ?? 0) + 1 },
        })),

      incrementDishPhotoUsed: () =>
        set((s) => ({
          usage: { ...s.usage, dishPhotoUsedThisMonth: (s.usage.dishPhotoUsedThisMonth ?? 0) + 1 },
        })),

      incrementRestaurantBrainUsed: () =>
        set((s) => ({
          usage: { ...s.usage, restaurantBrainUsedThisMonth: (s.usage.restaurantBrainUsedThisMonth ?? 0) + 1 },
        })),

      incrementVideoScriptUsed: () =>
        set((s) => ({
          usage: { ...s.usage, videoScriptUsedThisMonth: (s.usage.videoScriptUsedThisMonth ?? 0) + 1 },
        })),

      incrementCaptionUsed: () =>
        set((s) => ({
          usage: { ...s.usage, captionUsedThisMonth: (s.usage.captionUsedThisMonth ?? 0) + 1 },
        })),

      resetUsage: () =>
        set(() => ({
          usage: createDefaultUsage(),
        })),

      /**
       * À appeler au démarrage (App.jsx).
       * Remet à zéro les compteurs si le lundi ou le mois a changé.
       * Compatible avec les stores persistés sans les nouveaux champs (défaut → 0).
       */
      checkUsageReset: () =>
        set((s) => {
          const u = s.usage
          const thisMonday = getThisMonday()
          const thisMonth  = getThisMonth()

          const weekChanged  = (u.weekStart  ?? '') !== thisMonday
          const monthChanged = (u.monthStart ?? '') !== thisMonth

          if (!weekChanged && !monthChanged) return {}

          return {
            usage: {
              ideasUsedThisWeek:            weekChanged  ? 0 : (u.ideasUsedThisWeek ?? 0),
              weekStart:                    thisMonday,
              dishPhotoUsedThisMonth:       monthChanged ? 0 : (u.dishPhotoUsedThisMonth ?? 0),
              restaurantBrainUsedThisMonth: monthChanged ? 0 : (u.restaurantBrainUsedThisMonth ?? 0),
              videoScriptUsedThisMonth:     monthChanged ? 0 : (u.videoScriptUsedThisMonth ?? 0),
              captionUsedThisMonth:         monthChanged ? 0 : (u.captionUsedThisMonth ?? 0),
              videoReelUsedThisMonth:       monthChanged ? 0 : (u.videoReelUsedThisMonth ?? 0),
              monthStart:                   thisMonth,
            },
          }
        }),

      // ── Actions posts ──
      setPosts: (posts) => set({ posts }),

      addPost: (post) => set((s) => ({ posts: [...s.posts, post] })),

      updatePostStatus: (id, status) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      removePost: (id) =>
        set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

      updatePostDate: (id, date) => {
        const FR_DAYS  = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const FR_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
        const d = new Date(date + 'T12:00:00')
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id
              ? { ...p, date, day: FR_DAYS[d.getDay()], dayShort: FR_SHORT[d.getDay()] }
              : p
          ),
        }))
      },

      // ── Actions ideas ──
      setMenuPhoto:     (photo)   => set({ menuPhoto: photo }),
      setIdeas:         (ideas)   => set({ ideas }),
      addIdea:          (idea)    => set((s) => (
        s.ideas.some((i) => i.id === idea.id)
          ? {}
          : { ideas: [idea, ...s.ideas] }
      )),
      setIdeasLoading:  (loading) => set({ ideasLoading: loading }),

      // ── Actions studio ──
      setClips: (clips) =>
        set((s) => ({ studio: { ...s.studio, clips } })),
      addClip: (clip) =>
        set((s) => ({ studio: { ...s.studio, clips: [...s.studio.clips, clip] } })),
      removeClip: (id) =>
        set((s) => ({ studio: { ...s.studio, clips: s.studio.clips.filter((c) => c.id !== id) } })),
      setDirective: (directive) =>
        set((s) => ({ studio: { ...s.studio, directive } })),
      setRenderStatus: (status) =>
        set((s) => ({ studio: { ...s.studio, renderStatus: status } })),
      setRenderUrl: (url) =>
        set((s) => ({ studio: { ...s.studio, renderUrl: url } })),
      setRenderId: (id) =>
        set((s) => ({ studio: { ...s.studio, renderId: id } })),
      resetStudio: () =>
        set(() => ({
          studio: createDefaultStudio(),
        })),

      incrementVideoReelUsed: () =>
        set((s) => ({
          usage: { ...s.usage, videoReelUsedThisMonth: (s.usage.videoReelUsedThisMonth ?? 0) + 1 },
        })),

      // ── Actions reels ──
      addReel: (reel) =>
        set((s) => ({ reels: [reel, ...s.reels].slice(0, 50) })),
      removeReel: (id) =>
        set((s) => ({ reels: s.reels.filter((r) => r.id !== id) })),
      updateReelStatus: (id, status) =>
        set((s) => ({
          reels: s.reels.map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      // ── Actions brand kit ──
      setBrandKit: (data) =>
        set((s) => ({ brandKit: { ...s.brandKit, ...data } })),
      resetBrandKit: () =>
        set(() => ({ brandKit: createDefaultBrandKit() })),

      // ── Actions bibliothèque ──
      saveIdea: (idea) =>
        set((s) => ({
          savedIdeas: s.savedIdeas.some((i) => i.id === idea.id)
            ? s.savedIdeas.filter((i) => i.id !== idea.id)
            : [...s.savedIdeas, idea],
        })),
    }),
    {
      name: 'postchef-store',
      partialize: (state) => ({
        onboarding: state.onboarding,
        user:       state.user,
        usage:      state.usage,
        posts:      state.posts,
        ideas:      state.ideas,
        savedIdeas: state.savedIdeas,
        reels:      state.reels,
        brandKit:   state.brandKit,
        menuPhoto:  state.menuPhoto,
      }),
      // Migrations au rehydrate
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Corriger user.id manquant ou prenom démo
        if (!state.user?.id) {
          state.user = { ...state.user, id: crypto.randomUUID() }
        }
        if (state.user?.prenom === 'Marco') {
          state.user = { ...state.user, prenom: '' }
        }

        // B1 — Migrer les posts legacy (day: "Lundi") vers ISO date
        const DAY_TO_IDX = { Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5, Dimanche: 6 }
        const FR_DAYS    = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const FR_SHORT   = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
        if (Array.isArray(state.posts)) {
          const todayDow = (new Date().getDay() + 6) % 7 // lundi = 0
          const monday = new Date()
          monday.setDate(new Date().getDate() - todayDow)
          monday.setHours(12, 0, 0, 0)

          state.posts = state.posts.map((p) => {
            if (p.date) return p // déjà ISO — rien à faire
            const dayIdx = DAY_TO_IDX[p.day] ?? 0
            const d = new Date(monday)
            d.setDate(monday.getDate() + dayIdx)
            const iso = d.toISOString().split('T')[0]
            return {
              ...p,
              date:     iso,
              day:      FR_DAYS[d.getDay()],
              dayShort: FR_SHORT[d.getDay()],
            }
          })
        }
      },
    }
  )
)

export default useAppStore
