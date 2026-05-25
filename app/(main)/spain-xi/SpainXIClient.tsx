'use client'

import { useMemo, useState, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import { publishSpainLineupAction } from './actions'

interface Player {
  id: string
  dorsal: number
  name: string
  short_name: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  club: string
  caps: number
}

interface Slot {
  id: string
  role: string
  pos: 'GK' | 'DEF' | 'MID' | 'FWD'
  x: number
  y: number
}

interface Formation {
  label: string
  slots: Omit<Slot, 'id'>[]
}

const FORMATIONS: Record<string, Formation> = {
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { role: 'POR', pos: 'GK', x: 50, y: 88 },
      { role: 'LI', pos: 'DEF', x: 15, y: 70 },
      { role: 'DC', pos: 'DEF', x: 37, y: 72 },
      { role: 'DC', pos: 'DEF', x: 63, y: 72 },
      { role: 'LD', pos: 'DEF', x: 85, y: 70 },
      { role: 'MC', pos: 'MID', x: 20, y: 50 },
      { role: 'MC', pos: 'MID', x: 50, y: 47 },
      { role: 'MC', pos: 'MID', x: 80, y: 50 },
      { role: 'EXT I', pos: 'FWD', x: 15, y: 22 },
      { role: 'DC', pos: 'FWD', x: 50, y: 18 },
      { role: 'EXT D', pos: 'FWD', x: 85, y: 22 },
    ],
  },
  '4-4-2': {
    label: '4-4-2',
    slots: [
      { role: 'POR', pos: 'GK', x: 50, y: 88 },
      { role: 'LI', pos: 'DEF', x: 12, y: 70 },
      { role: 'DC', pos: 'DEF', x: 38, y: 72 },
      { role: 'DC', pos: 'DEF', x: 62, y: 72 },
      { role: 'LD', pos: 'DEF', x: 88, y: 70 },
      { role: 'EI', pos: 'MID', x: 12, y: 50 },
      { role: 'MC', pos: 'MID', x: 38, y: 50 },
      { role: 'MC', pos: 'MID', x: 62, y: 50 },
      { role: 'ED', pos: 'MID', x: 88, y: 50 },
      { role: 'DEL', pos: 'FWD', x: 35, y: 22 },
      { role: 'DEL', pos: 'FWD', x: 65, y: 22 },
    ],
  },
  '4-2-3-1': {
    label: '4-2-3-1',
    slots: [
      { role: 'POR', pos: 'GK', x: 50, y: 88 },
      { role: 'LI', pos: 'DEF', x: 12, y: 70 },
      { role: 'DC', pos: 'DEF', x: 37, y: 72 },
      { role: 'DC', pos: 'DEF', x: 63, y: 72 },
      { role: 'LD', pos: 'DEF', x: 88, y: 70 },
      { role: 'MCD', pos: 'MID', x: 35, y: 55 },
      { role: 'MCD', pos: 'MID', x: 65, y: 55 },
      { role: 'EXT I', pos: 'MID', x: 12, y: 35 },
      { role: 'MCO', pos: 'MID', x: 50, y: 32 },
      { role: 'EXT D', pos: 'MID', x: 88, y: 35 },
      { role: 'DEL', pos: 'FWD', x: 50, y: 16 },
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    slots: [
      { role: 'POR', pos: 'GK', x: 50, y: 88 },
      { role: 'DC', pos: 'DEF', x: 25, y: 72 },
      { role: 'DC', pos: 'DEF', x: 50, y: 74 },
      { role: 'DC', pos: 'DEF', x: 75, y: 72 },
      { role: 'Carril I', pos: 'MID', x: 10, y: 50 },
      { role: 'MC', pos: 'MID', x: 30, y: 50 },
      { role: 'MC', pos: 'MID', x: 50, y: 47 },
      { role: 'MC', pos: 'MID', x: 70, y: 50 },
      { role: 'Carril D', pos: 'MID', x: 90, y: 50 },
      { role: 'DEL', pos: 'FWD', x: 35, y: 22 },
      { role: 'DEL', pos: 'FWD', x: 65, y: 22 },
    ],
  },
}

