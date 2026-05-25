'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createFanCommentAction, createFanPostAction, toggleFanReactionAction } from './actions'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import type { FanFeedPost, PublishedLineupPost } from './dashboard.types'

interface FanZoneMiniProps {
  fanPosts?: FanFeedPost[]
  publishedLineups?: PublishedLineupPost[]
}

interface RenderedPost {
  id: string
  user: string
  initials: string
  avatarColor: string
  time: string
  sortKey: string
  text: string
  type: 'text' | 'xi'
  imageUrl?: string | null
  xi?: { formation: string; players: string[]; source: 'spain' | 'world' }
  likes: number
  dislikes: number
  comments: number
  viewerReaction: 'like' | 'dislike' | null
  commentList: Array<{ id: string; authorName: string; body: string }>
  isPersisted: boolean
}

const MOCK_POSTS: RenderedPost[] = [
  {
    id: 'mock-1',
    user: 'Carlos MX',
    initials: 'CM',
    avatarColor: 'bg-[#006847]',
    time: 'Hace 22 min',
    sortKey: '2026-05-25T19:00:00.000Z',
    text: 'Mexico llega enchufado, el Azteca va a explotar. Cuantos hacemos hoy?',
    type: 'text',
    likes: 41,
    dislikes: 2,
    comments: 13,
    viewerReaction: null,
    commentList: [],
    isPersisted: false,
  },
  {
    id: 'mock-2',
    user: 'Sara L.',
    initials: 'SL',
    avatarColor: 'bg-[#FF5E9F]/40',
    time: 'Hace 1 hora',
    sortKey: '2026-05-25T18:20:00.000Z',
    text: 'Mi pronostico: Brasil y Espana en la final. Escribidlo y guardadlo.',
    type: 'text',
    likes: 88,
    dislikes: 4,
    comments: 29,
    viewerReaction: null,
    commentList: [],
    isPersisted: false,
  },
]

/* ── Helpers para el esquema XI ─────────────────────────────── */
function parseFormation(formation: string): { gk: number; def: number; mid: number; fwd: number } {
  const parts = formation.split('-').map(Number).filter((n) => !isNaN(n))
  if (parts.length < 2) return { gk: 1, def: 4, mid: 3, fwd: 3 }
  const def = parts[0]
  const fwd = parts[parts.length - 1]
  const mid = parts.slice(1, -1).reduce((a, b) => a + b, 0)
  return { gk: 1, def, mid, fwd }
}

