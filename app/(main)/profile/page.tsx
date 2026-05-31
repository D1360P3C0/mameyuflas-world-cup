/**
 * Página de perfil propio — Ultra-Strike Design.
 * FASE 1: Muestra datos del usuario + formulario de edición.
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Flag } from '@/components/ui/flag'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/components/ui/avatar'
import { EditProfileForm } from '@/features/auth/components/EditProfileForm'
import { AvatarUpload } from '@/features/auth/components/AvatarUpload'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Mi Perfil' }

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-5 mwc-fade-in pb-40">

      {/* Header de perfil */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <AvatarUpload
              currentSrc={profile.avatar_url}
              initials={getInitials(profile.display_name)}
              displayName={profile.display_name}
            />
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-white">
                {profile.display_name}
              </h1>
              <p className="text-sm text-white/40">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-1 text-sm text-white/60 max-w-sm">{profile.bio}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/40">
                {profile.country_code && (
                  <span className="flex items-center gap-1">
                    <Flag
                      countryCode={profile.country_code}
                      alt={profile.country_code}
                      size={16}
                      sourceWidth={20}
                      className="rounded-[2px]"
                      imageClassName="rounded-[2px]"
                      fallbackClassName="rounded-[2px]"
                    />
                    {profile.country_code}
                  </span>
                )}
                {profile.favorite_team && (
                  <span className="flex items-center gap-1">
                    ⚽ {profile.favorite_team}
                  </span>
                )}
                <span>
                  Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', {
                    month: 'long',
                    year:  'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas placeholder */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Puntos totales', value: '—', color: '#FF5E9F' },
          { label: 'Predicciones',  value: '—', color: '#8B5CF6' },
          { label: 'Posición',      value: '—', color: '#fbbf24' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4 text-center">
              <p
                className="font-heading text-2xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/35">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulario de edición */}
      <Card>
        <CardHeader>
          <CardTitle>Editar perfil</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EditProfileForm profile={profile} />
        </CardContent>
      </Card>

      {/* Info de cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Email</span>
              <span className="text-white/70">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Proveedor</span>
              <span className="capitalize text-white/70">
                {user.app_metadata.provider ?? 'email'}
              </span>
            </div>
            {profile.is_admin && (
              <div className="flex justify-between">
                <span className="text-white/40">Rol</span>
                <span className="rounded-full bg-[#FF5E9F]/15 border border-[#FF5E9F]/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#FF5E9F]">
                  Admin
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
