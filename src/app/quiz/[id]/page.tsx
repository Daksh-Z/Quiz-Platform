import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import QuizClient from './QuizClient';
import { getSession } from '@/lib/auth';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(resolvedParams.id) as any;
  if (!quiz) return notFound();

  // Fetch questions WITHOUT correct_idx for the client
  const questionsRaw = db.prepare('SELECT id, text, options FROM questions WHERE quiz_id = ?').all(resolvedParams.id) as any[];
  
  if (questionsRaw.length === 0) {
    return (
        <div style={{padding: '64px', textAlign: 'center'}}>
            <h1>This quiz has no questions yet.</h1>
        </div>
    );
  }

  const questions = questionsRaw.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  }));

  return <QuizClient quiz={quiz} questions={questions} />;
}
