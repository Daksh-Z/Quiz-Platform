'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function submitQuizAttemptAction(quizId: string, answers: Record<string, number>, timeTakenSeconds: number) {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    // Calculate score securely on the server
    const questions = db.prepare('SELECT id, correct_idx FROM questions WHERE quiz_id = ?').all(quizId) as any[];
    
    if (questions.length === 0) return { error: 'Quiz has no questions' };

    let score = 0;
    for (const q of questions) {
      if (answers[q.id] !== undefined && String(answers[q.id]) === String(q.correct_idx)) {
        score += 1;
      }
    }

    const attemptId = crypto.randomUUID();
    db.prepare('INSERT INTO attempts (id, user_id, quiz_id, score, total_questions, time_taken_seconds) VALUES (?, ?, ?, ?, ?, ?)')
      .run(attemptId, session.userId, quizId, score, questions.length, timeTakenSeconds);

    revalidatePath('/leaderboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to submit attempt:', error);
    return { error: 'Failed to submit attempt' };
  }
}
