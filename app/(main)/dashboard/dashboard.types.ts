export type PopularPrediction = {
  homeScore: number
  awayScore: number
  votes: number
  percentage: number
}

export type PopularPredictionsByMatch = Record<string, PopularPrediction[]>

export type DashboardStats = {
  totalPoints: number
  weeklyGain: number
  globalRank: number | null
  topPercent: number | null
}

export type PublishedLineupPost = {
  id: string
  displayName: string
  username: string
  note: string | null
  formation: string
  players: string[]  // short_name[] ordenados GK→DEF→MID→FWD
  updatedAt: string
  source: 'spain' | 'world'  // XI España vs XI del Mundial
}

export type FanComment = {
  id: string
  authorName: string
  body: string
  createdAt: string
}

export type FanFeedPost = {
  id: string
  displayName: string
  username: string
  body: string
  imageUrl: string | null
  createdAt: string
  likes: number
  dislikes: number
  commentsCount: number
  viewerReaction: 'like' | 'dislike' | null
  latestComments: FanComment[]
}
