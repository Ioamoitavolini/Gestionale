'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💅</span>
          <span className={styles.logoText}>Gestionale</span>
        </div>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/dashboard" className={styles.navItem}>
            Dashboard
          </Link>
          <Link href="/dashboard/clienti" className={styles.navItem}>
            Clienti
          </Link>
          <Link href="/dashboard/appuntamenti" className={styles.navItem}>
            Appuntamenti
          </Link>
          <Link href="/dashboard/servizi" className={styles.navItem}>
            Servizi
          </Link>
          <Link href="/dashboard/reportistica" className={styles.navItem}>
            Report
          </Link>
        </nav>

        <div className={styles.userSection}>
          {session ? (
            <>
              <span className={styles.userName}>
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
                className={styles.logoutBtn}
              >
                Logout
              </button>
            </>
          ) : null}
        </div>

        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
    </header>
  );
}
