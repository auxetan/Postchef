import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Helpers date ─────────────────────────────────────────────────────────────

/** Retourne la date ISO du lundi de la semaine courante */
function getThisMonday() {
  const d = new Date()
  const day = d.getDay() // 0=Dim, 1=Lun, …, 6=Sam
  const diff = day === 0 ? -6 : 1 - day // décalage vers lundi
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

/** Retourne 'YYYY-MM' du mois courant */
function getThisMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ────────────────────────────────────────────────────────────────────────────

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Onboarding ──
      onboarding: {
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
      },

      // ── User ──
      user: {
        id: null,
        prenom: 'Marco',
        email: '',
        plan: 'starter', // 'starter' | 'pro_monthly' | 'pro_annual'
        planExpiry: null,
      },

      // ── Usage (quotas IA) ──
      // weekStart : lundi ISO de la semaine courante
      // monthStart : 'YYYY-MM' du mois courant
      usage: {
        // Idées IA — reset chaque lundi
        ideasUsedThisWeek:           0,
        weekStart:                   getThisMonday(),
        // Photos DALL-E — reset 1er du mois (Pro Annual uniquement)
        dishPhotoUsedThisMonth:      0,
        // Analyses RestaurantBrain — reset 1er du mois
        restaurantBrainUsedThisMonth: 0,
        // Scripts vidéo IA — reset 1er du mois
        videoScriptUsedThisMonth:    0,
        // Légendes QuickCapture — reset 1er du mois
        captionUsedThisMonth:        0,
        // Reels Studio — reset 1er du mois
        videoReelUsedThisMonth:      0,
        monthStart:                  getThisMonth(),
      },

      // ── Menu photo ──
      menuPhoto: null,

      // ── Posts (calendrier) ──
      posts: [],

      // ── Ideas ──
      ideas: [],
      ideasLoading: false,

      // ── Bibliothèque d'idées sauvegardées ──
      savedIdeas: [],

      // ── Studio (Virality Engine) ──
      studio: {
        clips: [],           // [{ id, file, url, duration, thumbnail, frames, analysisLabel }]
        directive: null,     // ViralityDirective JSON généré par Claude
        renderStatus: null,  // null | 'pending' | 'rendering' | 'done' | 'error'
        renderUrl: null,     // URL du MP4 final Creatomate
        renderId: null,      // ID du render Creatomate pour polling
        lastGenerated: null, // ISO date
      },

      // ── Historique des Reels créés ──
      reels: [],             // max 50 — [{ id, createdAt, videoUrl, directive, platform, status }]

      // ── Brand Kit (logo, couleurs, font) ──
      brandKit: {
        logoDataUrl: null,       // base64 data URL du logo (upload local)
        primaryColor: '#1D9E75', // couleur principale (défaut: pc-green)
        accentColor:  '#0F172A', // couleur accent (défaut: pc-ink)
        fontFamily:   'sans',    // 'sans' | 'serif' | 'display'
      },

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
          usage: {
            ideasUsedThisWeek:            0,
            weekStart:                    getThisMonday(),
            dishPhotoUsedThisMonth:       0,
            restaurantBrainUsedThisMonth: 0,
            videoScriptUsedThisMonth:     0,
            captionUsedThisMonth:         0,
            videoReelUsedThisMonth:       0,
            monthStart:                   getThisMonth(),
          },
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
          studio: { clips: [], directive: null, renderStatus: null, renderUrl: null, renderId: null, lastGenerated: null },
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
      }),
    }
  )
)

export default useAppStore
