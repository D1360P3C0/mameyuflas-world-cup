'use client'

/**
 * Leaderboard — Ranking Global.
 * Diseño Stitch exacto:
 * • Pódium animado (top 3)
 * • Lista de posiciones 4–7
 * • Barra flotante pulsante con la posición del usuario actual
 * • Modal de historial de puntos al clicar en un usuario
 */
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

/* ── Mock data (FASE 4 reemplazará con Supabase real-time) ── */
const PODIUM = [
  { rank: 2, username: 'Leo_Fan26',  points: 1240, initials: 'LF', color: 'text-[#d0bcff]', border: 'border-[#d0bcff]', label: 'secondary', height: 'h-24', badgeBg: 'bg-[#d0bcff] text-[#23005c]' },
  { rank: 1, username: 'M_Gomez_X',  points: 1450, initials: 'MG', color: 'text-[#ffb0c9]', border: 'border-[#ffb0c9]', label: 'primary',   height: 'h-36', badgeBg: 'bg-[#ffb0c9] text-[#650034]' },
  { rank: 3, username: 'Nitro_09',   points: 1115, initials: 'NO', color: 'text-[#00dce5]', border: 'border-[#00dce5]', label: 'tertiary',  height: 'h-20', badgeBg: 'bg-[#00dce5] text-[#003739]' },
]

const LIST = [
  { rank: 4, username: 'Alvaro_Castillo', predictions: 845, points: 980,  trend: +2, initials: 'AC' },
  { rank: 5, username: 'Maria.Predicts',  predictions: 790, points: 955,  trend: -1, initials: 'MP' },
  { rank: 6, username: 'K_Duarte',        predictions: 720, points: 912,  trend:  0, initials: 'KD' },
  { rank: 7, username: 'GoalSeeker_99',   predictions: 688, points: 890,  trend: +4, initials: 'GS' },
]

const CURRENT_USER = { rank: 124, username: 'Felix (Tú)', points: 642, trendUp: true, gain: '+12 lug' }

/* ── Historial de puntos por usuario (mock) ─────────────────── */
type DayEntry = { date: string; pts: number; cumulative: number }

const HISTORY_DATA: Record<string, DayEntry[]> = {
  'Leo_Fan26': [
    { date: '15 jun', pts: 42,  cumulative: 42  },
    { date: '16 jun', pts: 130, cumulative: 172 },
    { date: '17 jun', pts: 85,  cumulative: 257 },
    { date: '18 jun', pts: 200, cumulative: 457 },
    { date: '19 jun', pts: 65,  cumulative: 522 },
    { date: '20 jun', pts: 318, cumulative: 840 },
    { date: '21 jun', pts: 400, cumulative: 1240 },
  ],
  'M_Gomez_X': [
    { date: '15 jun', pts: 60,  cumulative: 60  },
    { date: '16 jun', pts: 180, cumulative: 240 },
    { date: '17 jun', pts: 95,  cumulative: 335 },
    { date: '18 jun', pts: 250, cumulative: 585 },
    { date: '19 jun', pts: 140, cumulative: 725 },
    { date: '20 jun', pts: 380, cumulative: 1105 },
    { date: '21 jun', pts: 345, cumulative: 1450 },
  ],
  'Nitro_09': [
    { date: '15 jun', pts: 38,  cumulative: 38  },
    { date: '16 jun', pts: 110, cumulative: 148 },
    { date: '17 jun', pts: 72,  cumulative: 220 },
    { date: '18 jun', pts: 165, cumulative: 385 },
    { date: '19 jun', pts: 80,  cumulative: 465 },
    { date: '20 jun', pts: 290, cumulative: 755 },
    { date: '21 jun', pts: 360, cumulative: 1115 },
  ],
  'Alvaro_Castillo': [
    { date: '15 jun', pts: 20,  cumulative: 20  },
    { date: '16 jun', pts: 90,  cumulative: 110 },
    { date: '17 jun', pts: 55,  cumulative: 165 },
    { date: '18 jun', pts: 180, cumulative: 345 },
    { date: '19 jun', pts: 110, cumulative: 455 },
    { date: '20 jun', pts: 240, cumulative: 695 },
    { date: '21 jun', pts: 285, cumulative: 980 },
  ],
  'Maria.Predicts': [
    { date: '15 jun', pts: 15,  cumulative: 15  },
    { date: '16 jun', pts: 85,  cumulative: 100 },
    { date: '17 jun', pts: 68,  cumulative: 168 },
    { date: '18 jun', pts: 175, cumulative: 343 },
    { date: '19 jun', pts: 102, cumulative: 445 },
    { date: '20 jun', pts: 210, cumulative: 655 },
    { date: '21 jun', pts: 300, cumulative: 955 },
  ],
  'K_Duarte': [
    { date: '15 jun', pts: 10,  cumulative: 10  },
    { date: '16 jun', pts: 75,  cumulative: 85  },
    { date: '17 jun', pts: 62,  cumulative: 147 },
    { date: '18 jun', pts: 160, cumulative: 307 },
    { date: '19 jun', pts: 98,  cumulative: 405 },
    { date: '20 jun', pts: 207, cumulative: 612 },
    { date: '21 jun', pts: 300, cumulative: 912 },
  ],
  'GoalSeeker_99': [
    { date: '15 jun', pts: 8,   cumulative: 8   },
    { date: '16 jun', pts: 70,  cumulative: 78  },
    { date: '17 jun', pts: 58,  cumulative: 136 },
    { date: '18 jun', pts: 150, cumulative: 286 },
    { date: '19 jun', pts: 95,  cumulative: 381 },
    { date: '20 jun', pts: 209, cumulative: 590 },
    { date: '21 jun', pts: 300, cumulative: 890 },
  ],
  'Felix (Tú)': [
    { date: '15 jun', pts: 5,   cumulative: 5   },
    { date: '16 jun', pts: 48,  cumulative: 53  },
    { date: '17 jun', pts: 32,  cumulative: 85  },
    { date: '18 jun', pts: 120, cumulative: 205 },
    { date: '19 jun', pts: 60,  cumulative: 265 },
    { date: '20 jun', pts: 177, cumulative: 442 },
    { date: '21 jun', pts: 200, cumulative: 642 },
  ],
}

