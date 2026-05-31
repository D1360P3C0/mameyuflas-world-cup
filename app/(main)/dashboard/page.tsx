import { endOfDay, startOfDay, subDays } from 'date-fns'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { FanZoneMini } from './FanZoneMini'
import { TodayMatchesCarousel } from './TodayMatchesCarousel'
import type {
  DashboardStats,
  FanFeedPost,
  PopularPredictionsByMatch,
  PublishedLineupPost,
} from './dashboard.types'
import type { MatchWithTeams } from '@/types/app.types'
import type { Json, Tables } from '@/types/database.types'

export const metadata: Metadata = { title: 'Inicio' }
export const revalidate = 0

const MOCK_NEWS = [
  {
    id: '1',
    title: 'Transferencia bomba: Bellingham a la MLS para el 2026?',
    time: 'Hace 5 min',
    tag: 'MERCADO',
    tagColor: 'bg-[#00dce5] text-[#003739]',
    gradient: 'from-[#00dce5]/20 to-[#8B5CF6]/10',
    emoji: '🌟',
    views: '2.4k',
  },
  {
    id: '2',
    title: 'Entrenamiento oficial: Las figuras de Mexico pisan el SoFi Stadium',
    time: 'Hace 18 min',
    tag: 'LIVE',
    tagColor: 'bg-[#FF5E9F] text-white',
    gradient: 'from-[#FF5E9F]/20 to-[#8B5CF6]/10',
    emoji: '⚽',
    views: '1.1k',
  },
  {
    id: '3',
    title: 'Revelan el kit de local de Argentina para la defensa del titulo',
    time: 'Hace 1 hora',
    tag: 'UNIFORMES',
    tagColor: 'bg-[#383848] text-white',
    gradient: 'from-[#8B5CF6]/20 to-[#FF5E9F]/10',
    emoji: '👕',
    views: '5.8k',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()

  const [
    { data: todayMatchesRaw },
    stats,
    popularPredictionsByMatch,
    fanPosts,
    spainLineups,
    worldElevens,
  ] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey ( * ),
        away_team:teams!matches_away_team_id_fkey ( * )
      `)
      .gte('scheduled_at', todayStart)
      .lte('scheduled_at', todayEnd)
      .order('scheduled_at'),
    loadDashboardStats(supabase, user.id),
    loadPopularPredictions(supabase, todayStart, todayEnd),
    loadFanPosts(supabase, user.id),
    loadPublishedLineups(supabase),
    loadPublishedMyElevens(supabase),
  ])

  // Mezclar XI España + XI Mundial, ordenados por fecha descendente, máx 4
  const publishedLineups = [...spainLineups, ...worldElevens]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  const todayMatches = (todayMatchesRaw ?? []) as MatchWithTeams[]

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-5 md:max-w-7xl">
      <section className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="glass-card relative flex flex-col justify-between overflow-hidden rounded-xl p-5">
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#ffb0c9]/10 blur-3xl" />
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-white/60">
              Puntos Totales
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-black leading-none text-[#ffb0c9] drop-shadow-[0_0_12px_rgba(255,176,201,0.4)]">
                {stats.totalPoints.toLocaleString('es-ES')}
              </span>
              <span className="font-mono text-[12px] font-semibold text-[#ffb0c9]/70">PTS</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[18px] text-[#00dce5]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
            <span className="font-mono text-[12px] font-semibold text-[#00dce5]">
              +{stats.weeklyGain} pts esta semana
            </span>
          </div>
        </div>

        <div className="glass-card relative flex flex-col justify-between overflow-hidden rounded-xl p-5">
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-[#00dce5]/10 blur-3xl" />
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-white/60">
              Rango Mundial
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-black leading-none text-[#00dce5] drop-shadow-[0_0_12px_rgba(0,220,229,0.4)]">
                {stats.globalRank ? `#${stats.globalRank}` : '--'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[18px] text-[#ffb0c9]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              military_tech
            </span>
            <span className="font-mono text-[12px] font-semibold text-white">
              {stats.topPercent ? `Top ${stats.topPercent}% de jugadores` : 'Aun sin ranking global'}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-white/60">
          Partidos de Hoy
        </h2>
        <TodayMatchesCarousel
          matches={todayMatches}
          popularPredictionsByMatch={popularPredictionsByMatch}
        />
      </section>

      <FanZoneMini fanPosts={fanPosts} publishedLineups={publishedLineups} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-white/60">
            Flash News
          </h2>
          <Link href={ROUTES.NEWS} className="font-mono text-[12px] font-semibold text-[#ffb0c9] hover:underline">
            Ver todas
          </Link>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4">
          {MOCK_NEWS.map((news) => (
            <article
              key={news.id}
              className="group min-w-[280px] cursor-pointer overflow-hidden rounded-xl glass-card transition-transform hover:scale-[1.02] md:min-w-[340px]"
            >
              <div className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${news.gradient}`}>
                <span className="text-[64px] opacity-30 transition-transform duration-500 group-hover:scale-110">
                  {news.emoji}
                </span>
                <div className={`absolute left-2 top-2 rounded px-2 py-1 font-mono text-[10px] font-bold ${news.tagColor}`}>
                  {news.tag}
                </div>
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 font-body text-[18px] font-medium leading-tight text-white transition-colors group-hover:text-[#ffb0c9]">
                  {news.title}
                </h3>
                <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-white/40">
                  <span>{news.time}</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    {news.views}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

async function loadDashboardStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<DashboardStats> {
  const weekAgoIso = subDays(new Date(), 7).toISOString()

  const [
    { data: ownPredictions },
    { data: ownKnockoutPredictions },
    { data: ownSpecialPrediction },
    { data: allPredictions },
    { data: allSpecialPredictions },
    { data: allProfiles },
  ] = await Promise.all([
    supabase
      .from('predictions')
      .select('points_earned, updated_at')
      .eq('user_id', userId),
    supabase
      .from('knockout_predictions')
      .select('points_earned, updated_at')
      .eq('user_id', userId),
    supabase
      .from('special_predictions')
      .select('points_earned, updated_at')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('predictions')
      .select('user_id, points_earned')
      .not('points_earned', 'is', null),
    supabase
      .from('special_predictions')
      .select('user_id, points_earned')
      .not('points_earned', 'is', null),
    supabase
      .from('profiles')
      .select('id'),
  ])

  const ownPredictionRows = ownPredictions ?? []
  const ownKnockoutRows = ownKnockoutPredictions ?? []
  const ownSpecialPoints = ownSpecialPrediction?.points_earned ?? 0
  const ownSpecialWeekly =
    ownSpecialPrediction?.updated_at && new Date(ownSpecialPrediction.updated_at) >= new Date(weekAgoIso)
      ? ownSpecialPrediction.points_earned ?? 0
      : 0

  const totalPoints =
    sumPoints(ownPredictionRows) +
    sumPoints(ownKnockoutRows) +
    ownSpecialPoints

  const weeklyGain =
    sumPoints(ownPredictionRows, weekAgoIso) +
    sumPoints(ownKnockoutRows, weekAgoIso) +
    ownSpecialWeekly

  const comparableScores = new Map<string, number>()
  for (const row of allPredictions ?? []) {
    comparableScores.set(row.user_id, (comparableScores.get(row.user_id) ?? 0) + (row.points_earned ?? 0))
  }
  for (const row of allSpecialPredictions ?? []) {
    comparableScores.set(row.user_id, (comparableScores.get(row.user_id) ?? 0) + (row.points_earned ?? 0))
  }
  if (!comparableScores.has(userId)) {
    comparableScores.set(userId, 0)
  }

  const ranking = Array.from(comparableScores.entries()).sort((a, b) => b[1] - a[1])
  const globalRank = ranking.findIndex(([id]) => id === userId) + 1
  const totalUsers = allProfiles?.length ?? 0
  const topPercent = totalUsers > 0 ? Math.max(1, Math.ceil((globalRank / totalUsers) * 100)) : null

  return {
    totalPoints,
    weeklyGain,
    globalRank: globalRank || null,
    topPercent,
  }
}

async function loadPopularPredictions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  todayStart: string,
  todayEnd: string
): Promise<PopularPredictionsByMatch> {
  const { data: todayMatches } = await supabase
    .from('matches')
    .select('id')
    .gte('scheduled_at', todayStart)
    .lte('scheduled_at', todayEnd)

  if (!todayMatches?.length) return {}

  const matchIds = todayMatches.map((match) => match.id)
  const { data } = await supabase
    .from('predictions')
    .select('match_id, home_score, away_score')
    .in('match_id', matchIds)

  return buildPopularPredictionsMap(
    (data ?? []) as Pick<Tables<'predictions'>, 'match_id' | 'home_score' | 'away_score'>[]
  )
}

async function loadFanPosts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<FanFeedPost[]> {
  const { data: postsRaw } = await supabase
    .from('fan_posts')
    .select(`
      id,
      body,
      image_path,
      created_at,
      profiles!fan_posts_user_id_fkey (
        display_name,
        username
      )
    `)
    .order('created_at', { ascending: false })
    .limit(4)

  const posts = (postsRaw ?? []) as Array<{
    id: string
    body: string
    image_path: string | null
    created_at: string
    profiles: { display_name: string | null; username: string } | null
  }>

  if (posts.length === 0) return []

  const postIds = posts.map((post) => post.id)

  const [{ data: reactionsRaw }, { data: commentsRaw }] = await Promise.all([
    supabase
      .from('fan_post_reactions')
      .select('post_id, user_id, reaction_type')
      .in('post_id', postIds),
    supabase
      .from('fan_post_comments')
      .select(`
        id,
        post_id,
        body,
        created_at,
        profiles!fan_post_comments_user_id_fkey (
          display_name,
          username
        )
      `)
      .in('post_id', postIds)
      .order('created_at', { ascending: false }),
  ])

  const reactions = (reactionsRaw ?? []) as Array<{
    post_id: string
    user_id: string
    reaction_type: string
  }>

  const comments = (commentsRaw ?? []) as Array<{
    id: string
    post_id: string
    body: string
    created_at: string
    profiles: { display_name: string | null; username: string } | null
  }>

  const reactionSummaryByPost = new Map<
    string,
    { likes: number; dislikes: number; viewerReaction: 'like' | 'dislike' | null }
  >()

  for (const reaction of reactions) {
    const current =
      reactionSummaryByPost.get(reaction.post_id) ??
      { likes: 0, dislikes: 0, viewerReaction: null as 'like' | 'dislike' | null }

    if (reaction.reaction_type === 'like') current.likes += 1
    if (reaction.reaction_type === 'dislike') current.dislikes += 1
    if (reaction.user_id === userId && (reaction.reaction_type === 'like' || reaction.reaction_type === 'dislike')) {
      current.viewerReaction = reaction.reaction_type
    }

    reactionSummaryByPost.set(reaction.post_id, current)
  }

  const latestCommentsByPost = new Map<string, FanFeedPost['latestComments']>()
  const commentsCountByPost = new Map<string, number>()

  for (const comment of comments) {
    commentsCountByPost.set(comment.post_id, (commentsCountByPost.get(comment.post_id) ?? 0) + 1)

    const existing = latestCommentsByPost.get(comment.post_id) ?? []
    if (existing.length < 2) {
      existing.push({
        id: comment.id,
        authorName: comment.profiles?.display_name ?? comment.profiles?.username ?? 'Usuario',
        body: comment.body,
        createdAt: comment.created_at,
      })
    }
    latestCommentsByPost.set(comment.post_id, existing)
  }

  return posts.map((post) => {
    const reactionSummary =
      reactionSummaryByPost.get(post.id) ??
      { likes: 0, dislikes: 0, viewerReaction: null as 'like' | 'dislike' | null }

    return {
      id: post.id,
      displayName: post.profiles?.display_name ?? post.profiles?.username ?? 'Usuario',
      username: post.profiles?.username ?? 'usuario',
      body: post.body,
      imageUrl: post.image_path
        ? supabase.storage.from('fan-media').getPublicUrl(post.image_path).data.publicUrl
        : null,
      createdAt: post.created_at,
      likes: reactionSummary.likes,
      dislikes: reactionSummary.dislikes,
      commentsCount: commentsCountByPost.get(post.id) ?? 0,
      viewerReaction: reactionSummary.viewerReaction,
      latestComments: latestCommentsByPost.get(post.id) ?? [],
    }
  })
}

async function loadPublishedLineups(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<PublishedLineupPost[]> {
  const { data: lineupsRaw } = await supabase
    .from('spain_lineups')
    .select('id, user_id, formation, slots, note, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(3)

  const lineups = lineupsRaw ?? []
  if (lineups.length === 0) return []

  const userIds = Array.from(new Set(lineups.map((lineup) => lineup.user_id)))
  const playerIds = Array.from(
    new Set(lineups.flatMap((lineup) => Object.values(readSlots(lineup.slots))))
  )

  const [{ data: profiles }, { data: players }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', userIds),
    supabase
      .from('spain_squad')
      .select('id, short_name')
      .in('id', playerIds),
  ])

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const playerById = new Map((players ?? []).map((player) => [player.id, player.short_name]))

  return lineups.map((lineup) => {
    const profile = profileById.get(lineup.user_id)

    // Ordenar slots por el índice numérico del ID (ej. "GK_0", "DEF_1"…)
    // garantiza el orden GK → DEF → MID → FWD, que XiSchematic espera.
    const sortedSlotIds = Object.entries(readSlots(lineup.slots))
      .sort(([keyA], [keyB]) => {
        const idxA = parseInt(keyA.split('_').pop() ?? '0', 10)
        const idxB = parseInt(keyB.split('_').pop() ?? '0', 10)
        return idxA - idxB
      })
      .map(([, playerId]) => playerId)

    return {
      id: lineup.id,
      displayName: profile?.display_name ?? 'Usuario',
      username: profile?.username ?? 'usuario',
      note: lineup.note,
      formation: lineup.formation,
      players: sortedSlotIds.map((playerId) => playerById.get(playerId) ?? playerId),
      updatedAt: lineup.updated_at ?? new Date().toISOString(),
      source: 'spain' as const,
    }
  })
}

async function loadPublishedMyElevens(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<PublishedLineupPost[]> {
  const { data: elevensRaw } = await supabase
    .from('my_eleven')
    .select('id, user_id, formation, slots, note, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(3)

  const elevens = elevensRaw ?? []
  if (elevens.length === 0) return []

  const userIds   = Array.from(new Set(elevens.map((e) => e.user_id)))
  const playerIds = Array.from(
    new Set(elevens.flatMap((e) => Object.values(readSlots(e.slots))))
  )

  const [{ data: profiles }, { data: players }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, username').in('id', userIds),
    supabase.from('world_squad').select('id, short_name').in('id', playerIds),
  ])

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const playerById  = new Map((players  ?? []).map((p) => [p.id, p.short_name]))

  return elevens.map((eleven) => {
    const profile = profileById.get(eleven.user_id)

    const sortedSlotIds = Object.entries(readSlots(eleven.slots))
      .sort(([a], [b]) => {
        const idxA = parseInt(a.split('_').pop() ?? '0', 10)
        const idxB = parseInt(b.split('_').pop() ?? '0', 10)
        return idxA - idxB
      })
      .map(([, playerId]) => playerId)

    return {
      id:          eleven.id,
      displayName: profile?.display_name ?? 'Usuario',
      username:    profile?.username ?? 'usuario',
      note:        eleven.note,
      formation:   eleven.formation,
      players:     sortedSlotIds.map((id) => playerById.get(id) ?? id),
      updatedAt:   eleven.updated_at ?? new Date().toISOString(),
      source:      'world' as const,
    }
  })
}

function buildPopularPredictionsMap(
  predictions: Pick<Tables<'predictions'>, 'match_id' | 'home_score' | 'away_score'>[]
): PopularPredictionsByMatch {
  const grouped = new Map<string, Map<string, { homeScore: number; awayScore: number; votes: number }>>()
  const totals = new Map<string, number>()

  for (const prediction of predictions) {
    const matchMap =
      grouped.get(prediction.match_id) ??
      new Map<string, { homeScore: number; awayScore: number; votes: number }>()

    const key = `${prediction.home_score}-${prediction.away_score}`
    const current = matchMap.get(key)

    matchMap.set(key, {
      homeScore: prediction.home_score,
      awayScore: prediction.away_score,
      votes: (current?.votes ?? 0) + 1,
    })

    grouped.set(prediction.match_id, matchMap)
    totals.set(prediction.match_id, (totals.get(prediction.match_id) ?? 0) + 1)
  }

  return Object.fromEntries(
    Array.from(grouped.entries()).map(([matchId, scoreMap]) => {
      const totalVotes = totals.get(matchId) ?? 1
      const popularPredictions = Array.from(scoreMap.values())
        .sort((a, b) => b.votes - a.votes || a.homeScore + a.awayScore - (b.homeScore + b.awayScore))
        .slice(0, 3)
        .map((item) => ({
          ...item,
          percentage: Math.round((item.votes / totalVotes) * 100),
        }))

      return [matchId, popularPredictions]
    })
  )
}

function sumPoints(
  rows: Array<{ points_earned: number | null; updated_at: string }>,
  sinceIso?: string
): number {
  return rows.reduce((total, row) => {
    if (sinceIso && new Date(row.updated_at) < new Date(sinceIso)) {
      return total
    }

    return total + (row.points_earned ?? 0)
  }, 0)
}

function readSlots(slots: Json): Record<string, string> {
  if (!slots || Array.isArray(slots) || typeof slots !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(slots).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  )
}
