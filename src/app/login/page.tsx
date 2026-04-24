import { loginManager } from './actions'
import styles from './login.module.css'
import { Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className={`container ${styles.loginWrapper}`}>
      <div className={`glass-panel ${styles.loginCard} animate-slide-up`}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Lock size={24} color="var(--primary)" />
          </div>
          <h1 className="text-primary-gradient">THE PREMIUM LOUNGE</h1>
          <p>Manager Access</p>
        </div>

        <form className={styles.form} action={loginManager}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="manager@thepremiumlounge.com"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Secure Login
          </button>
        </form>
      </div>
    </div>
  )
}
