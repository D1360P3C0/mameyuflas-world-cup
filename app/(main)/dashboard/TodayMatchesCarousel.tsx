'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Flag } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import type { MatchWithTeams } from '@/types/app.types'
import type { PopularPrediction, PopularPredictionsByMatch } from './dashboard.types'

interface TodayMatchesCarouselProps {
  matches: MatchWithTeams[]
  popularPredictionsByMatch: PopularPredictionsByMatch
}

type CarouselMatch = {
  id: string
  stageLabel: string
  homeTeam: {
    name: string
    code: string
    countryCode: string | null
  }
  awayTeam: {
    name: string
    code: string
    countryCode: string | null
  }
  scheduledLabel: string
  timeLabel: string
  venueLabel: string
}

const MOCKUP_MATCHES: CarouselMatch[] = [
  {
    id: 'mock-1',
    stageLabel: 'GRUPO B',
    homeTeam: { name: 'Estados Unidos', code: 'USA', countryCode: 'US' },
    awayTeam: { name: 'Mexico', code: 'MEX', countryCode: 'MX' },
    scheduledLabel: '14 jun · 20:00',
    timeLabel: '20:00',
    venueLabel: 'SoFi Stadium · Los Angeles',
  },
  {
    id: 'mock-2',
    stageLabel: 'GRUPO F',
    homeTeam: { name: 'Japon', code: 'JPN', countryCode: 'JP' },
    awayTeam: { name: 'Senegal', code: 'SEN', countryCode: 'SN' },
    scheduledLabel: '14 jun · 22:30',
    timeLabel: '22:30',
    venueLabel: 'NRG Stadium · Houston',
  },
  {
    id: 'mock-3',
    stageLabel: 'GRUPO H',
    homeTeam: { name: 'Australia', code: 'AUS', countryCode: 'AU' },
    awayTeam: { name: 'Corea del Sur', code: 'KOR', countryCode: 'KR' },
    scheduledLabel: '15 jun · 01:00',
    timeLabel: '01:00',
    venueLabel: 'BC Place · Vancouver',
  },
]

const MOCKUP_POPULAR_PREDICTIONS: PopularPredictionsByMatch = {
  'mock-1': [
    { homeScore: 2, awayScore: 1, votes: 428, percentage: 37 },
    { homeScore: 1, awayScore: 1, votes: 301, percentage: 26 },
    { homeScore: 1, awayScore: 2, votes: 194, percentage: 17 },
  ],
  'mock-2': [
    { homeScore: 1, awayScore: 0, votes: 265, percentage: 31 },
    { homeScore: 2, awayScore: 1, votes: 233, percentage: 27 },
    { homeScore: 0, awayScore: 0, votes: 151, percentage: 18 },
  ],
  'mock-3': [
    { homeScore: 0, awayScore: 1, votes: 287, percentage: 33 },
    { homeScore: 1, awayScore: 1, votes: 244, percentage: 28 },
    { homeScore: 2, awayScore: 1, votes: 132, percentage: 15 },
  ],
}

