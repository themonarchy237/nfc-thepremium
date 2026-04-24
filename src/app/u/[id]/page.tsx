import { createClient } from '@/utils/supabase/server'
import styles from './profile.module.css'
import { Award, Plus, CheckCircle, CreditCard, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { addPoints, redeemReward } from './actions'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  // 1. Await params (Next.js 15 requirement)
  const resolvedParams = await params
  const { id } = resolvedParams

  // 2. Fetch the profile
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  // 3. Auto-create if it DOES NOT EXIST
  if (error || !profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: id, 
        name: 'New Customer', 
        points: 0,
        reward_available: false
      })
      .select('*')
      .single()

    // If insertion fails (e.g., due to UUID constraints or RLS and not logged in as manager)
    if (insertError || !newProfile) {
      return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <h1 className="text-primary-gradient" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Action Required</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>This card is not initialized. A manager must log in to activate it.</p>
            <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', color: '#cbd5e1' }}>
              ID: {id}
            </div>
          </div>
        </div>
      )
    }
    
    // Successfully auto-created
    profile = newProfile
  }

  // Check if manager is logged in
  const { data: { user } } = await supabase.auth.getUser()
  const isManager = !!user

  // Calculate progress for the arc
  const progress = Math.min(100, (profile.points / 50) * 100)
  
  return (
    <div className={`container ${styles.profileContainer}`}>
      <div className={`glass-panel ${styles.profileCard} animate-slide-up`}>
        <div className={styles.header}>
          <div className={profile.reward_available ? `${styles.avatar} reward-pulse` : styles.avatar}>
            <Award size={32} color={profile.reward_available ? "var(--background)" : "var(--primary)"} />
          </div>
          <h1>{profile.name || 'Premium Guest'}</h1>
          <p className={styles.tagline}>NFC Loyalty Member</p>
        </div>

        <div className={styles.pointsDisplay}>
          <div className={styles.progressRingWrapper}>
            <svg viewBox="0 0 100 100" className={styles.progressRing}>
              <circle cx="50" cy="50" r="45" className={styles.track} />
              <circle 
                cx="50" cy="50" r="45" 
                className={styles.fill} 
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
              />
            </svg>
            <div className={styles.pointsCount}>
              <h2>{profile.points}</h2>
              <span>pts</span>
            </div>
          </div>
        </div>

        {profile.reward_available && (
          <div className={styles.rewardBanner}>
            <CheckCircle size={20} />
            <span>Reward Available: 1 Free Meal + Wine!</span>
          </div>
        )}

        {isManager && (
          <div className={styles.managerSection}>
            <div className={styles.divider}>
              <span>Manager Actions</span>
            </div>
            
            <div className={styles.actionGrid}>
              <form action={addPoints.bind(null, profile.id, 'meal_purchase')}>
                <button type="submit" className={`btn btn-surface ${styles.actionBtn}`}>
                  <CreditCard size={20} />
                  <span>+5 Points</span>
                  <small>Regular Meal</small>
                </button>
              </form>
              
              <form action={addPoints.bind(null, profile.id, 'large_purchase')}>
                <button type="submit" className={`btn btn-primary ${styles.actionBtn}`}>
                  <Plus size={20} />
                  <span>+10 Points</span>
                  <small>Bill {'>'} 5000 FCFA</small>
                </button>
              </form>
            </div>

            {profile.reward_available && (
              <form action={redeemReward.bind(null, profile.id)} style={{ marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--success)' }}>
                  Redeem Reward (-50 pts)
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
