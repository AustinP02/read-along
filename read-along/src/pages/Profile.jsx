import React, { useState } from 'react'
import styles from './Profile.module.css'

export default function Profile() {
  const [page, setPage] = useState('profile')
  const name = 'Alexandra Doe'
  
  const stats = {
    accuracy: 92,
    lessonsCompleted: 24,
    lessonsTarget: 30,
    streak: 7,
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
  
  const lessonsHistory = [
    { id: 1, title: 'Intro: Alphabet', date: '2025-09-20', accuracy: 88},
    { id: 2, title: 'Basics: Short Vowels', date: '2025-09-22', accuracy: 92},
    { id: 3, title: 'Reading: Simple Sentences', date: '2025-09-25', accuracy: 85},
    { id: 4, title: 'Comprehension: Story 1', date: '2025-09-28', accuracy: 95}
  ]
  
  function LessonsHistory({ items }) {
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
  
  return (
    <div className={styles.profileWrapper}>
      <main className={styles.main}>
        <>
          <h2 className={styles.welcomeHeading}>Welcome back, {name.split(' ')[0]} 👋</h2>
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
                      {stats.accuracy}%
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