const POSITION_COLORS: Record<Player['position'], string> = {
  GK: 'border-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.4)]',
  DEF: 'border-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.4)]',
  MID: 'border-[#00dce5] shadow-[0_0_10px_rgba(0,220,229,0.4)]',
  FWD: 'border-[#FF5E9F] shadow-[0_0_10px_rgba(255,94,159,0.4)]',
}

const POSITION_LABEL: Record<Player['position'], string> = {
  GK: 'Porteros',
  DEF: 'Defensas',
  MID: 'Centrocampistas',
  FWD: 'Delanteros',
}

/**
 * Jugadores que pueden actuar como carrileros (carril izquierdo / derecho)
 * en el 3-5-2, además de en su posición natural de defensa.
 */
const CARRILERO_KEYWORDS = ['porro', 'grimaldo', 'cucurella', 'llorente', 'pubill']

function isCarrileroEligible(player: Player): boolean {
  const combined = `${player.name} ${player.short_name}`.toLowerCase()
  return CARRILERO_KEYWORDS.some((kw) => combined.includes(kw))
}

interface Props {
  squad: Player[]
}

export function SpainXIClient({ squad }: Props) {
  const [formation, setFormation] = useState<keyof typeof FORMATIONS>('4-3-3')
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [slotToPlayer, setSlotToPlayer] = useState<Record<string, Player>>({})
  const [note, setNote] = useState('')
  const [published, setPublished] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [isPublishing, startPublishing] = useTransition()

  const currentFormation = FORMATIONS[formation]

  const slots: Slot[] = useMemo(
    () => currentFormation.slots.map((slot, index) => ({ ...slot, id: `${slot.pos}_${index}` })),
    [currentFormation]
  )

  const assignedPlayerIds = new Set(Object.values(slotToPlayer).map((player) => player.id))
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)
  const requiredPos = selectedSlot?.pos

  // Slot de carril lateral en 3-5-2 (Carril I / Carril D)
  const isCarrilSlot = selectedSlot?.role.toLowerCase().includes('carril') ?? false

  const filteredSquad = squad
    .filter((player) => {
      if (!requiredPos) return true
      if (player.position === requiredPos) return true
      // En slots de carril del 3-5-2, también se muestran los defensas polivalentes
      if (isCarrilSlot && player.position === 'DEF' && isCarrileroEligible(player)) return true
      return false
    })
    .filter((player) => {
      const alreadyInSlot = selectedSlotId && slotToPlayer[selectedSlotId]?.id === player.id
      return !assignedPlayerIds.has(player.id) || alreadyInSlot
    })
    // Ordenar: posición exacta del slot primero, luego polivalentes
    .sort((a, b) => {
      if (!requiredPos) return 0
      const aExact = a.position === requiredPos ? 0 : 1
      const bExact = b.position === requiredPos ? 0 : 1
      return aExact - bExact
    })

  const filledCount = Object.keys(slotToPlayer).length
  const allFilled = filledCount === 11
  const canPublish = allFilled && !published && !isPublishing

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotId((current) => (current === slotId ? null : slotId))
  }

  const handlePlayerSelect = (player: Player) => {
    if (!selectedSlotId) return

    setSlotToPlayer((current) => ({ ...current, [selectedSlotId]: player }))
    setSelectedSlotId(null)
    setPublished(false)
    setPublishError(null)
  }

  const handleRemovePlayer = (slotId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSlotToPlayer((current) => {
      const next = { ...current }
      delete next[slotId]
      return next
    })
    setSelectedSlotId(null)
    setPublished(false)
    setPublishError(null)
  }

  const handleClearAll = () => {
    setSlotToPlayer({})
    setSelectedSlotId(null)
    setPublished(false)
    setPublishError(null)
  }

  const handleFormationChange = (nextFormation: keyof typeof FORMATIONS) => {
    setFormation(nextFormation)
    setSlotToPlayer({})
    setSelectedSlotId(null)
    setPublished(false)
    setPublishError(null)
  }

  const handlePublish = () => {
    if (!canPublish) return

    setPublishError(null)

    startPublishing(async () => {
      const slotsPayload = Object.fromEntries(
        Object.entries(slotToPlayer).map(([slotId, player]) => [slotId, player.id])
      )

      const result = await publishSpainLineupAction({
        formation,
        slots: slotsPayload,
        note,
      })

      if ('error' in result) {
        setPublishError(result.error)
        return
      }

      setPublished(true)
    })
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-5">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">ESP</span>
          <h2 className="font-heading text-[28px] font-bold text-[#ffb0c9]">XI Espana</h2>
        </div>
        <p className="text-sm text-white/60 font-body">
          Elige tu formacion y selecciona los 11 titulares. Publicala en el tablon.
        </p>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {Object.keys(FORMATIONS).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleFormationChange(key as keyof typeof FORMATIONS)}
            className={cn(
              'flex-none rounded-full px-4 py-2 font-mono text-[12px] font-bold tracking-widest transition-all',
              formation === key
                ? 'bg-[#FF5E9F] text-white shadow-[0_0_12px_rgba(255,94,159,0.4)]'
                : 'border border-white/10 bg-[#1E1E2E] text-white/50 hover:border-[#FF5E9F]/30'
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF5E9F] to-[#8B5CF6] transition-all duration-500"
            style={{ width: `${Math.round((filledCount / 11) * 100)}%` }}
          />
        </div>
        <span className="font-mono text-[11px] font-semibold text-[#ffb0c9]">
          {filledCount}/11
        </span>
      </div>

      <div className="pitch-gradient relative mb-5 aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10">
        <div className="pitch-lines pointer-events-none absolute inset-0 opacity-20" />

        {slots.map((slot) => {
          const player = slotToPlayer[slot.id]
          const isActive = selectedSlotId === slot.id
          const colorClassName = POSITION_COLORS[slot.pos]

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => handleSlotClick(slot.id)}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all',
                  player
                    ? `${colorClassName} bg-[#1E1E2E] font-heading text-[10px] font-black text-white`
                    : isActive
                      ? 'animate-pulse border-[#FF5E9F] bg-[#FF5E9F]/20'
                      : 'border-white/30 bg-white/5',
                  isActive && !player && 'ring-2 ring-[#FF5E9F]/50'
                )}
              >
                {player ? (
                  <span className="px-0.5 text-center font-heading text-[9px] font-black leading-tight">
                    {player.short_name.split(' ').pop()?.slice(0, 5)}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-white/40">add</span>
                )}
              </div>

              <span
                className={cn(
                  'max-w-[56px] truncate rounded px-1 py-0.5 text-center font-mono text-[9px] font-bold leading-none',
                  player ? 'bg-[#121221]/80 text-white' : 'text-white/40'
                )}
              >
                {player ? player.short_name.split(' ').pop() : slot.role}
              </span>

              {player && (
                <button
                  type="button"
                  onClick={(event) => handleRemovePlayer(slot.id, event)}
                  className="absolute -right-1 -top-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-[#f87171]"
                >
                  <span className="material-symbols-outlined text-[10px] text-white">close</span>
                </button>
              )}
            </button>
          )
        })}
      </div>

      {!selectedSlotId && !allFilled && (
        <div className="glass-card mb-5 flex items-center gap-3 rounded-xl border-dashed border-[#FF5E9F]/20 p-4">
          <span className="material-symbols-outlined text-[24px] text-[#FF5E9F]">touch_app</span>
          <p className="text-sm text-white/50 font-body">
            Toca un circulo en el campo para elegir a un jugador de Espana.
          </p>
        </div>
      )}

      {allFilled && !selectedSlotId && (
        <div className="glass-card mb-5 rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading font-semibold text-white">Tu alineacion</h3>
            <button
              type="button"
              onClick={handleClearAll}
              className="font-mono text-[11px] text-[#f87171]/70 hover:text-[#f87171]"
            >
              Limpiar todo
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const player = slotToPlayer[slot.id]
              if (!player) return null

              return (
                <div key={slot.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold',
                      slot.pos === 'GK'
                        ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                        : slot.pos === 'DEF'
                          ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                          : slot.pos === 'MID'
                            ? 'bg-[#00dce5]/20 text-[#00dce5]'
                            : 'bg-[#FF5E9F]/20 text-[#FF5E9F]'
                    )}
                  >
                    {slot.role}
                  </span>
                  <span className="truncate text-sm text-white font-body">{player.short_name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {allFilled && (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={published || isPublishing}
            placeholder="Anade un comentario a tu alineacion (opcional)..."
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#1E1E2E] p-3 text-sm text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#FF5E9F]/40 disabled:opacity-50 font-body"
          />

          {publishError && (
            <div className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-4 py-3">
              <p className="font-mono text-[12px] font-semibold text-[#f87171]">
                {publishError}
              </p>
            </div>
          )}

          {published ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#4ade80]/30 bg-[#4ade80]/8 px-4 py-3">
              <span className="material-symbols-outlined text-[#4ade80]">check_circle</span>
              <p className="font-mono text-[12px] font-semibold text-[#4ade80]">
                Publicado en el tablon de fans.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5E9F] py-4 font-heading text-base font-bold text-white shadow-[0_4px_0_#b21e64] transition-all hover:bg-[#e0447f] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined">send</span>
              {isPublishing ? 'Publicando...' : 'Publicar en el tablon ESP'}
            </button>
          )}
        </div>
      )}

      {!allFilled && filledCount > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="glass-card mt-4 w-full rounded-xl border-white/10 py-3 font-mono text-[12px] font-semibold text-white/50 transition-colors hover:text-white/80"
        >
          Limpiar alineacion
        </button>
      )}

      {selectedSlotId && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#050510]/80 pt-8 px-4 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm md:items-center md:p-4"
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="glass-card flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10" style={{ maxHeight: 'min(80vh, 520px)' }}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-6 w-2 rounded-full',
                    requiredPos === 'GK'
                      ? 'bg-[#f59e0b]'
                      : requiredPos === 'DEF'
                        ? 'bg-[#3b82f6]'
                        : requiredPos === 'MID'
                          ? 'bg-[#00dce5]'
                          : 'bg-[#FF5E9F]'
                  )}
                />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#ffb0c9]/70">
                    Seleccion de jugador
                  </p>
                  <h3 className="font-heading font-semibold text-white">
                    {requiredPos ? POSITION_LABEL[requiredPos] : 'Jugadores'}
                  </h3>
                  {isCarrilSlot && (
                    <p className="font-mono text-[10px] text-[#c4b5fd]/70 mt-0.5">
                      + carrileros polivalentes
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlotId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 py-4">
              {filteredSquad.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/30">
                  Ya asignaste todos los {requiredPos ? POSITION_LABEL[requiredPos].toLowerCase() : 'jugadores'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredSquad.map((player) => {
                    // DEF jugando como carrilero en un slot MID
                    const isPolivalente = isCarrilSlot && player.position === 'DEF'

                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handlePlayerSelect(player)}
                        className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:border-[#FF5E9F]/30 active:scale-[0.98]"
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-black',
                            player.position === 'GK'
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                              : player.position === 'DEF'
                                ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                                : player.position === 'MID'
                                  ? 'bg-[#00dce5]/20 text-[#00dce5]'
                                  : 'bg-[#FF5E9F]/20 text-[#FF5E9F]'
                          )}
                        >
                          {player.dorsal}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-white font-heading">{player.name}</p>
                            {isPolivalente && (
                              <span className="shrink-0 rounded border border-[#8B5CF6]/40 bg-[#8B5CF6]/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#c4b5fd]">
                                Carril
                              </span>
                            )}
                          </div>
                          <p className="truncate font-mono text-[10px] text-white/40">{player.club}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-[10px] text-white/40">Internac.</p>
                          <p className="text-sm font-bold text-[#ffb0c9] font-heading">{player.caps}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
