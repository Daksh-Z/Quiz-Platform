import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './profile.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const user = db.prepare('SELECT name, email, role FROM users WHERE id = ?').get(session.userId) as any;
  if (!user) redirect('/auth/login');

  const attempts = db.prepare(`
    SELECT a.*, q.title as quiz_title
    FROM attempts a
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(session.userId) as any[];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarLarge}>{user.name.charAt(0).toUpperCase()}</div>
        <div className={styles.userInfo}>
            <h1 className={styles.name}>{user.name}</h1>
            <p className={styles.email}>{user.email}</p>
            <span className={styles.roleBadge}>{user.role}</span>
        </div>
      </div>

      <main className={styles.main}>
        <h2>Your Quiz History</h2>
        {attempts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't taken any quizzes yet.</p>
            <Link href="/" className={styles.primaryBtn}>Explore Quizzes</Link>
          </div>
        ) : (
          <div className={styles.attemptsList}>
            {attempts.map(attempt => (
                <div key={attempt.id} className={styles.attemptCard}>
                  <div className={styles.attemptHeader}>
                    <h3>{attempt.quiz_title}</h3>
                    <span className={styles.date}>{new Date(attempt.created_at + 'Z').toLocaleDateString()}</span>
                  </div>
                  <div className={styles.attemptBody}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Score</span>
                      <span className={styles.statValue}>{attempt.score} / {attempt.total_questions}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Time</span>
                      <span className={styles.statValue}>{Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s</span>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
