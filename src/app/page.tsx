import Link from 'next/link';
import styles from './page.module.css';
import { db } from '@/lib/db';

export default function Home() {
  const quizzes = db.prepare(`
    SELECT q.*, COUNT(qu.id) as question_count
    FROM quizzes q
    LEFT JOIN questions qu ON q.id = qu.quiz_id
    GROUP BY q.id
  `).all() as any[];

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Assess Your Skills</h1>
          <p className={styles.subtitle}>
            Take high-quality, timed quizzes designed to simulate real coding interviews and competitive programming environments.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Available Quizzes</h2>
          <div className={styles.filterChip}>All Topics</div>
        </div>

        <div className={styles.grid}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.difficulty} ${styles[quiz.difficulty.toLowerCase()] || styles.medium}`}>
                  {quiz.difficulty}
                </span>
                <span className={styles.time}>{Math.round(quiz.time_limit_seconds / 60)} mins</span>
              </div>
              
              <h3 className={styles.cardTitle}>{quiz.title}</h3>
              <p className={styles.cardDesc}>{quiz.description}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.stats}>
                  <span>{quiz.question_count} Questions</span>
                </div>
                {quiz.question_count > 0 ? (
                  <Link href={`/quiz/${quiz.id}`} className={styles.startBtn}>
                    Start
                  </Link>
                ) : (
                  <span style={{fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)'}}>No valid questions</span>
                )}
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <div style={{color: 'var(--md-sys-color-on-surface-variant)', gridColumn: '1 / -1'}}>
              <p>No quizzes available yet. Please wait for an administrator to create one.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
