'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Flag } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton'
import {
  registerAction,
  saveSurpriseTeamAction,
} from '@/features/auth/actions/auth.actions'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth.schemas'

type SurpriseTeam = {
  id: string
  countryCode: string
  name: string
  group: string
}

type RegisterResult = Awaited<ReturnType<typeof registerAction>>

const SURPRISE_TEAMS: SurpriseTeam[] = [
  { id: 'MEX', countryCode: 'MX', name: 'Mexico', group: 'A' },
  { id: 'RSA', countryCode: 'ZA', name: 'Sudafrica', group: 'A' },
  { id: 'KOR', countryCode: 'KR', name: 'Corea del Sur', group: 'A' },
  { id: 'CZE', countryCode: 'CZ', name: 'Republica Checa', group: 'A' },
  { id: 'CAN', countryCode: 'CA', name: 'Canada', group: 'B' },
  { id: 'BIH', countryCode: 'BA', name: 'Bosnia y Herzegovina', group: 'B' },
  { id: 'QAT', countryCode: 'QA', name: 'Qatar', group: 'B' },
  { id: 'SUI', countryCode: 'CH', name: 'Suiza', group: 'B' },
  { id: 'BRA', countryCode: 'BR', name: 'Brasil', group: 'C' },
  { id: 'MAR', countryCode: 'MA', name: 'Marruecos', group: 'C' },
  { id: 'HAI', countryCode: 'HT', name: 'Haiti', group: 'C' },
  { id: 'SCO', countryCode: 'SC', name: 'Escocia', group: 'C' },
  { id: 'USA', countryCode: 'US', name: 'Estados Unidos', group: 'D' },
  { id: 'PAR', countryCode: 'PY', name: 'Paraguay', group: 'D' },
  { id: 'AUS', countryCode: 'AU', name: 'Australia', group: 'D' },
  { id: 'TUR', countryCode: 'TR', name: 'Turquia', group: 'D' },
  { id: 'GER', countryCode: 'DE', name: 'Alemania', group: 'E' },
  { id: 'CUW', countryCode: 'CW', name: 'Curazao', group: 'E' },
  { id: 'CIV', countryCode: 'CI', name: 'Costa de Marfil', group: 'E' },
  { id: 'ECU', countryCode: 'EC', name: 'Ecuador', group: 'E' },
  { id: 'NED', countryCode: 'NL', name: 'Holanda', group: 'F' },
  { id: 'JPN', countryCode: 'JP', name: 'Japon', group: 'F' },
  { id: 'SWE', countryCode: 'SE', name: 'Suecia', group: 'F' },
  { id: 'TUN', countryCode: 'TN', name: 'Tunez', group: 'F' },
  { id: 'BEL', countryCode: 'BE', name: 'Belgica', group: 'G' },
  { id: 'EGY', countryCode: 'EG', name: 'Egipto', group: 'G' },
  { id: 'IRN', countryCode: 'IR', name: 'Iran', group: 'G' },
  { id: 'NZL', countryCode: 'NZ', name: 'Nueva Zelanda', group: 'G' },
  { id: 'ESP', countryCode: 'ES', name: 'Espana', group: 'H' },
  { id: 'CPV', countryCode: 'CV', name: 'Cabo Verde', group: 'H' },
  { id: 'KSA', countryCode: 'SA', name: 'Arabia Saudi', group: 'H' },
  { id: 'URU', countryCode: 'UY', name: 'Uruguay', group: 'H' },
  { id: 'FRA', countryCode: 'FR', name: 'Francia', group: 'I' },
  { id: 'SEN', countryCode: 'SN', name: 'Senegal', group: 'I' },
  { id: 'IRQ', countryCode: 'IQ', name: 'Irak', group: 'I' },
  { id: 'NOR', countryCode: 'NO', name: 'Noruega', group: 'I' },
  { id: 'ARG', countryCode: 'AR', name: 'Argentina', group: 'J' },
  { id: 'ALG', countryCode: 'DZ', name: 'Argelia', group: 'J' },
  { id: 'AUT', countryCode: 'AT', name: 'Austria', group: 'J' },
  { id: 'JOR', countryCode: 'JO', name: 'Jordania', group: 'J' },
  { id: 'POR', countryCode: 'PT', name: 'Portugal', group: 'K' },
  { id: 'COD', countryCode: 'CD', name: 'RD Congo', group: 'K' },
  { id: 'UZB', countryCode: 'UZ', name: 'Uzbekistan', group: 'K' },
  { id: 'COL', countryCode: 'CO', name: 'Colombia', group: 'K' },
  { id: 'ENG', countryCode: 'EN', name: 'Inglaterra', group: 'L' },
  { id: 'CRO', countryCode: 'HR', name: 'Croacia', group: 'L' },
  { id: 'GHA', countryCode: 'GH', name: 'Ghana', group: 'L' },
  { id: 'PAN', countryCode: 'PA', name: 'Panama', group: 'L' },
]

