'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPoints(userId: string, actionType: 'meal_purchase' | 'large_purchase') {
  const supabase = await createClient()

  // Verify Manager Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const pointsToAdd = actionType === 'large_purchase' ? 10 : 5

  // Fetch current points
  const { data: profile, error: readError } = await supabase
    .from('profiles')
    .select('points, reward_available')
    .eq('id', userId)
    .single()

  if (readError || !profile) {
    throw new Error("Profile not found")
  }

  const newPoints = profile.points + pointsToAdd
  const newRewardAvailable = profile.reward_available || newPoints >= 50

  // Log transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      manager_id: user.id,
      points_added: pointsToAdd,
      reason: actionType
    })

  if (txError) {
    throw new Error("Failed to log transaction")
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      points: newPoints,
      reward_available: newRewardAvailable
    })
    .eq('id', userId)

  if (updateError) {
    throw new Error("Failed to update profile")
  }

  revalidatePath(`/u/${userId}`)
}

export async function redeemReward(userId: string) {
  const supabase = await createClient()

  // Verify session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Double check profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('points, reward_available')
    .eq('id', userId)
    .single()

  if (!profile || !profile.reward_available || profile.points < 50) {
    throw new Error("Reward not available or insufficient points")
  }

  const newPoints = profile.points - 50
  const newRewardAvailable = newPoints >= 50

  // Log redemtion
  await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      manager_id: user.id,
      points_added: -50,
      reason: 'reward_redemption'
    })

  // Update profile
  await supabase
    .from('profiles')
    .update({ 
      points: newPoints,
      reward_available: newRewardAvailable
    })
    .eq('id', userId)

  revalidatePath(`/u/${userId}`)
}
