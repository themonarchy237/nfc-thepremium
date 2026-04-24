import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createProfile } from './actions'
import { PlusCircle, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch 10 most recent created profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="container" style={{ gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-primary-gradient" style={{ fontSize: '1.25rem' }}>Manager Dashboard</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Session</p>
        </div>
        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/login')
        }}>
          <button type="submit" className="btn btn-surface" style={{ padding: '8px 12px' }}>
            <LogOut size={16} />
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Create New NFC Card</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
          Generate a new profile URL to write to a blank NFC card.
        </p>
        <form action={createProfile}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <PlusCircle size={20} style={{ marginRight: '8px' }} />
            Generate New Card
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1 }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Recent Profiles</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {profiles?.map(p => (
            <div key={p.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>ID: {p.id.split('-')[0]}...</div>
              <a href={`/u/${p.id}`} className="text-primary-gradient" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                View Profile &rarr;
              </a>
            </div>
          ))}
          {(!profiles || profiles.length === 0) && (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No profiles created yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
