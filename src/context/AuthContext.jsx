import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import useAppStore from '../store/useAppStore.js'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'
import { loadWorkspaceForUser, saveWorkspaceForUser } from '../services/supabaseWorkspace.js'

const DEMO_SESSION_KEY = 'postchef-demo-session-v1'

export const AuthContext = createContext(null)

function readDemoSession() {
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.email) return null
    return {
      user: {
        id: parsed.id || 'demo-user',
        email: parsed.email,
        user_metadata: { first_name: parsed.firstName || 'Demo' },
      },
    }
  } catch {
    return null
  }
}

function writeDemoSession({ email, firstName }) {
  const payload = {
    id: 'demo-user',
    email,
    firstName,
  }
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(payload))
  return {
    user: {
      id: payload.id,
      email: payload.email,
      user_metadata: { first_name: payload.firstName },
    },
  }
}

function clearDemoSession() {
  window.localStorage.removeItem(DEMO_SESSION_KEY)
}

function syncStoreUser(authUser) {
  const fallbackName = authUser?.user_metadata?.first_name || authUser?.email?.split('@')[0] || 'Marco'
  useAppStore.getState().setUser({
    id: authUser?.id || null,
    email: authUser?.email || '',
    prenom: fallbackName,
  })
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [syncError, setSyncError] = useState(null)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demoSession = readDemoSession()
      setSession(demoSession)
      if (demoSession?.user) {
        syncStoreUser(demoSession.user)
      } else {
        useAppStore.getState().resetSessionState()
      }
      setSyncStatus(demoSession ? 'demo' : 'idle')
      setLoading(false)
      return undefined
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        syncStoreUser(data.session.user)
      } else {
        useAppStore.getState().resetSessionState()
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (nextSession?.user) {
        syncStoreUser(nextSession.user)
      } else {
        useAppStore.getState().resetSessionState()
        setSyncStatus('idle')
        setSyncError(null)
      }
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user) return undefined

    let active = true
    let isBootstrapping = true
    let unsubscribeStore = null

    async function bootstrapWorkspace() {
      setSyncStatus('loading')
      setSyncError(null)

      const snapshot = await loadWorkspaceForUser(supabase, session.user)
      if (!active) return

      useAppStore.getState().hydrateFromServer(snapshot)
      setSyncStatus('ready')
      isBootstrapping = false

      unsubscribeStore = useAppStore.subscribe((state) => {
        if (isBootstrapping) return
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

        saveTimerRef.current = window.setTimeout(async () => {
          try {
            setSyncStatus('saving')
            await saveWorkspaceForUser(supabase, session.user, state)
            if (!active) return
            setSyncStatus('ready')
            setSyncError(null)
          } catch (error) {
            console.error('[auth] workspace_save_failed', error)
            if (!active) return
            setSyncStatus('error')
            setSyncError(error.message || 'La sauvegarde distante a échoué.')
          }
        }, 800)
      })
    }

    bootstrapWorkspace().catch((error) => {
      console.error('[auth] workspace_bootstrap_failed', error)
      if (!active) return
      setSyncStatus('error')
      setSyncError(error.message || 'Le chargement du workspace a échoué.')
    })

    return () => {
      active = false
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      unsubscribeStore?.()
    }
  }, [session?.user?.id])

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      loading,
      syncStatus,
      syncError,
      isConfigured: isSupabaseConfigured,
      isDemoMode: !isSupabaseConfigured,
      async signIn({ email, password }) {
        if (!isSupabaseConfigured) {
          const demoSession = writeDemoSession({
            email,
            firstName: email.split('@')[0] || 'Demo',
          })
          setSession(demoSession)
          syncStoreUser(demoSession.user)
          setSyncStatus('demo')
          return { error: null }
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
      },
      async signUp({ email, password, firstName }) {
        if (!isSupabaseConfigured) {
          const demoSession = writeDemoSession({ email, firstName })
          setSession(demoSession)
          syncStoreUser(demoSession.user)
          setSyncStatus('demo')
          return { error: null, needsEmailConfirmation: false }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        })

        return {
          error,
          needsEmailConfirmation: Boolean(data.user && !data.session),
        }
      },
      async resetPassword(email) {
        if (!isSupabaseConfigured) {
          return { error: new Error('Supabase n’est pas configuré pour le reset email.') }
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })
        return { error }
      },
      async signOut() {
        if (!isSupabaseConfigured) {
          clearDemoSession()
          useAppStore.getState().resetSessionState()
          setSession(null)
          setSyncStatus('idle')
          return { error: null }
        }

        const { error } = await supabase.auth.signOut()
        if (!error) {
          useAppStore.getState().resetSessionState()
        }
        return { error }
      },
    }),
    [loading, session, syncError, syncStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