/* ── Subcomponentes ─────────────────────────────────────────── */
function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return (
    <div className="flex flex-col items-center">
      <span className="material-symbols-outlined text-[#00dce5] text-[12px]"
        style={{ fontVariationSettings: "'FILL' 1" }}>arrow_drop_up</span>
      <span className="font-mono text-[8px] font-bold text-[#00dce5]">{trend}</span>
    </div>
  )
  if (trend < 0) return (
    <div className="flex flex-col items-center">
      <span className="material-symbols-outlined text-[#ffb4ab] text-[12px]"
        style={{ fontVariationSettings: "'FILL' 1" }}>arrow_drop_down</span>
      <span className="font-mono text-[8px] font-bold text-[#ffb4ab]">{Math.abs(trend)}</span>
    </div>
  )
  return <span className="material-symbols-outlined text-white/40 text-[12px]">horizontal_rule</span>
}

/* ── Modal de historial ─────────────────────────────────────── */
function HistoryModal({
  username,
  initials,
  totalPoints,
  onClose,
}: {
  username: string
  initials: string
  totalPoints: number
  onClose: () => void
}) {
  const history = HISTORY_DATA[username] ?? []
  const maxPts = Math.max(...history.map(d => d.pts), 1)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050510]/80 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden flex flex-col" style={{ maxHeight: 'min(80vh, 520px)' }}>
        {/* Header — fijo */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 shrink-0">
          <div className="w-11 h-11 rounded-full border-2 border-[#ffb0c9]/40 bg-[#292839] flex items-center justify-center font-heading font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-white">{username}</p>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              {totalPoints.toLocaleString('es-ES')} pts totales
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Historial — scrollable */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-5 py-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
            Historial de puntos diarios
          </p>

          {history.length === 0 ? (
            <p className="text-center text-sm text-white/30 py-6">Sin datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {history.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-white/40 w-12 shrink-0">{day.date}</span>
                  {/* Barra de puntos del día */}
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF5E9F] to-[#8B5CF6] transition-all duration-500"
                      style={{ width: `${Math.round((day.pts / maxPts) * 100)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center pl-2 font-mono text-[10px] font-bold text-white">
                      +{day.pts}
                    </span>
                  </div>
                  {/* Acumulado */}
                  <span className="font-heading font-bold text-[#ffb0c9] text-sm w-16 text-right shrink-0">
                    {day.cumulative.toLocaleString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [selectedUser, setSelectedUser] = useState<{ username: string; initials: string; points: number } | null>(null)

  /* Pódium — ordenado: 2, 1, 3 para el efecto visual */
  const podiumOrder = [PODIUM[0], PODIUM[1], PODIUM[2]] // 2, 1, 3

  return (
    <div className="px-4 pt-6 pb-44 max-w-2xl mx-auto relative">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="mb-8 text-center">
        <h1 className="font-heading text-[28px] font-bold text-[#ffb0c9] mb-1">Ranking Global</h1>
        <p className="font-mono text-[11px] font-semibold tracking-widest text-white/60">
          LIDERA LA TABLA DE PREDICCIONES
        </p>
      </header>

      {/* ── Pódium ───────────────────────────────────────────────── */}
      <div className="relative flex items-end justify-center gap-2 mb-12 h-64">
        {podiumOrder.map((player) => (
          <button
            key={player.rank}
            type="button"
            onClick={() => setSelectedUser({ username: player.username, initials: player.initials, points: player.points })}
            className="flex flex-col items-center flex-1 cursor-pointer group"
          >
            {/* Corona para el #1 */}
            {player.rank === 1 && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 mb-2 z-10">
                <span className="material-symbols-outlined text-[#ffb0c9] text-[2.5rem]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              </div>
            )}

            {/* Avatar */}
            <div className="relative mb-3 mt-6">
              <div className={`${player.rank === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full border-4 ${player.border} bg-[#292839] flex items-center justify-center font-heading font-black text-white text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                {player.initials}
              </div>
              <div className={`absolute -bottom-2 -right-1 ${player.badgeBg} w-${player.rank === 1 ? '8 h-8 text-sm' : '6 h-6 text-xs'} rounded-full flex items-center justify-center font-bold border-2 border-[#121221]`}>
                {player.rank}
              </div>
            </div>

            {/* Plataforma + nombre */}
            <div className={`w-full ${player.height} bg-[#1E1E2E]/60 backdrop-blur-sm rounded-t-xl flex flex-col items-center justify-center p-2 border-x border-t border-white/5 ${player.rank === 1 ? 'bg-[#FF5E9F]/20 border-[#FF5E9F]/30' : ''}`}>
              <span className={`font-mono text-[11px] font-semibold ${player.color} truncate w-full text-center`}>
                {player.username}
              </span>
              <span className="font-heading font-bold text-white text-base">
                {player.points.toLocaleString('es-ES')} pts
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Lista posiciones 4–7 ─────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="font-mono text-[11px] font-semibold tracking-widest text-white/60 px-2 mb-4">
          SIGUIENTES EN LA LISTA
        </h3>

        {LIST.map(player => (
          <button
            key={player.rank}
            type="button"
            onClick={() => setSelectedUser({ username: player.username, initials: player.initials, points: player.points })}
            className="glass-card w-full rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer text-left hover:border-[#FF5E9F]/20"
          >
            <span className="font-mono text-white/60 w-4 text-sm">{player.rank}</span>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full border border-white/10 bg-[#292839] flex items-center justify-center font-heading font-bold text-sm text-white shrink-0">
              {player.initials}
            </div>

            {/* Nombre + predicciones */}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-white text-sm truncate">{player.username}</p>
              <p className="font-mono text-[10px] text-white/40 uppercase">
                {player.predictions.toLocaleString()} predicciones
              </p>
            </div>

            {/* Puntos + trend */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-heading font-bold text-white text-sm">
                {player.points} pts
              </span>
              <TrendIcon trend={player.trend} />
            </div>
          </button>
        ))}
      </section>

      {/* ── Barra flotante del usuario actual ───────────────────── */}
      <div className="fixed bottom-20 left-0 w-full px-4 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setSelectedUser({ username: CURRENT_USER.username, initials: 'FX', points: CURRENT_USER.points })}
            className="w-full text-left neon-border-pulse bg-[#FF5E9F]/10 backdrop-blur-xl border border-[#FF5E9F]/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_15px_rgba(255,94,159,0.4)] active:scale-[0.98] transition-transform"
          >

            {/* Posición */}
            <div className="bg-[#FF5E9F] text-white font-heading text-lg font-black w-14 h-12 rounded-xl flex items-center justify-center shrink-0">
              {CURRENT_USER.rank}
            </div>

            {/* Nombre */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-bold text-[#ffb0c9] uppercase tracking-widest">
                Tu Posición
              </p>
              <p className="font-heading font-bold text-white text-base">
                {CURRENT_USER.username}
              </p>
            </div>

            {/* Puntos + trend */}
            <div className="text-right shrink-0">
              <p className="font-heading font-bold text-[#ffb0c9] text-lg">
                {CURRENT_USER.points} pts
              </p>
              <div className="flex items-center justify-end gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#00dce5]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                <span className="font-mono text-[10px] font-bold text-[#00dce5]">
                  {CURRENT_USER.gain}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Modal historial ──────────────────────────────────────── */}
      {selectedUser && (
        <HistoryModal
          username={selectedUser.username}
          initials={selectedUser.initials}
          totalPoints={selectedUser.points}
          onClose={() => setSelectedUser(null)}
        />
      )}

    </div>
  )
}
