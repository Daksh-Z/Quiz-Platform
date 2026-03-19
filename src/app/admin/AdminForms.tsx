"use client";

import { useActionState, useEffect } from 'react';
import styles from './admin.module.css';
import { createQuizAction, createQuestionAction, deleteQuizAction, deleteQuestionAction, deleteUserAction, resetUserPasswordAction } from '@/app/actions/admin';

export function DeleteQuizButton({ quizId }: { quizId: string }) {
  const handleAction = async () => {
    await deleteQuizAction(quizId);
  };
  return (
    <form action={handleAction} style={{ display: 'inline' }}>
       <button type="submit" className={styles.deleteBtn} onClick={(e) => { if(!confirm("Are you sure you want to delete this quiz completely?")) e.preventDefault(); }}>Delete Quiz</button>
    </form>
  )
}

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const handleAction = async () => {
    await deleteQuestionAction(questionId);
  };
  return (
    <form action={handleAction} style={{ display: 'inline' }}>
       <button type="submit" className={styles.deleteBtnSmall} onClick={(e) => { if(!confirm("Delete question from quiz?")) e.preventDefault(); }}>Remove</button>
    </form>
  )
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const handleAction = async () => {
    const res = await deleteUserAction(userId);
    if (res?.error) alert(res.error);
  };
  return (
    <form action={handleAction} style={{ display: 'inline', marginLeft: '12px' }}>
       <button type="submit" className={styles.deleteBtnSmall} onClick={(e) => { if(!confirm("Are you sure you want to permanently delete this user?")) e.preventDefault(); }}>Remove User</button>
    </form>
  )
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const handleAction = async (formData: FormData) => {
    const newPass = formData.get('new_password') as string;
    const res = await resetUserPasswordAction(userId, newPass);
    if (res?.error) alert(res.error);
    else {
        alert('Password changed successfully');
        (document.getElementById(`pass-form-${userId}`) as HTMLFormElement).reset();
    }
  };
  return (
    <form id={`pass-form-${userId}`} action={handleAction} style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
       <input type="text" name="new_password" placeholder="New password" className={styles.inputSmall} required />
       <button type="submit" className={styles.secondaryBtnSmall}>Save / View</button>
    </form>
  )
}

export function QuizForm() {
  const [state, formAction, isPending] = useActionState(createQuizAction, null);

  useEffect(() => {
    if (state?.success) {
        alert("Quiz Created!");
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.formCard}>
      <h3>Create New Quiz</h3>
      {state?.error && <p className={styles.error}>{state.error}</p>}
      
      <div className={styles.inputGroup}>
        <input name="title" placeholder="Quiz Title" className={styles.input} required />
      </div>
      <div className={styles.inputGroup}>
        <textarea name="description" placeholder="Description" className={styles.input} required />
      </div>
      <div className={styles.inputGroup}>
        <input type="number" name="time_limit" placeholder="Time Limit (Seconds, e.g. 1800 for 30m)" className={styles.input} required />
      </div>
      <div className={styles.inputGroup}>
        <select name="difficulty" className={styles.input}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Quiz'}
      </button>
    </form>
  );
}

export function QuestionForm({ quizzes }: { quizzes: any[] }) {
  const [state, formAction, isPending] = useActionState(createQuestionAction, null);

  useEffect(() => {
    if (state?.success) {
        alert("Question Added!");
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.formCard}>
      <h3>Add Question to Quiz</h3>
      {state?.error && <p className={styles.error}>{state.error}</p>}
      
      <div className={styles.inputGroup}>
        <select name="quiz_id" className={styles.input} required>
          <option value="">Select Quiz</option>
          {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </div>
      <div className={styles.inputGroup}>
        <textarea name="text" placeholder="Question Text" className={styles.input} required />
      </div>
      
      <div className={styles.optionsGrid}>
        <input name="option0" placeholder="Option 1" className={styles.input} required />
        <input name="option1" placeholder="Option 2" className={styles.input} required />
        <input name="option2" placeholder="Option 3" className={styles.input} required />
        <input name="option3" placeholder="Option 4" className={styles.input} required />
      </div>

      <div className={styles.inputGroup}>
        <select name="correct_idx" className={styles.input} required>
            <option value="">Select Correct Option</option>
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
        </select>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Question'}
      </button>
    </form>
  );
}
