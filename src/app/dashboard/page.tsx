'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    servicesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [clients, appointments, services] = await Promise.all([
          fetch('/api/clients').then(r => r.json()),
          fetch('/api/appointments').then(r => r.json()),
          fetch('/api/services').then(r => r.json()),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.startTime);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        }).length;

        setStats({
          totalClients: clients.length,
          totalAppointments: appointments.length,
          todayAppointments,
          servicesCount: services.length,
        });
      } catch (err) {
        console.error('Errore caricamento stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.subtitle}>Benvenuto nel tuo centro estetico</p>

      {loading ? (
        <div style={styles.loading}>Caricamento...</div>
      ) : (
        <div style={styles.grid}>
          <StatCard
            title="Clienti"
            value={stats.totalClients}
            icon="👥"
            color="#4caf50"
          />
          <StatCard
            title="Appuntamenti"
            value={stats.totalAppointments}
            icon="📅"
            color="#2196f3"
          />
          <StatCard
            title="Oggi"
            value={stats.todayAppointments}
            icon="⏰"
            color="#ff9800"
          />
          <StatCard
            title="Servizi"
            value={stats.servicesCount}
            icon="💅"
            color="#9c27b0"
          />
        </div>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Azioni Veloci</h2>
        <div style={styles.actionGrid}>
          <ActionButton href="/dashboard/clienti" title="Aggiungi Cliente" icon="➕" />
          <ActionButton href="/dashboard/appuntamenti" title="Nuovo Appuntamento" icon="📝" />
          <ActionButton href="/dashboard/servizi" title="Gestisci Servizi" icon="⚙️" />
          <ActionButton href="/dashboard/reportistica" title="Visualizza Report" icon="📊" />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div style={{ ...styles.card, borderLeftColor: color }}>
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardValue}>{value}</p>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: string;
}) {
  return (
    <a href={href} style={styles.actionButton}>
      <span style={styles.actionIcon}>{icon}</span>
      <span>{title}</span>
    </a>
  );
}

const styles = {
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 30px 0',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#999',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  cardIcon: {
    fontSize: '32px',
  } as React.CSSProperties,
  cardContent: {
    flex: 1,
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  } as React.CSSProperties,
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
  } as React.CSSProperties,
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  } as React.CSSProperties,
  actionButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    border: '2px solid #ddd',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#333',
    transition: 'all 0.2s',
    cursor: 'pointer',
  } as React.CSSProperties,
  actionIcon: {
    fontSize: '24px',
    marginBottom: '10px',
  } as React.CSSProperties,
};
