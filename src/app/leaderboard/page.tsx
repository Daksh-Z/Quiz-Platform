import Link from 'next/link';
import styles from './leaderboard.module.css';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ quizId?: string }> }) {
  const resolvedParams = await searchParams;
  const quizId = resolvedParams.quizId;

  const quizzes = db.prepare('SELECT id, title, description FROM quizzes').all() as any[];

  if (!quizId) {
    return (
      <div className={styles.container}>
        <div className={styles.headerArea}>
          <h1 className={styles.pageTitle}>Quiz Leaderboards</h1>
          <p className={styles.pageSubtitle}>Select a specific quiz below to view its top performers.</p>
        </div>
        <main className={styles.main}>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {quizzes.map(q => (
               <Link href={`/leaderboard?quizId=${q.id}`} key={q.id} style={{
                  padding: '24px', 
                  border: '1px solid var(--md-sys-color-outline)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  backgroundColor: 'var(--md-sys-color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
               }}>
                 <h3 style={{fontSize: '18px', margin: 0}}>{q.title}</h3>
                 <p style={{fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)', margin: 0}}>{q.description}</p>
                 <div style={{marginTop: '16px', color: 'var(--md-sys-color-primary)', fontSize: '14px', fontWeight: '500'}}>View Leaderboard &rarr;</div>
               </Link>
            ))}
            {quizzes.length === 0 && <p>No quizzes available yet.</p>}
          </div>
        </main>
      </div>
    );
  }

  const selectedQuiz = db.prepare('SELECT title FROM quizzes WHERE id = ?').get(quizId) as any;

  // Deduplicate attempts per user for the specific quiz, strictly ignoring Admin users
  const attempts = db.prepare(`
    SELECT * FROM (
      SELECT a.*, u.name, q.title as quiz_title,
        ROW_NUMBER() OVER (
          PARTITION BY a.user_id 
          ORDER BY a.score DESC, a.created_at ASC
        ) as rn
      FROM attempts a
      JOIN users u ON a.user_id = u.id
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.quiz_id = ? AND u.role != 'ADMIN'
    )
    WHERE rn = 1
    ORDER BY score DESC, created_at ASC
    LIMIT 100
  `).all(quizId) as any[];

  const leaderboardData = attempts.map((a, i) => ({
    ...a,
    rank: i + 1,
    time: `${Math.floor(a.time_taken_seconds / 60)}m ${a.time_taken_seconds % 60}s`
  }));

  return (
    <div className={styles.container}>
      <div className={styles.headerArea} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
           <h1 className={styles.pageTitle}>{selectedQuiz?.title || 'Unknown Quiz'} Leaderboard</h1>
           <p className={styles.pageSubtitle}>See how you stack up against top developers worldwide.</p>
        </div>
        <Link href="/leaderboard" className={styles.primaryBtn} style={{background: 'var(--md-sys-color-surface-variant)', color: 'var(--md-sys-color-on-surface-variant)'}}>
           &larr; Back to all Quizzes
        </Link>
      </div>

      <main className={styles.main}>
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Rank</th>
                <th className={styles.th}>Participant</th>
                <th className={`${styles.th} ${styles.rightAlign}`}>Submitted</th>
                <th className={`${styles.th} ${styles.rightAlign}`}>Score</th>
                <th className={`${styles.th} ${styles.rightAlign}`}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry) => (
                <tr key={entry.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={`${styles.rankBadge} ${entry.rank <= 3 ? styles[`rank${entry.rank}`] : ''}`}>
                      {entry.rank}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.participantInfo}>
                      <div className={styles.avatar}>{entry.name.charAt(0).toUpperCase()}</div>
                      <span className={styles.participantName}>{entry.name}</span>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.rightAlign}`}>
                    <span style={{fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)'}}>{new Date(entry.created_at + 'Z').toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</span>
                  </td>
                  <td className={`${styles.td} ${styles.rightAlign}`}>
                    <span className={styles.score}>{entry.score} / {entry.total_questions}</span>
                  </td>
                  <td className={`${styles.td} ${styles.rightAlign} ${styles.timeCell}`}>
                    {entry.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboardData.length === 0 && (
            <div style={{padding: '32px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)'}}>
              No quiz attempts yet for this leaderboard.
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <Link href={`/quiz/${quizId}`} className={styles.primaryBtn}>
            Take this Quiz to Improve Your Rank
          </Link>
        </div>
      </main>
    </div>
  );
}
