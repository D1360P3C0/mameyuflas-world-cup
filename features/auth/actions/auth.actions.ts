'use server'

/**
 * Server Actions de autenticación.
 *
 * IMPORTANTE: estas acciones solo se llaman desde Client Components
 * (formularios de login/register). Todas validan con Zod antes de
 * tocar Supabase.
 *
 * Patrón de retorno:
 *   - Éxito -> { success: true }
 *   - Error -> { error: string }
 *
 * La navegación post-éxito la hace el cliente (router.push).
 * Excepción: logoutAction redirige directamente (es un form action).
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
} from '@/lib/validations/auth.schemas'

type SuccessResult = { success: true }
type ErrorResult = { error: string }
type ActionResult = SuccessResult | ErrorResult
type RegisterSuccessResult = {
  success: true
  needsEmailConfirmation: boolean
  surpriseTeamPending: boolean
}
type RegisterActionResult = RegisterSuccessResult | ErrorResult

function isSurpriseTeamSignupError(message: string) {
  return (
    message.includes('Database error saving new user') ||
    message.includes('surprise_team_id') ||
    message.includes('handle_new_user')
  )
}

// -----------------------------------------------
// Login con email + password
// -----------------------------------------------
export async function loginAction(data: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('invalid_credentials')
    ) {
      return { error: 'Email o contraseña incorrectos' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Confirma tu email antes de entrar' }
    }
    if (error.message.includes('Too many requests')) {
      return { error: 'Demasiados intentos. Espera unos minutos.' }
    }
    return { error: 'Error al iniciar sesión. Inténtalo de nuevo.' }
  }

  return { success: true }
}

// -----------------------------------------------
// Registro de nuevo usuario
// -----------------------------------------------
export async function registerAction(
  data: RegisterInput,
  surpriseTeamId?: string | null
): Promise<RegisterActionResult> {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const signUp = (includeSurpriseTeam: boolean) =>
    supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          username: parsed.data.username,
          full_name: parsed.data.displayName,
          ...(includeSurpriseTeam && surpriseTeamId
            ? { surprise_team_id: surpriseTeamId }
            : {}),
        },
      },
    })

  let { data: authData, error } = await signUp(true)
  let surpriseTeamPending = false

  // Si el trigger de perfil en producción no acepta todavía surprise_team_id,
  // no bloqueamos el alta completa: reintentamos sin ese metadata.
  if (error && surpriseTeamId && isSurpriseTeamSignupError(error.message)) {
    const fallback = await signUp(false)
    authData = fallback.data
    error = fallback.error
    surpriseTeamPending = !fallback.error
  }

  if (error) {
    if (
      error.message.includes('already registered') ||
      error.message.includes('user_already_exists')
    ) {
      return { error: 'Ya existe una cuenta con ese email' }
    }
    if (error.message.includes('Password should be at least')) {
      return { error: 'La contraseña debe tener al menos 8 caracteres' }
    }
    if (
      error.message.includes('email rate limit exceeded') ||
      error.message.includes('over_email_send_rate_limit')
    ) {
      return {
        error:
          'Has intentado crear cuentas demasiadas veces en poco tiempo. Espera unos minutos antes de volver a intentarlo.',
      }
    }
    if (error.message.includes('Database error saving new user')) {
      return {
        error:
          'Error al crear la cuenta en la base de datos. Revisa que las migraciones de Supabase estén aplicadas.',
      }
    }
    return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' }
  }

  return {
    success: true,
    needsEmailConfirmation: !authData?.session,
    surpriseTeamPending,
  }
}

// -----------------------------------------------
// Cierre de sesión (redirige directamente)
// Usar como form action: <form action={logoutAction}>
// -----------------------------------------------
export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.LOGIN)
}

// -----------------------------------------------
// Recuperación de contraseña por email
// -----------------------------------------------
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Email inválido' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl}/auth/reset-password`,
    }
  )

  if (error) {
    return { error: 'No se pudo enviar el email. Inténtalo de nuevo.' }
  }

  return { success: true }
}

// -----------------------------------------------
// Sign In con Google OAuth
// Redirige al proveedor OAuth (lanza redirect internamente)
// -----------------------------------------------
export async function signInWithGoogleAction(): Promise<ErrorResult | void> {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}${ROUTES.AUTH_CALLBACK}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: 'Error al conectar con Google. Inténtalo de nuevo.' }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'No se pudo iniciar sesión con Google.' }
}

// -----------------------------------------------
// Actualizar perfil del usuario autenticado
// -----------------------------------------------
export async function updateProfileAction(formData: {
  display_name: string
  bio?: string
  country_code?: string
  favorite_team?: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No estás autenticado' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: formData.display_name.trim(),
      bio: formData.bio?.trim() || null,
      country_code: formData.country_code || null,
      favorite_team: formData.favorite_team || null,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'No se pudo actualizar el perfil' }
  }

  return { success: true }
}

// -----------------------------------------------
// Subir foto de perfil a Supabase Storage
// -----------------------------------------------
export async function uploadAvatarAction(
  formData: FormData
): Promise<ActionResult & { avatarUrl?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No estás autenticado' }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'No se encontró el archivo' }

  // Max 5 MB
  if (file.size > 5 * 1024 * 1024) return { error: 'La imagen no puede superar 5 MB' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

  if (uploadError) {
    return { error: 'Error al subir la imagen. Comprueba que el bucket "avatars" existe.' }
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
  // Cache-bust para forzar reload de la imagen
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (updateError) return { error: 'Imagen subida pero no se pudo actualizar el perfil' }

  return { success: true, avatarUrl }
}

// -----------------------------------------------
// Guardar equipo sorpresa ("Ojito con")
// -----------------------------------------------
export async function saveSurpriseTeamAction(
  surpriseTeamId: string | null
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No estás autenticado' }
  }

  if (surpriseTeamId) {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', surpriseTeamId)
      .maybeSingle()

    if (!team) {
      return { error: 'Ese equipo sorpresa ya no está disponible' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      surprise_team_id: surpriseTeamId,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'No se pudo guardar tu equipo sorpresa' }
  }

  return { success: true }
}
