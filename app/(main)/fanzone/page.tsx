'use client'

/**
 * Fan Zone — diseño Stitch.
 * • Área de publicación inline (sin FAB flotante)
 * • Card de acceso a Mi XI del Mundial
 * • Encuesta interactiva con barras animadas
 * • Feed social con posts (fotos, texto, XI España esquemático)
 * • Like + comentar + compartir
 */
import Link    from 'next/link'
import { useState } from 'react'
import { cn }  from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'

/* ── Mock data ──────────────────────────────────────────────── */
const INITIAL_VOTES = [42, 28, 15, 15]
const POLL_OPTIONS  = ['Kylian Mbappé', 'Erling Haaland', 'Vinícius Júnior', 'Otro']

type XiData = {
  formation: string
  GK: string[]
  DEF: string[]
  MID: string[]
  FWD: string[]
}

type Post = {
  id: string
  user: string
  initials: string
  location: string
  time: string
  text: string
  hasImage?: boolean
  imageGradient?: string
  imageEmoji?: string
  likes: number
  comments: number
  avatarColor: string
  tags?: string[]
  xi?: XiData
}

const POSTS: Post[] = [
  {
    id: 'xi-1',
    user:     'Diego P.',
    initials: 'DP',
    location: 'Madrid',
    time:     'Hace 5 min',
    text:     'Mi XI ideal de España para el Mundial 2026 🇪🇸',
    likes:    23,
    comments: 7,
    avatarColor: 'bg-[#FF5E9F]/30',
    xi: {
      formation: '4-3-3',
      GK:  ['Unai Simón'],
      DEF: ['Carvajal', 'Le Normand', 'Laporte', 'Cucurella'],
      MID: ['Zubimendi', 'Pedri', 'Fabián'],
      FWD: ['Yamal', 'Morata', 'Nico'],
    },
  },
  {
    id: '1',
    user:     'Juan Diego',
    initials: 'JD',
    location: 'Ciudad de México',
    time:     'Hace 15 min',
    text:     '¡Increíble ambiente hoy en el Estadio Azteca! La energía de la afición mexicana no tiene comparación. ¡Vamos con todo! 🇲🇽⚽',
    hasImage: true,
    imageGradient: 'from-[#8B5CF6]/30 via-[#FF5E9F]/20 to-transparent',
    imageEmoji: '🏟️',
    likes:    1200,
    comments: 84,
    avatarColor: 'bg-[#571bc1]',
  },
  {
    id: '2',
    user:     'Sarah Wilson',
    initials: 'SW',
    location: 'Toronto',
    time:     'Hace 1 hora',
    text:     '¿Alguien más está emocionado por el partido inaugural? He estado esperando 4 años para este momento. Canada is ready! 🇨🇦',
    likes:    450,
    comments: 12,
    avatarColor: 'bg-[#FF5E9F]/30',
    tags: ['#WorldCup2026', '#FanZone'],
  },
]