function renderRow(
  postId: string,
  label: string,
  list: string[],
  colorCls: string,
  textCls: string,
) {
  if (list.length === 0) return null
  return (
    <div className="flex items-start gap-2">
      <span className={`w-7 shrink-0 pt-[3px] text-right font-mono text-[9px] font-bold opacity-50 ${textCls}`}>
        {label}
      </span>
      <div className="flex flex-1 flex-wrap justify-center gap-1.5">
        {list.map((p) => (
          <span
            key={`${postId}-${label}-${p}`}
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${colorCls} ${textCls}`}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

function XiSchematic({
  formation,
  players,
  postId,
  source = 'spain',
}: {
  formation: string
  players:   string[]
  postId:    string
  source?:   'spain' | 'world'
}) {
  const { gk, def, mid, fwd } = parseFormation(formation)
  const gkPlayers  = players.slice(0, gk)
  const defPlayers = players.slice(gk, gk + def)
  const midPlayers = players.slice(gk + def, gk + def + mid)
  const fwdPlayers = players.slice(gk + def + mid, gk + def + mid + fwd)

  const isWorld  = source === 'world'
  const flagEmoji = isWorld ? '🌍' : '🇪🇸'
  const title     = isWorld ? '¡Mi XI del Mundial!' : '¡Éste es mi 11 inicial para hoy!'

  return (
    <div className={`mt-3 overflow-hidden rounded-xl bg-[#0a0a18] border ${isWorld ? 'border-[#8B5CF6]/20' : 'border-[#FF5E9F]/20'}`}>
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
        <span>{flagEmoji}</span>
        <span className={`font-heading text-[11px] font-bold ${isWorld ? 'text-[#c4b5fd]' : 'text-[#ffb0c9]'}`}>
          {title}
        </span>
        <span className="ml-auto font-mono text-[10px] text-white/30">{formation}</span>
      </div>
      <div className="space-y-2.5 px-3 py-3">
        {renderRow(postId, 'DEL', fwdPlayers, 'bg-[#FF5E9F]/15 border-[#FF5E9F]/30', 'text-[#ffb0c9]')}
        {fwdPlayers.length > 0 && <div className="h-px bg-white/5" />}
        {renderRow(postId, 'MED', midPlayers, 'bg-[#00dce5]/15 border-[#00dce5]/30', 'text-[#00dce5]')}
        {midPlayers.length > 0 && <div className="h-px bg-white/5" />}
        {renderRow(postId, 'DEF', defPlayers, 'bg-[#3b82f6]/15 border-[#3b82f6]/30', 'text-[#93c5fd]')}
        {defPlayers.length > 0 && <div className="h-px bg-white/5" />}
        {renderRow(postId, 'POR', gkPlayers,  'bg-[#f59e0b]/15 border-[#f59e0b]/30', 'text-[#fcd34d]')}
      </div>
    </div>
  )
}

export function FanZoneMini({ fanPosts = [], publishedLineups = [] }: FanZoneMiniProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reactionOverrides, setReactionOverrides] = useState<Record<string, 'like' | 'dislike' | null>>({})
  const [localComments, setLocalComments] = useState<Record<string, Array<{ id: string; authorName: string; body: string }>>>({})
  const [inputText, setInputText] = useState('')
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)
  const [composerError, setComposerError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const posts = useMemo(() => {
    const mappedFanPosts = fanPosts.map(mapFanFeedPostToRenderedPost)
    const mappedLineups = publishedLineups.map(mapPublishedLineupToPost)
    const merged = [...mappedFanPosts, ...mappedLineups]
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .slice(0, 4)

    if (merged.length >= 4) return merged
    return [...merged, ...MOCK_POSTS].slice(0, 4)
  }, [fanPosts, publishedLineups])

  useEffect(() => {
    return () => {
      if (selectedImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImagePreview)
      }
    }
  }, [selectedImagePreview])

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedImageFile(file)
    setSelectedImagePreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return URL.createObjectURL(file)
    })
  }

  const clearSelectedImage = () => {
    setSelectedImageFile(null)
    setSelectedImagePreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePublish = () => {
    startTransition(async () => {
      setComposerError(null)

      const trimmedText = inputText.trim()
      let uploadedImagePath: string | null = null

      if (selectedImageFile) {
        const supabase = createBrowserSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setComposerError('Necesitas iniciar sesion para publicar.')
          return
        }

        const safeName = selectedImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        const path = `${user.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from('fan-media')
          .upload(path, selectedImageFile, { upsert: false })

        if (uploadError) {
          setComposerError('No se pudo subir la foto a la galeria.')
          return
        }

        uploadedImagePath = path
      }

      const result = await createFanPostAction({
        body: trimmedText,
        imagePath: uploadedImagePath,
      })

      if ('error' in result) {
        setComposerError(result.error)
        return
      }

      setInputText('')
      clearSelectedImage()
      router.refresh()
    })
  }

  const handleReaction = (postId: string, reactionType: 'like' | 'dislike', persisted: boolean) => {
    if (!persisted) {
      // Posts mock/no persistidos: toggle local sin llamada al servidor
      setReactionOverrides((current) => {
        const prev = current[postId] ?? null
        return { ...current, [postId]: prev === reactionType ? null : reactionType }
      })
      return
    }
    setComposerError(null)
    startTransition(async () => {
      const result = await toggleFanReactionAction(postId, reactionType)
      if ('error' in result) {
        setComposerError(result.error)
        return
      }
      setReactionOverrides((current) => ({
        ...current,
        [postId]: result.reaction ?? null,
      }))
      router.refresh()
    })
  }

  const handleCommentSubmit = (postId: string, persisted: boolean) => {
    const draft = commentDrafts[postId]?.trim()
    if (!draft) return

    if (!persisted) {
      // Posts mock/no persistidos: añadir comentario local
      setLocalComments((current) => ({
        ...current,
        [postId]: [
          ...(current[postId] ?? []),
          { id: `local-${Date.now()}`, authorName: 'Tú', body: draft },
        ],
      }))
      setCommentDrafts((current) => ({ ...current, [postId]: '' }))
      return
    }

    setComposerError(null)
    startTransition(async () => {
      const result = await createFanCommentAction(postId, draft)
      if ('error' in result) {
        setComposerError(result.error)
        return
      }
      setCommentDrafts((current) => ({ ...current, [postId]: '' }))
      router.refresh()
    })
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[18px] text-[#FF5E9F]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            groups
          </span>
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-white/60">
            Fan Zone
          </h2>
        </div>
        <Link href={ROUTES.FANZONE} className="font-mono text-[12px] font-semibold text-[#ffb0c9] hover:underline">
          Ver todo
        </Link>
      </div>

      <div className="glass-card mb-4 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#571bc1] font-heading text-xs font-bold text-white">
            Tu
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Que opinas del Mundial? Escribe aqui..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 font-body"
          />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handlePickImage}
              title="Anadir foto desde galeria"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border bg-[#1E1E2E] transition-colors',
                selectedImagePreview
                  ? 'border-[#00dce5]/50 text-[#00dce5]'
                  : 'border-white/10 text-white/40 hover:border-[#00dce5]/40'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">image</span>
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPending || (!inputText.trim() && !selectedImagePreview)}
              className="rounded-lg bg-[#FF5E9F] px-3 py-1.5 font-mono text-[11px] font-bold text-white transition-opacity disabled:opacity-30"
            >
              {isPending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {selectedImagePreview && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1A1A2E]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImagePreview}
                alt="Previsualizacion de la imagen seleccionada"
                className="h-40 w-full object-cover"
              />
              <button
                type="button"
                onClick={clearSelectedImage}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#050510]/70 text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {composerError && (
          <p className="mt-3 rounded-lg border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2 text-sm text-[#fca5a5]">
            {composerError}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {posts.map((post) => {
          const effectiveReaction = reactionOverrides[post.id] ?? post.viewerReaction
          const likes = post.likes + getReactionDelta(post.viewerReaction, effectiveReaction, 'like')
          const dislikes = post.dislikes + getReactionDelta(post.viewerReaction, effectiveReaction, 'dislike')

          return (
            <article key={post.id} className="glass-card overflow-hidden rounded-xl">
              <div className="flex items-center gap-3 px-4 pb-2 pt-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${post.avatarColor} font-heading text-xs font-bold text-white`}
                >
                  {post.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white font-heading">{post.user}</p>
                  <p className="font-mono text-[10px] text-white/40">{post.time}</p>
                </div>
                {post.type === 'xi' && (
                  <span
                    className={cn(
                      'rounded border px-2 py-0.5 font-mono text-[10px] font-bold',
                      post.xi?.source === 'world'
                        ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/20 text-[#c4b5fd]'
                        : 'border-[#FF5E9F]/30 bg-[#FF5E9F]/20 text-[#ffb0c9]',
                    )}
                  >
                    {post.xi?.source === 'world' ? 'XI MUNDIAL' : 'XI ESP'}
                  </span>
                )}
              </div>

              <div className="px-4 pb-3">
                <p className="text-sm leading-relaxed text-white font-body">{post.text}</p>

                {post.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#1A1A2E]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt="Foto publicada en el tablon"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}

                {post.type === 'xi' && post.xi && (
                  <XiSchematic
                    formation={post.xi.formation}
                    players={post.xi.players}
                    postId={post.id}
                    source={post.xi.source}
                  />
                )}
              </div>

              <div className="flex items-center gap-5 border-t border-white/5 px-4 pb-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleReaction(post.id, 'like', post.isPersisted)}
                  disabled={isPending && post.isPersisted}
                  className="flex items-center gap-1.5 active:scale-90 transition-transform"
                >
                  <span
                    className={cn(
                      'material-symbols-outlined text-[18px] transition-colors',
                      effectiveReaction === 'like' ? 'text-[#FF5E9F]' : 'text-white/40'
                    )}
                    style={effectiveReaction === 'like' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                  <span className="font-mono text-[11px] text-white/40">{likes}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReaction(post.id, 'dislike', post.isPersisted)}
                  disabled={isPending && post.isPersisted}
                  className="flex items-center gap-1.5 active:scale-90 transition-transform"
                >
                  <span
                    className={cn(
                      'material-symbols-outlined text-[18px] transition-colors',
                      effectiveReaction === 'dislike' ? 'text-[#00dce5]' : 'text-white/40'
                    )}
                    style={effectiveReaction === 'dislike' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    thumb_down
                  </span>
                  <span className="font-mono text-[11px] text-white/40">{dislikes}</span>
                </button>
                <button type="button" className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-white/40">chat_bubble</span>
                  <span className="font-mono text-[11px] text-white/40">
                    {post.comments + (localComments[post.id]?.length ?? 0)}
                  </span>
                </button>
                <button type="button" className="ml-auto text-white/40 transition-colors hover:text-[#ffb0c9]">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>

              <div className="border-t border-white/5 px-4 pb-4 pt-3">
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={commentDrafts[post.id] ?? ''}
                    onChange={(event) =>
                      setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommentSubmit(post.id, post.isPersisted)
                    }}
                    placeholder="Escribe un comentario..."
                    className="flex-1 rounded-lg border border-white/10 bg-[#1E1E2E] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#FF5E9F]/40 font-body"
                  />
                  <button
                    type="button"
                    onClick={() => handleCommentSubmit(post.id, post.isPersisted)}
                    disabled={(isPending && post.isPersisted) || !commentDrafts[post.id]?.trim()}
                    className="rounded-lg bg-[#383848] px-3 py-2 font-mono text-[11px] font-bold text-white transition-opacity disabled:opacity-30"
                  >
                    Comentar
                  </button>
                </div>

                {([...post.commentList, ...(localComments[post.id] ?? [])]).length > 0 && (
                  <div className="space-y-2">
                    {[...post.commentList, ...(localComments[post.id] ?? [])].map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#ffb0c9]/70">
                          {comment.authorName}
                        </p>
                        <p className="mt-1 text-sm text-white/80 font-body">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function mapFanFeedPostToRenderedPost(post: FanFeedPost): RenderedPost {
  return {
    id: post.id,
    user: post.displayName,
    initials: getInitials(post.displayName),
    avatarColor: 'bg-[#571bc1]',
    time: formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es }),
    sortKey: post.createdAt,
    text: post.body || `${post.displayName} ha compartido una publicacion.`,
    type: 'text',
    imageUrl: post.imageUrl,
    likes: post.likes,
    dislikes: post.dislikes,
    comments: post.commentsCount,
    viewerReaction: post.viewerReaction,
    commentList: post.latestComments.map((comment) => ({
      id: comment.id,
      authorName: comment.authorName,
      body: comment.body,
    })),
    isPersisted: true,
  }
}

function mapPublishedLineupToPost(lineup: PublishedLineupPost): RenderedPost {
  const isWorld = lineup.source === 'world'
  return {
    id: lineup.id,
    user: lineup.displayName,
    initials: getInitials(lineup.displayName),
    avatarColor: isWorld ? 'bg-[#4c1d95]' : 'bg-[#571bc1]',
    time: formatDistanceToNow(new Date(lineup.updatedAt), { addSuffix: true, locale: es }),
    sortKey: lineup.updatedAt,
    text: lineup.note?.trim() ||
      (isWorld
        ? `${lineup.displayName} ha publicado su XI del Mundial.`
        : `${lineup.displayName} ha publicado su XI de Espana.`),
    type: 'xi',
    xi: {
      formation: lineup.formation,
      players:   lineup.players.slice(0, 11),
      source:    lineup.source,
    },
    likes: 0,
    dislikes: 0,
    comments: 0,
    viewerReaction: null,
    commentList: [],
    isPersisted: false,
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getReactionDelta(
  baseReaction: 'like' | 'dislike' | null,
  nextReaction: 'like' | 'dislike' | null,
  target: 'like' | 'dislike'
): number {
  let delta = 0
  if (baseReaction === target) delta -= 1
  if (nextReaction === target) delta += 1
  return delta
}