export function TodayMatchesCarousel({
  matches,
  popularPredictionsByMatch,
}: TodayMatchesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isModalOpen])

  const isMockup = matches.length === 0
  const carouselMatches = isMockup ? MOCKUP_MATCHES : matches.map(mapMatchToCarouselMatch)
  const predictionsMap = isMockup ? MOCKUP_POPULAR_PREDICTIONS : popularPredictionsByMatch
  const activeMatch = carouselMatches[activeIndex] ?? carouselMatches[0]

  if (!activeMatch) return null

  const activePopularPredictions = predictionsMap[activeMatch.id] ?? []

  return (
    <>
      <div className="space-y-3">
        {isMockup && (
          <div className="rounded-xl border border-dashed border-[#00dce5]/30 bg-[#00dce5]/8 p-4">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">
              Hoy no hay partidos
            </p>
            <p className="mt-1 text-sm text-white/60">
              Te dejo un mockup del carrusel para que veamos como quedaria esta seccion cuando haya jornada.
            </p>
          </div>
        )}

        <div
          className={cn(
            'glass-card relative overflow-hidden rounded-xl border-l-4 p-6',
            isMockup ? 'border-[#00dce5] shadow-[0_0_0_1px_rgba(0,220,229,0.08)]' : 'border-[#FF5E9F]'
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-white/60">
              {activeMatch.stageLabel}
            </span>
            <span
              className={cn(
                'rounded-full border px-3 py-1 font-mono text-[11px] font-black tracking-widest',
                isMockup
                  ? 'border-[#00dce5]/40 bg-[#00dce5]/10 text-[#00dce5]'
                  : 'border-[#FF5E9F]/40 bg-[#FF5E9F]/10 text-[#FF5E9F]'
              )}
            >
              {isMockup ? 'MOCKUP' : activeMatch.timeLabel}
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 md:items-center">
              <TeamBadge
                name={activeMatch.homeTeam.name}
                code={activeMatch.homeTeam.code}
                countryCode={activeMatch.homeTeam.countryCode}
              />

              <div className="flex min-w-[52px] flex-col items-center gap-2 pt-5 text-center md:pt-0">
                <span className="font-heading text-3xl font-black leading-none text-white md:text-4xl">VS</span>
              </div>

              <TeamBadge
                name={activeMatch.awayTeam.name}
                code={activeMatch.awayTeam.code}
                countryCode={activeMatch.awayTeam.countryCode}
              />
            </div>

            <div className="mt-5 flex flex-col items-center gap-1 text-center">
              <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-white/60">
                {activeMatch.scheduledLabel}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                {activeMatch.venueLabel}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) => (current === 0 ? carouselMatches.length - 1 : current - 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
                aria-label="Partido anterior"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-2">
                {carouselMatches.map((match, index) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      index === activeIndex
                        ? isMockup
                          ? 'w-8 bg-[#00dce5]'
                          : 'w-8 bg-[#FF5E9F]'
                        : 'w-2.5 bg-white/20 hover:bg-white/35'
                    )}
                    aria-label={`Ir al partido ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) => (current === carouselMatches.length - 1 ? 0 : current + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
                aria-label="Siguiente partido"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-heading text-base font-bold uppercase tracking-wider text-white transition-all active:scale-95',
                isMockup
                  ? 'bg-[#00dce5] shadow-[0_4px_0_#008f95] hover:translate-y-[2px] hover:shadow-[0_2px_0_#008f95]'
                  : 'bg-[#FF5E9F] shadow-[0_4px_0_#b21e64] hover:translate-y-[2px] hover:shadow-[0_2px_0_#b21e64]'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">groups</span>
              {isMockup ? 'VER LO MAS VOTADO' : 'VER PREDICCIONES'}
            </button>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-5">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <circle cx="100" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        <div className="px-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
          {activeIndex + 1} / {carouselMatches.length} {isMockup ? 'vista previa' : 'partidos de hoy'}
        </div>
      </div>

      {isModalOpen && (
        <PopularPredictionsModal
          match={activeMatch}
          predictions={activePopularPredictions}
          isMockup={isMockup}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

function TeamBadge({
  name,
  code,
  countryCode,
}: {
  name: string
  code: string
  countryCode: string | null | undefined
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#1E1E2E] md:h-20 md:w-20">
        <Flag
          countryCode={countryCode}
          alt={name}
          size={64}
          sourceWidth={80}
          className="rounded-full md:h-20 md:w-20"
          imageClassName="rounded-full"
          fallbackClassName="rounded-full"
        />
      </div>
      <div className="text-center">
        <span className="block font-heading text-lg font-black uppercase tracking-wide text-white md:text-xl">
          {code}
        </span>
        <span className="mt-1 block text-[11px] text-white/50 md:text-xs">{name}</span>
      </div>
    </div>
  )
}

function PopularPredictionsModal({
  match,
  predictions,
  isMockup,
  onClose,
}: {
  match: CarouselMatch
  predictions: PopularPrediction[]
  isMockup: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#050510]/80 p-3 backdrop-blur-sm md:items-center md:p-6">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-white/10 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
              {isMockup ? 'Vista previa social' : 'Lo mas votado'}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-wide text-white">
              {match.homeTeam.code} vs {match.awayTeam.code}
            </h3>
            <p className="mt-1 text-sm text-white/55">
              {match.homeTeam.name} contra {match.awayTeam.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111122]/70 p-4">
          {predictions.length > 0 ? (
            <div className="space-y-3">
              {predictions.map((prediction, index) => (
                <div
                  key={`${prediction.homeScore}-${prediction.awayScore}`}
                  className={cn(
                    'rounded-2xl border p-4',
                    index === 0
                      ? 'border-[#FF5E9F]/30 bg-[#FF5E9F]/10'
                      : 'border-white/8 bg-white/4'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                        {index === 0 ? 'Resultado favorito' : `Top ${index + 1}`}
                      </p>
                      <p className="mt-1 font-heading text-3xl font-black text-white">
                        {prediction.homeScore} - {prediction.awayScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-2xl font-black text-[#00dce5]">
                        {prediction.percentage}%
                      </p>
                      <p className="text-xs text-white/45">
                        {prediction.votes} votos
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        index === 0 ? 'bg-[#FF5E9F]' : 'bg-[#00dce5]'
                      )}
                      style={{ width: `${prediction.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-5 text-center">
              <p className="font-heading text-lg font-bold uppercase tracking-wide text-white">
                Aun no hay votos
              </p>
              <p className="mt-2 text-sm text-white/50">
                Cuando la gente empiece a predecir este partido, aqui veras los resultados mas repetidos.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Seguir viendo
          </button>
          <Link
            href={ROUTES.PREDICTIONS}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FF5E9F] px-5 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_0_#b21e64] transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_#b21e64]"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Ir a predecir
          </Link>
        </div>
      </div>
    </div>
  )
}

function mapMatchToCarouselMatch(match: MatchWithTeams): CarouselMatch {
  return {
    id: match.id,
    stageLabel: getStageLabel(match),
    homeTeam: {
      name: match.home_team?.name ?? 'Por definir',
      code: match.home_team?.id ?? 'TBD',
      countryCode: match.home_team?.country_code ?? null,
    },
    awayTeam: {
      name: match.away_team?.name ?? 'Por definir',
      code: match.away_team?.id ?? 'TBD',
      countryCode: match.away_team?.country_code ?? null,
    },
    scheduledLabel: format(new Date(match.scheduled_at), "d MMM · HH:mm", { locale: es }),
    timeLabel: format(new Date(match.scheduled_at), 'HH:mm'),
    venueLabel: [match.venue, match.city].filter(Boolean).join(' · ') || 'Sede por confirmar',
  }
}

function getStageLabel(match: MatchWithTeams): string {
  if (match.stage === 'group' && match.group_letter) {
    return `GRUPO ${match.group_letter}`
  }

  return match.stage.toUpperCase()
}