/* ── XI España — tarjeta esquemática ───────────────────────── */
function XiSchematic({ xi }: { xi: XiData }) {
  return (
    <div className="mx-4 mb-4 rounded-xl bg-[#0a1520] border border-[#00dce5]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <span className="text-sm">🇪🇸</span>
        <span className="font-mono text-[10px] font-bold tracking-widest text-[#00dce5] uppercase">
          XI · {xi.formation}
        </span>
      </div>

      {/* Pitch esquemático */}
      <div className="px-4 py-4 space-y-3 text-center">
        {/* Delanteros */}
        <div className="flex justify-center gap-2 flex-wrap">
          {xi.FWD.map(p => (
            <span key={p} className="rounded-full bg-[#FF5E9F]/15 border border-[#FF5E9F]/30 px-3 py-0.5 font-mono text-[11px] font-semibold text-[#ffb0c9]">
              {p}
            </span>
          ))}
        </div>
        <div className="h-px bg-white/5 mx-4" />

        {/* Centrocampistas */}
        <div className="flex justify-center gap-2 flex-wrap">
          {xi.MID.map(p => (
            <span key={p} className="rounded-full bg-[#00dce5]/10 border border-[#00dce5]/20 px-3 py-0.5 font-mono text-[11px] font-semibold text-[#00dce5]">
              {p}
            </span>
          ))}
        </div>
        <div className="h-px bg-white/5 mx-4" />

        {/* Defensas */}
        <div className="flex justify-center gap-2 flex-wrap">
          {xi.DEF.map(p => (
            <span key={p} className="rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-3 py-0.5 font-mono text-[11px] font-semibold text-[#60a5fa]">
              {p}
            </span>
          ))}
        </div>
        <div className="h-px bg-white/5 mx-4" />

        {/* Portero */}
        <div className="flex justify-center">
          {xi.GK.map(p => (
            <span key={p} className="rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-3 py-0.5 font-mono text-[11px] font-semibold text-[#fbbf24]">
              🧤 {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FanZonePage() {
  const [votes,       setVotes]       = useState(INITIAL_VOTES)
  const [voted,       setVoted]       = useState<number | null>(null)
  const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set())
  const [newPostText, setNewPostText] = useState('')
  const [posts,       setPosts]       = useState<Post[]>(POSTS)

  const totalVotes = votes.reduce((a, b) => a + b, 0)

  const handleVote = (index: number) => {
    if (voted !== null) return
    setVoted(index)
    setVotes(v => v.map((val, i) => i === index ? val + 1 : val))
  }

  const toggleLike = (postId: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      return next
    })
  }

  const handlePublish = () => {
    const text = newPostText.trim()
    if (!text) return
    const newPost: Post = {
      id:          `local-${Date.now()}`,
      user:        'Tú',
      initials:    'TU',
      location:    '',
      time:        'Ahora',
      text,
      likes:       0,
      comments:    0,
      avatarColor: 'bg-[#8B5CF6]/30',
    }
    setPosts(prev => [newPost, ...prev])
    setNewPostText('')
  }

  return (
    <div className="px-4 pt-5 pb-32 max-w-2xl mx-auto">

      {/* Heading */}
      <div className="mb-6">
        <h2 className="font-heading text-[28px] font-bold text-[#ffb0c9] mb-2">Fan Zone</h2>
        <p className="font-body text-white/60">
          Conéctate con fans de todo el mundo y comparte la pasión mundialista.
        </p>
      </div>

      {/* ── Área de publicación inline ───────────────────────── */}
      <div className="glass-card rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF5E9F] to-[#8B5CF6] flex items-center justify-center font-heading font-bold text-white text-xs shrink-0">
            TU
          </div>
          <textarea
            value={newPostText}
            onChange={e => setNewPostText(e.target.value)}
            placeholder="¿Qué piensas del mundial? Compártelo..."
            rows={3}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-[#1E1E2E] p-3 text-sm text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#FF5E9F]/40 font-body"
          />
        </div>
        <div className="flex items-center justify-between mt-3 pl-12">
          {/* Botón imagen */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-white/40 hover:text-[#00dce5] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">image</span>
            <span className="font-mono text-[11px]">Imagen</span>
          </button>
          {/* Botón publicar — dentro del área */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!newPostText.trim()}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-heading text-sm font-bold transition-all',
              newPostText.trim()
                ? 'bg-[#FF5E9F] text-white hover:bg-[#e0447f] active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed',
            )}
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Publicar
          </button>
        </div>
      </div>

      {/* ── Mi XI del Mundial ────────────────────────────────────── */}
      <Link href={ROUTES.MY_ELEVEN} className="block mb-8">
        <div className="relative overflow-hidden rounded-xl border border-[#8B5CF6]/30 bg-gradient-to-r from-[#8B5CF6]/20 via-[#FF5E9F]/10 to-transparent p-5 transition-all hover:border-[#8B5CF6]/50">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#8B5CF6]/20 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xl">🌍</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#c4b5fd]">
                  Nueva feature
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white">
                ¿Cuál es tu XI del Mundial?
              </h3>
              <p className="mt-1 font-body text-sm text-white/50">
                Elige a los 11 jugadores que más te están gustando y compártelo aquí.
              </p>
            </div>
            <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <span className="material-symbols-outlined text-[22px] text-white">arrow_forward</span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Encuesta ─────────────────────────────────────────────── */}
      <section className="glass-card rounded-xl p-5 mb-8 shadow-[0_0_15px_rgba(0,220,229,0.15)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#00dce5] text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          <span className="font-mono text-[11px] font-bold text-[#00dce5] uppercase tracking-widest">
            Encuesta Especial
          </span>
        </div>

        <h3 className="font-heading text-2xl font-semibold text-white mb-5">
          ¿Quién ganará la Bota de Oro?
        </h3>

        <div className="space-y-3">
          {POLL_OPTIONS.map((option, i) => {
            const pct     = totalVotes > 0 ? Math.round((votes[i] / totalVotes) * 100) : 0
            const isVoted = voted === i

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleVote(i)}
                disabled={voted !== null}
                className={cn(
                  'w-full group relative overflow-hidden rounded-lg bg-[#292839] p-4 flex justify-between items-center border transition-all',
                  isVoted ? 'border-[#ffb0c9]/50' : 'border-white/5 hover:border-[#ffb0c9]/30',
                  voted !== null && 'cursor-default',
                )}
              >
                {/* Barra de progreso */}
                <div
                  className={cn('absolute inset-0 poll-bar', isVoted ? 'bg-[#FF5E9F]/20' : 'bg-[#ffb0c9]/8')}
                  style={{ width: `${pct}%` }}
                />
                <span className="relative font-body text-[18px] font-medium text-white z-10">
                  {option}
                </span>
                <span className="relative font-heading font-bold text-[18px] text-[#ffb0c9] z-10">
                  {pct}%
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-5 text-center font-mono text-[12px] text-white/40">
          {totalVotes.toLocaleString('es-ES')} Votos · 2 días restantes
        </p>
      </section>

      {/* ── Feed social ──────────────────────────────────────────── */}
      <div className="space-y-5">
        {posts.map(post => {
          const liked = likedIds.has(post.id)
          return (
            <article key={post.id} className="glass-card rounded-xl overflow-hidden">
              {/* Header del post */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center font-heading font-bold text-white text-sm`}>
                    {post.initials}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-white text-sm">{post.user}</p>
                    <p className="font-mono text-[10px] text-white/40">
                      {post.time}{post.location ? ` · ${post.location}` : ''}
                    </p>
                  </div>
                </div>
                <button type="button" className="text-white/40 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>

              {/* Texto */}
              <div className="px-4 pb-3">
                <p className="font-body text-white text-sm leading-relaxed">{post.text}</p>
                {post.tags && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-[#571bc1]/20 text-[#d0bcff] font-mono text-[11px] border border-[#571bc1]/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* XI España esquemático */}
              {post.xi && <XiSchematic xi={post.xi} />}

              {/* Imagen placeholder */}
              {post.hasImage && (
                <div className={`aspect-video w-full bg-gradient-to-br ${post.imageGradient} flex items-center justify-center`}>
                  <span className="text-[80px] opacity-30">{post.imageEmoji}</span>
                </div>
              )}

              {/* Acciones */}
              <div className="p-4 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-6">
                  {/* Like */}
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-2 group/like"
                  >
                    <span
                      className={cn(
                        'material-symbols-outlined text-[20px] transition-colors',
                        liked ? 'text-[#FF5E9F]' : 'text-white/40 group-hover/like:text-[#FF5E9F]',
                      )}
                      style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      favorite
                    </span>
                    <span className="font-mono text-[12px] text-white/40">
                      {post.likes + (liked ? 1 : 0) >= 1000
                        ? `${((post.likes + (liked ? 1 : 0)) / 1000).toFixed(1)}k`
                        : post.likes + (liked ? 1 : 0)}
                    </span>
                  </button>

                  {/* Comentarios */}
                  <button type="button" className="flex items-center gap-2 group/chat">
                    <span className="material-symbols-outlined text-[20px] text-white/40 group-hover/chat:text-[#00dce5] transition-colors">
                      chat_bubble
                    </span>
                    <span className="font-mono text-[12px] text-white/40">{post.comments}</span>
                  </button>
                </div>

                <button type="button" className="text-white/40 hover:text-[#ffb0c9] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
