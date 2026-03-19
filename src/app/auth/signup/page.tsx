"use client";

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';
import { signupAction } from '@/app/actions/auth';

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signupAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push('/');
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoIcon}></div>
          <h1 className={styles.title}>Create your Account</h1>
          <p className={styles.subtitle}>to continue to BlitzQuiz</p>
        </div>

        {state?.error && <p style={{color: 'var(--md-sys-color-error)', fontSize: '14px', marginBottom: '16px'}}>{state.error}</p>}

        <form action={formAction} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              placeholder=" "
              required
            />
            <label htmlFor="name" className={styles.label}>Full Name</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder=" "
              required
            />
            <label htmlFor="email" className={styles.label}>Email or phone</label>
          </div>
          
          <div className={styles.inputGroup}>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder=" "
              required
            />
            <label htmlFor="password" className={styles.label}>Password</label>
          </div>

          <div className={styles.actions}>
            <Link href="/auth/login" className={styles.signInBtn}>
              Sign in instead
            </Link>
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? 'Creating...' : 'Next'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
