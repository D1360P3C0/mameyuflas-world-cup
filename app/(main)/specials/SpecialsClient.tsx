'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { upsertSpecialPredictionsAction } from '@/features/predictions/actions/predictions.actions'
import { areSpecialPredictionsLocked } from '@/features/predictions/utils/prediction.utils'
import type { Tables } from '@/types/database.types'

type Team = Tables<'teams'>
type SpecialPrediction = Tables<'special_predictions'>

interface WorldPlayer {
  id: string
  name: string
  position: string
  team_id: string
}

const STAR_SCORERS = ['Kylian Mbappe', 'Erling Haaland', 'Vinicius Jr', 'Lionel Messi', 'Jude Bellingham', 'Lamine Yamal']
const STAR_MVPS = ['Kylian Mbappe', 'Jude Bellingham', 'Vinicius Jr', 'Pedri', 'Jamal Musiala', 'Lamine Yamal']

interface Props {
  initialPrediction: SpecialPrediction | null
  teams: Team[]
  players: WorldPlayer[]
}

export function SpecialsClient({ initialPrediction, teams, players }: Props) {
  const locked = areSpecialPredictionsLocked()

  const [champion, setChampion] = useState(initialPrediction?.champion_team_id ?? '')
  const [runnerUp, setRunnerUp] = useState(initialPrediction?.runner_up_team_id ?? '')
  const [topScorer, setTopScorer] = useState(initialPrediction?.top_scorer ?? '')
  const [mvp, setMvp] = useState(initialPrediction?.mvp ?? '')
  const [goalkeeper, setGoalkeeper] = useState(initialPrediction?.best_goalkeeper ?? '')
  const [revelationTeam, setRevelationTeam] = useState(initialPrediction?.revelation_team_id ?? '')
  const [mostGoalsTeam, setMostGoalsTeam] = useState(
    initialPrediction?.most_goals_in_groups_team_id ?? ''
  )
  const [fewestGoalsTeam, setFewestGoalsTeam] = useState(
    initialPrediction?.fewest_goals_against_in_groups_team_id ?? ''
  )

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(Boolean(initialPrediction))
  const [error, setError] = useState<string | null>(null)

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name))

  const handleSave = async () => {
    if (locked) return
    setIsSaving(true)
    setError(null)

    const result = await upsertSpecialPredictionsAction({
      champion_team_id: champion || null,
      runner_up_team_id: runnerUp || null,
      top_scorer: topScorer || null,
      mvp: mvp || null,
      best_goalkeeper: goalkeeper || null,
      revelation_team_id: revelationTeam || null,
      most_goals_in_groups_team_id: mostGoalsTeam || null,
      fewest_goals_against_in_groups_team_id: fewestGoalsTeam || null,
    })

    setIsSaving(false)
    if ('error' in result) {
      setError(result.error)
      return
    }

    setSaved(true)
  }

  return (
    <div className="px-4 pt-6 pb-32 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="font-heading text-[28px] font-bold text-white mb-1">
          Predicciones Especiales
        </h2>
        <p className="font-body text-white/60">
          Extras de torneo, podio y picks para mantener la remontada viva hasta el final.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <PlayerPanel
          title="Maximo Goleador"
          badge="30 PTS"
          accent="pink"
          value={topScorer}
          onChange={setTopScorer}
          disabled={locked}
          players={players}
          suggestions={STAR_SCORERS}
          placeholder="Buscar goleador..."
        />

        <PlayerPanel
          title="MVP"
          badge="24 PTS"
          accent="cyan"
          value={mvp}
          onChange={setMvp}
          disabled={locked}
          players={players}
          suggestions={STAR_MVPS}
          placeholder="Buscar MVP..."
        />

        <PlayerPanel
          title="Mejor Portero"
          badge="18 PTS"
          accent="gold"
          value={goalkeeper}
          onChange={setGoalkeeper}
          disabled={locked}
          players={players.filter((player) => player.position === 'GK')}
          suggestions={[]}
          placeholder="Buscar portero..."
        />

        <TeamPanel
          title="Seleccion Revelacion"
          badge="24 PTS"
          accent="violet"
          value={revelationTeam}
          onChange={setRevelationTeam}
          disabled={locked}
          teams={sortedTeams}
          placeholder="Elige la seleccion revelacion"
        />

        <TeamPanel
          title="Mas Goleadora en Grupos"
          badge="15 PTS"
          accent="pink"
          value={mostGoalsTeam}
          onChange={setMostGoalsTeam}
          disabled={locked}
          teams={sortedTeams}
          placeholder="Elige la mas goleadora"
        />

        <TeamPanel
          title="Menos Goleada en Grupos"
          badge="15 PTS"
          accent="cyan"
          value={fewestGoalsTeam}
          onChange={setFewestGoalsTeam}
          disabled={locked}
          teams={sortedTeams}
          placeholder="Elige la mas solida"
        />

        <section className="glass-card rounded-xl p-5 md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb0c9]">emoji_events</span>
            <div>
              <h3 className="font-heading text-2xl font-semibold text-white">Final y Campeon</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Campeon 100 pts · Subcampeon 50 pts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="Campeon"
              value={champion}
              onChange={setChampion}
              disabled={locked}
              teams={sortedTeams}
              placeholder="Selecciona el campeon"
            />
            <SelectField
              label="Subcampeon"
              value={runnerUp}
              onChange={setRunnerUp}
              disabled={locked}
              teams={sortedTeams.filter((team) => team.id !== champion)}
              placeholder="Selecciona el subcampeon"
            />
          </div>
        </section>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-4 py-2 text-sm text-[#f87171]">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-4">
        {locked || saved ? (
          <div className="flex flex-col items-center gap-2">
            <span
              className="material-symbols-outlined text-[32px] text-[#4ade80]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <p className="font-mono text-[13px] font-semibold text-[#4ade80] flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              {locked ? 'Predicciones cerradas' : 'Predicciones ya guardadas'}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-5 bg-[#383848] border border-white/10 rounded-full font-heading font-bold text-white hover:bg-[#343344] transition-colors flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined">lock</span>
            {isSaving ? 'Guardando...' : 'Bloquear Predicciones'}
          </button>
        )}
      </div>
    </div>
  )
}

function PlayerPanel({
  title,
  badge,
  accent,
  value,
  onChange,
  disabled,
  players,
  suggestions,
  placeholder,
}: {
  title: string
  badge: string
  accent: 'pink' | 'cyan' | 'gold' | 'violet'
  value: string
  onChange: (value: string) => void
  disabled: boolean
  players: WorldPlayer[]
  suggestions: string[]
  placeholder: string
}) {
  return (
    <section className="glass-card rounded-xl p-5">
      <PanelHeader title={title} badge={badge} accent={accent} />
      <PlayerAutocomplete
        value={value}
        onChange={onChange}
        players={players}
        placeholder={placeholder}
        disabled={disabled}
        accentColor={getAccentColor(accent)}
      />

      {suggestions.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {suggestions.map((player) => (
            <button
              key={player}
              type="button"
              disabled={disabled}
              onClick={() => onChange(player)}
              className={cn('flex-shrink-0 flex flex-col items-center gap-1', disabled && 'opacity-50')}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-full border-2 flex items-center justify-center font-heading font-black text-white text-xs bg-[#292839] transition-all',
                  value === player ? getSelectedRing(accent) : 'border-white/10 opacity-70 hover:opacity-100'
                )}
              >
                {player
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <p className="font-mono text-[11px] text-center text-white/70 w-16 truncate">{player}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function TeamPanel({
  title,
  badge,
  accent,
  value,
  onChange,
  disabled,
  teams,
  placeholder,
}: {
  title: string
  badge: string
  accent: 'pink' | 'cyan' | 'gold' | 'violet'
  value: string
  onChange: (value: string) => void
  disabled: boolean
  teams: Team[]
  placeholder: string
}) {
  return (
    <section className="glass-card rounded-xl p-5">
      <PanelHeader title={title} badge={badge} accent={accent} />
      <SelectField
        label={title}
        value={value}
        onChange={onChange}
        disabled={disabled}
        teams={teams}
        placeholder={placeholder}
      />
    </section>
  )
}

function PanelHeader({
  title,
  badge,
  accent,
}: {
  title: string
  badge: string
  accent: 'pink' | 'cyan' | 'gold' | 'violet'
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-heading text-xl font-semibold text-white">{title}</h3>
      <span className={cn('rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest', getBadgeClasses(accent))}>
        {badge}
      </span>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  teams,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
  teams: Team[]
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-white/70">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#FF5E9F]/60 focus:ring-2 focus:ring-[#FF5E9F]/20 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#1A1A2E] [&>option]:text-white"
      >
        <option value="">{placeholder}</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function PlayerAutocomplete({
  value,
  onChange,
  players,
  placeholder,
  disabled,
  accentColor,
}: {
  value: string
  onChange: (value: string) => void
  players: WorldPlayer[]
  placeholder: string
  disabled: boolean
  accentColor: string
}) {
  const [open, setOpen] = useState(false)

  const matches = value.trim().length > 0
    ? players.filter((player) => player.name.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-[#1E1E2E] border-none rounded-lg py-3 pl-10 pr-4 text-white font-body focus:ring-2 outline-none transition-all placeholder:text-white/30 disabled:opacity-50"
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />

      {open && matches.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#1A1A2E] shadow-2xl max-h-56 overflow-y-auto">
          {matches.map((player) => (
            <button
              key={player.id}
              type="button"
              onMouseDown={() => {
                onChange(player.name)
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold bg-white/10 text-white/70">
                {player.position}
              </span>
              <span className="flex-1 truncate text-sm text-white font-body">{player.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-white/40">{player.team_id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getAccentColor(accent: 'pink' | 'cyan' | 'gold' | 'violet'): string {
  if (accent === 'cyan') return '#00dce5'
  if (accent === 'gold') return '#f59e0b'
  if (accent === 'violet') return '#8b5cf6'
  return '#FF5E9F'
}

function getBadgeClasses(accent: 'pink' | 'cyan' | 'gold' | 'violet'): string {
  if (accent === 'cyan') return 'bg-[#00dce5]/15 border-[#00dce5]/30 text-[#8be9fd]'
  if (accent === 'gold') return 'bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#fcd34d]'
  if (accent === 'violet') return 'bg-[#8b5cf6]/15 border-[#8b5cf6]/30 text-[#d0bcff]'
  return 'bg-[#FF5E9F]/15 border-[#FF5E9F]/30 text-[#ffb0c9]'
}

function getSelectedRing(accent: 'pink' | 'cyan' | 'gold' | 'violet'): string {
  if (accent === 'cyan') return 'border-[#00dce5] shadow-[0_0_12px_rgba(0,220,229,0.4)]'
  if (accent === 'gold') return 'border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
  if (accent === 'violet') return 'border-[#8b5cf6] shadow-[0_0_12px_rgba(139,92,246,0.4)]'
  return 'border-[#FF5E9F] shadow-[0_0_12px_rgba(255,94,159,0.4)]'
}
