'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function createQuizAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const timeLimit = parseInt(formData.get('time_limit') as string, 10);
  const difficulty = formData.get('difficulty') as string;

  if (!title || !description || isNaN(timeLimit)) return { error: 'Missing required fields' };

  try {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO quizzes (id, title, description, time_limit_seconds, difficulty) VALUES (?, ?, ?, ?, ?)').run(id, title, description, timeLimit, difficulty);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create quiz' };
  }
}

export async function createQuestionAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') return { error: 'Unauthorized' };

  const quizId = formData.get('quiz_id') as string;
  const text = formData.get('text') as string;
  const options = JSON.stringify([
    formData.get('option0'),
    formData.get('option1'),
    formData.get('option2'),
    formData.get('option3')
  ]);
  const correctIdx = parseInt(formData.get('correct_idx') as string, 10);

  if (!quizId || !text || isNaN(correctIdx)) return { error: 'Missing required fields' };

  try {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO questions (id, quiz_id, text, options, correct_idx) VALUES (?, ?, ?, ?, ?)').run(id, quizId, text, options, correctIdx);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create question' };
  }
}

export async function deleteQuizAction(quizId: string) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(quizId);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete quiz' };
  }
}

export async function deleteQuestionAction(questionId: string) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete question' };
  }
}

export async function deleteUserAction(userId: string) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') return { error: 'Unauthorized' };

  if (session.userId === userId) {
    return { error: 'Admin cannot remove themselves' };
  }

  const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as any;
  if (targetUser?.role === 'ADMIN') {
    return { error: 'Cannot remove another administrator' };
  }

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete user' };
  }
}

export async function resetUserPasswordAction(userId: string, newPassword: string) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') return { error: 'Unauthorized' };

  if (!newPassword || newPassword.length < 4) {
      return { error: 'Password must be at least 4 characters' };
  }

  try {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, raw_password = ? WHERE id = ?').run(hash, newPassword, userId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to reset password' };
  }
}
