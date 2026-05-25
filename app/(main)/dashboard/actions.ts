'use server'

import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants/routes'
import { createClient } from '@/lib/supabase/server'

type ActionResult =
  | { success: true; reaction?: 'like' | 'dislike' | null }
  | { error: string }

function revalidateFanSurfaces() {
  revalidatePath(ROUTES.DASHBOARD)
  revalidatePath(ROUTES.FANZONE)
}

export async function createFanPostAction(input: {
  body?: string
  imagePath?: string | null
}): Promise<ActionResult> {
  const body = input.body?.trim() ?? ''
  const imagePath = input.imagePath?.trim() ?? null

  if (!body && !imagePath) {
    return { error: 'Escribe algo o sube una foto antes de publicar.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No estas autenticado.' }

  const { error } = await supabase.from('fan_posts').insert({
    user_id: user.id,
    body,
    image_path: imagePath,
  })

  if (error) {
    return { error: 'No se pudo publicar en el tablon.' }
  }

  revalidateFanSurfaces()
  return { success: true }
}

export async function toggleFanReactionAction(
  postId: string,
  reactionType: 'like' | 'dislike'
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No estas autenticado.' }

  const { data: existing } = await supabase
    .from('fan_post_reactions')
    .select('id, reaction_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase.from('fan_post_reactions').insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
    })

    if (error) return { error: 'No se pudo guardar tu reaccion.' }
    revalidateFanSurfaces()
    return { success: true, reaction: reactionType }
  }

  if (existing.reaction_type === reactionType) {
    const { error } = await supabase
      .from('fan_post_reactions')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: 'No se pudo quitar tu reaccion.' }
    revalidateFanSurfaces()
    return { success: true, reaction: null }
  }

  const { error } = await supabase
    .from('fan_post_reactions')
    .update({ reaction_type: reactionType })
    .eq('id', existing.id)

  if (error) return { error: 'No se pudo actualizar tu reaccion.' }

  revalidateFanSurfaces()
  return { success: true, reaction: reactionType }
}

export async function createFanCommentAction(
  postId: string,
  body: string
): Promise<ActionResult> {
  const trimmedBody = body.trim()
  if (!trimmedBody) {
    return { error: 'Escribe un comentario antes de enviarlo.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No estas autenticado.' }

  const { error } = await supabase.from('fan_post_comments').insert({
    post_id: postId,
    user_id: user.id,
    body: trimmedBody,
  })

  if (error) {
    return { error: 'No se pudo publicar tu comentario.' }
  }

  revalidateFanSurfaces()
  return { success: true }
}
