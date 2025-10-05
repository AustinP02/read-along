import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import styles from './Profile.module.css'

export default function Profile() {
  const [page, setPage] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for user data
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({
    accuracy: 0,
    lessonsCompleted: 0,
    lessonsTarget: 30,
    streak: 0,
  })
  const [lessonsHistory, setLessonsHistory] = useState([])

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError
      if (!user) {
        setError('No user logged in')
        return
      }

      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setUserData(profile)

      // Fetch user stats
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError) {
        // If no stats exist, create default stats
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert([
            {
              user_id: user.id,
              accuracy: 0,
              lessons_completed: 0,
              lessons_target: 30,
              current_streak: 0,
            }
          ])
          .select()
          .single()

        if (createError) throw createError
        setStats({
          accuracy: newStats.accuracy,
          lessonsCompleted: newStats.lessons_completed,
          lessonsTarget: newStats.lessons_target,
          streak: newStats.current_streak,
        })
      } else {
        setStats({
          accuracy: userStats.accuracy,
          lessonsCompleted: userStats.lessons_completed,
          lessonsTarget: userStats.lessons_target,
          streak: userStats.current_streak,
        })
      }

      // Fetch lesson history
      const { data: lessons, error: lessonsError } = await supabase
        .from('user_lessons')
        .select(`
          id,
          completed_at,
          accuracy,
          lessons (
            title
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (lessonsError) throw lessonsError

      // Format lessons for display
      const formattedLessons = lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.lessons?.title || 'Unknown Lesson',
        date: new Date(lesson.completed_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        accuracy: Math.round(lesson.accuracy || 0)
      }))

      setLessonsHistory(formattedLessons)

    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  function ProgressBar({ value, label }) {
    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressRow}>
          <div className={styles.progressLabel}>{label}</div>
          <div className={styles.progressPercent}>{Math.round(value)}%</div>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ ['--progress']: `${value}%` }} />
        </div>
      </div>
    )
  }
  
  function StreakDots({ days, goal = 7 }) {
    const dots = Array.from({ length: goal }, (_, i) => i + 1)
    return (
      <div className={styles.streakDots}>
        {dots.map(d => (
          <div key={d} className={styles.streakDot} data-active={d <= days} aria-hidden />
        ))}
        <div className={styles.streakCount}>{days}/{goal}</div>
      </div>
    )
  }
  
  function LessonsHistory({ items }) {
    if (items.length === 0) {
      return (
        <section className={styles.historySection} aria-labelledby="history-heading">
          <p style={{ opacity: 0.7, textAlign: 'center' }}>No lessons completed yet. Start learning!</p>
        </section>
      )
    }

    return (
      <section className={styles.historySection} aria-labelledby="history-heading">
        <div className={styles.historyList}>
          {items.map(item => (
            <div key={item.id} className={styles.historyItem}>
              <div>
                <div className={styles.historyTitle}>{item.title}</div>
                <div className={styles.historyMeta}>
                  {item.date} <span className={styles.historyAccuracy}>{item.accuracy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.profileWrapper}>
        <main className={styles.main}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading your profile...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.profileWrapper}>
        <main className={styles.main}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Error loading profile</h2>
            <p>{error}</p>
            <button 
              onClick={fetchUserProfile}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Get first name from username
  const firstName = userData?.username?.split(' ')[0] || userData?.username || 'User'
  
  return (
    <div className={styles.profileWrapper}>
      <main className={styles.main}>
        <>
          <h2 className={styles.welcomeHeading}>Welcome back, {firstName} 👋</h2>
          <p>Here you can view your stats and lesson history.</p>
          <section className={styles.statsSection}>
            <div className={styles.statsBox}>
              <h3 className={styles.statsHeading}>Stats</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statsColumn}>
                  <ProgressBar 
                    value={Math.min(100, (stats.lessonsCompleted / stats.lessonsTarget) * 100)} 
                    label={`Lessons ${stats.lessonsCompleted}/${stats.lessonsTarget}`} 
                  />
                  <div className={styles.accuracyBlock}>
                    <div className={styles.accuracyLabel}>Accuracy</div>
                    <div className={styles.accuracyValue} aria-label={`Accuracy ${stats.accuracy} percent`}>
                      {Math.round(stats.accuracy)}%
                    </div>
                  </div>
                  <div>
                    <div className={styles.streakLabel}>Streak</div>
                    <StreakDots days={stats.streak} goal={7} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className={styles.historyBox}>
            <h3 id="history-heading" className={styles.historyHeading}>Lesson History</h3>
            <LessonsHistory items={lessonsHistory} />
          </div>
        </>
      </main>
    </div>
  )
}