const FEATURED_SURPRISE_TEAM_IDS = [
  'ESP',
  'FRA',
  'ENG',
  'BRA',
  'GER',
  'ARG',
  'NED',
  'POR',
  'ECU',
  'CUW',
] as const

function RegisterStepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {[1, 2].map((currentStep) => (
        <div
          key={currentStep}
          className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            step >= currentStep ? 'bg-[#FF5E9F]' : 'bg-white/10'
          )}
        />
      ))}
    </div>
  )
}

function SurpriseTeamPicker({
  registerData,
  onBack,
  onDone,
}: {
  registerData: RegisterInput
  onBack: () => void
  onDone: (result: RegisterResult, surpriseTeamId: string | null) => Promise<void>
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllSelections, setShowAllSelections] = useState(false)

  const featuredTeams = FEATURED_SURPRISE_TEAM_IDS
    .map((id) => SURPRISE_TEAMS.find((team) => team.id === id))
    .filter((team): team is SurpriseTeam => Boolean(team))

  const selectedTeam = SURPRISE_TEAMS.find((team) => team.id === selected) ?? null

  const finishRegistration = async (surpriseTeamId: string | null) => {
    setSaving(true)
    setError(null)

    const result = await registerAction(registerData, surpriseTeamId)
    if ('error' in result) {
      setError(result.error)
      setSaving(false)
      return
    }

    await onDone(result, surpriseTeamId)
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <span
            className="material-symbols-outlined text-[40px] text-[#FF5E9F]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
        </div>
        <h2 className="mb-1 font-heading text-xl font-bold text-white">
          Ojito con...
        </h2>
        <p className="font-body text-sm text-white/50">
          Que seleccion crees que dara la sorpresa en el Mundial 2026?
          Esta prediccion se guardara en tu perfil.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {featuredTeams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => setSelected((prev) => (prev === team.id ? null : team.id))}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all active:scale-95',
              selected === team.id
                ? 'border-[#FF5E9F]/60 bg-[#FF5E9F]/15 shadow-[0_0_12px_rgba(255,94,159,0.3)]'
                : 'border-white/10 bg-[#1E1E2E]/50 hover:border-white/20'
            )}
          >
            <Flag
              countryCode={team.countryCode}
              alt={team.name}
              size={32}
              sourceWidth={40}
              className="rounded-sm shadow-sm"
              imageClassName="rounded-sm"
              fallbackClassName="rounded-sm"
            />
            <span className="text-center font-mono text-[10px] font-semibold leading-tight text-white/70">
              {team.name}
            </span>
            {selected === team.id && (
              <span
                className="material-symbols-outlined text-[14px] text-[#FF5E9F]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowAllSelections(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-[#1E1E2E]/40 px-4 py-3 font-mono text-[12px] font-semibold text-white/70 transition-colors hover:border-[#FF5E9F]/35 hover:text-white"
      >
        <span className="material-symbols-outlined text-[18px]">expand_circle_down</span>
        Mas selecciones
      </button>

      {selectedTeam && (
        <div className="flex items-center gap-3 rounded-xl border border-[#FF5E9F]/30 bg-[#FF5E9F]/10 px-4 py-3">
          <Flag
            countryCode={selectedTeam.countryCode}
            alt={selectedTeam.name}
            size={32}
            sourceWidth={40}
            className="rounded-sm shadow-sm"
            imageClassName="rounded-sm"
            fallbackClassName="rounded-sm"
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#ffb0c9]/70">
              Tu eleccion
            </p>
            <p className="text-sm font-bold text-white font-heading">
              {selectedTeam.name}
            </p>
          </div>
          <span
            className="material-symbols-outlined ml-auto text-[20px] text-[#FF5E9F]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2.5 text-sm text-[#f87171]"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="glass-card flex-1 rounded-xl border-white/10 py-3 font-mono text-[12px] font-semibold text-white/50 transition-colors hover:text-white/80 disabled:opacity-50"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={() => finishRegistration(null)}
          disabled={saving}
          className="glass-card flex-1 rounded-xl border-white/10 py-3 font-mono text-[12px] font-semibold text-white/50 transition-colors hover:text-white/80 disabled:opacity-50"
        >
          Saltar por ahora
        </button>
        <Button
          type="button"
          isLoading={saving}
          onClick={() => finishRegistration(selected)}
          disabled={!selected}
          className="min-w-[160px] flex-2"
        >
          {selectedTeam ? `Vamos con ${selectedTeam.name}` : 'Continuar'}
        </Button>
      </div>

      {showAllSelections && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#050510]/80 p-4 backdrop-blur-sm md:items-center">
          <div className="glass-card flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#ffb0c9]/70">
                  Todas las selecciones
                </p>
                <h3 className="font-heading text-lg font-bold text-white">
                  Elige tu equipo sorpresa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllSelections(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {SURPRISE_TEAMS.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      setSelected(team.id)
                      setShowAllSelections(false)
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                      selected === team.id
                        ? 'border-[#FF5E9F]/60 bg-[#FF5E9F]/15 shadow-[0_0_12px_rgba(255,94,159,0.3)]'
                        : 'border-white/10 bg-[#1E1E2E]/50 hover:border-white/20'
                    )}
                  >
                    <Flag
                      countryCode={team.countryCode}
                      alt={team.name}
                      size={28}
                      sourceWidth={40}
                      className="rounded-sm shadow-sm"
                      imageClassName="rounded-sm"
                      fallbackClassName="rounded-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-bold text-white">
                        {team.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                        Grupo {team.group}
                      </p>
                    </div>
                    {selected === team.id && (
                      <span
                        className="material-symbols-outlined text-[16px] text-[#FF5E9F]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterInput | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    setSuccessMessage(null)
    setPendingRegisterData(data)
    setStep(2)
  })

  const handleSurpriseDone = async (
    result: RegisterResult,
    surpriseTeamId: string | null
  ) => {
    if ('error' in result) {
      return
    }

    if (result.surpriseTeamPending && surpriseTeamId && !result.needsEmailConfirmation) {
      await saveSurpriseTeamAction(surpriseTeamId)
    }

    if (result.needsEmailConfirmation) {
      setSuccessMessage(
        result.surpriseTeamPending
          ? 'Cuenta creada. Revisa tu email y confirma la cuenta antes de iniciar sesion. Si tu Ojito con no aparece luego, podras guardarlo desde tu perfil.'
          : 'Cuenta creada. Revisa tu email y confirma la cuenta antes de iniciar sesion.'
      )
      setPendingRegisterData(null)
      setStep(1)
      return
    }

    router.push(ROUTES.DASHBOARD)
    router.refresh()
  }

  return (
    <>
      <RegisterStepBar step={step} />

      {successMessage && (
        <div className="mb-4 rounded-xl border border-[#4ade80]/30 bg-[#4ade80]/8 px-3 py-2.5 text-sm text-[#4ade80]">
          {successMessage}
        </div>
      )}

      {step === 1 && (
        <>
          <GoogleAuthButton label="Registrarse con Google" />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-white/30">o</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            {errors.root && (
              <div
                role="alert"
                className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2.5 text-sm text-[#f87171]"
              >
                {errors.root.message}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Nombre de usuario"
              type="text"
              autoComplete="username"
              placeholder="jugador_10"
              hint="Solo letras, numeros y guiones bajos (3-20 caracteres)"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Nombre para mostrar"
              type="text"
              autoComplete="name"
              placeholder="Sergio Ramos"
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <Input
              label="Contrasena"
              type="password"
              autoComplete="new-password"
              placeholder="Minimo 8 caracteres"
              hint="Minimo 8 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmar contrasena"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contrasena"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
              Crear cuenta
            </Button>
          </form>
        </>
      )}

      {step === 2 && pendingRegisterData && (
        <SurpriseTeamPicker
          registerData={pendingRegisterData}
          onBack={() => setStep(1)}
          onDone={handleSurpriseDone}
        />
      )}
    </>
  )
}
