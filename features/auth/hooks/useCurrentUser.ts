'use client'

/**
 * Hook para obtener el usuario autenticado en Client Components.
 *
 * Combina la sesión de Supabase Auth con el perfil de la tabla profiles.
 * Se suscribe a cambios de auth para actualización en tiempo real.
 *
 * Para Server Components, usar directamente createClient() de @/lib/supabase/server.
 *
 * Uso:
 *   const { user, profile, isLoading } = useCurrentUser()
 */
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/app.types'

type CurrentUserState = {
  user:      User | null
  profile:   Profile | null
  isLoading: boolean
}

export function useCurrentUser(): CurrentUserState {
  const [state, setState] = useState<CurrentUserState>({
    user:      null,
    profile:   null,
    isLoading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    async function loadUserAndProfile(user: User | null) {
      if (!user) {
        setState({ user: null, profile: null, isLoading: false })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setState({ user, profile, isLoading: false })
    }

    // Carga inicial
    supabase.auth.getUser().then(({ data }) => {
      loadUserAndProfile(data.user)
    })

    // Suscripción a cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserAndProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
