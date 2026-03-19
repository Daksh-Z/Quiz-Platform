import { db } from '@/lib/db';
import styles from './admin.module.css';
import { QuizForm, QuestionForm, DeleteQuizButton, DeleteQuestionButton, DeleteUserButton, ResetPasswordForm } from './AdminForms';

export default async function AdminPage() {
  const quizzes = db.prepare('SELECT * FROM quizzes').all();
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const attemptsCount = db.prepare('SELECT COUNT(*) as count FROM attempts').get() as { count: number };
  
  const allQuestions = db.prepare('SELECT id, quiz_id, text FROM questions').all() as any[];
  const questionMap = new Map();
  allQuestions.forEach((q: any) => {
    questionMap.set(q.quiz_id, (questionMap.get(q.quiz_id) || 0) + 1);
  });

  const allUsers = db.prepare('SELECT id, name, email, role, raw_password FROM users').all() as any[];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Control Panel</h1>
        <p>Manage users, quizzes, and platform content.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statNumber}>{usersCount.count}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Quizzes</h3>
          <p className={styles.statNumber}>{quizzes.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Attempts</h3>
          <p className={styles.statNumber}>{attemptsCount.count}</p>
        </div>
      </div>

      <div className={styles.formsContainer}>
        <QuizForm />
        <QuestionForm quizzes={quizzes} />
      </div>

      <div className={styles.listContainer}>
        <h2>Existing Quizzes</h2>
        <div className={styles.quizList}>
          {quizzes.map((q: any) => {
            const qs = allQuestions.filter((x: any) => x.quiz_id === q.id);
            return (
              <div key={q.id} className={styles.quizItem}>
                <div>
                  <h4>{q.title}</h4>
                  <p className={styles.quizDetails}>ID: {q.id} | Difficulty: {q.difficulty} | Questions: {questionMap.get(q.id) || 0}</p>
                  
                  {qs.length > 0 && (
                    <div className={styles.questionList}>
                      {qs.map((question: any) => (
                        <div key={question.id} className={styles.questionItem}>
                          <span>- {question.text}</span>
                          <DeleteQuestionButton questionId={question.id} />
                        </div>
                      ))}
                    </div>
                  )}

                  <DeleteQuizButton quizId={q.id} />
                </div>
              </div>
            );
          })}
          {quizzes.length === 0 && <p>No quizzes created yet.</p>}
        </div>
      </div>

      <div className={styles.listContainer} style={{marginTop: '48px'}}>
        <h2>Registered Users</h2>
        <div className={styles.quizList}>
          {allUsers.map((user: any) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <h4 style={{marginBottom: '4px'}}>{user.name} <span style={{fontSize: '11px', opacity: 0.7, padding: '2px 6px', background: 'var(--md-sys-color-surface-variant)', borderRadius: '4px', marginLeft: '6px'}}>{user.role}</span></h4>
                <p className={styles.quizDetails} style={{marginBottom: '8px'}}>{user.email}</p>
                <div style={{fontSize: '13px', color: 'var(--md-sys-color-on-surface)', fontWeight: '500'}}>Password: <span style={{fontFamily: 'monospace', color: 'var(--md-sys-color-primary)', fontSize:'14px', background: 'var(--md-sys-color-surface-variant)', padding: '2px 6px', borderRadius: '4px'}}>{user.raw_password || '(Not Available)'}</span></div>
                <div style={{fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px'}}>Type below to override:</div>
                <ResetPasswordForm userId={user.id} />
              </div>
              <div className={styles.userActions}>
                 {user.role !== 'ADMIN' && <DeleteUserButton userId={user.id} />}
              </div>
            </div>
          ))}
          {allUsers.length === 0 && <p>No users registered yet.</p>}
        </div>
      </div>
    </div>
  );
}
