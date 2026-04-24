'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createProfile() {
  const supabase = await createClient()

  // Verify Manager Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // 1. Generate unique NFC ID locally
  const newNfcId = crypto.randomUUID()

  // 2. Explicitly insert the generated ID into Supabase to guarantee it exists
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: newNfcId,
      name: 'New Customer',
      points: 0,
      reward_available: false
    })
    .select('id')
    .single()

  // 3. Ensure this ID successfully wrote into DB before returning
  if (error || !data) {
    console.error("Dashboard DB Error:", error)
    throw new Error("Failed to explicitly create profile in database")
  }

  // 4. Safely redirect to the generated NFC URL since profile is guaranteed to exist
  redirect(`/u/${data.id}`)
}
