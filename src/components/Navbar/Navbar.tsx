import Link from 'next/link';
import styles from './Navbar.module.css';
import { getSession } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}></span>
            BlitzQuiz
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link href="/leaderboard" className={styles.navLink}>
            Leaderboard
          </Link>
          {session?.role === 'ADMIN' && (
            <Link href="/admin" className={styles.navLink}>
              Admin Panel
            </Link>
          )}

          <div className={styles.authActions}>
            {session ? (
              <>
                <Link href="/profile" className={styles.navLink} style={{marginRight: '12px'}}>
                  My Profile
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className={styles.loginBtn}>
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.loginBtn}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className={styles.signupBtn}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
