'use client';

import { useState, useEffect } from 'react';

export default function ReportisticaPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);

      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Errore caricamento report:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!report && !loading) {
    return <div>Errore caricamento reportistica</div>;
  }

  return (
    <div>
      <h1 style={styles.title}>Reportistica</h1>

      <div style={styles.filterBox}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={styles.input}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={styles.input}
        />
        <button onClick={fetchReport} style={styles.filterBtn}>
          🔍 Genera Report
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Caricamento...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={styles.grid}>
            <SummaryCard
              title="Ricavo Totale"
              value={`€${report.summary.totalRevenue.toFixed(2)}`}
              icon="💰"
              color="#4caf50"
            />
            <SummaryCard
              title="Appuntamenti"
              value={report.summary.totalAppointments}
              icon="📅"
              color="#2196f3"
            />
            <SummaryCard
              title="Clienti Unici"
              value={report.summary.uniqueClients}
              icon="👥"
              color="#ff9800"
            />
            <SummaryCard
              title="Ricavo Medio"
              value={`€${report.summary.averageRevenue.toFixed(2)}`}
              icon="📊"
              color="#9c27b0"
            />
          </div>

          {/* Revenue by Service */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Ricavi per Servizio</h2>
            <div style={styles.serviceGrid}>
              {Object.entries(report.revenueByService).length === 0 ? (
                <p style={styles.empty}>Nessun dato disponibile</p>
              ) : (
                Object.entries(report.revenueByService).map(([serviceName, data]: [string, any]) => (
                  <div key={serviceName} style={styles.serviceCard}>
                    <h3 style={styles.serviceName}>{serviceName}</h3>
                    <div style={styles.serviceStats}>
                      <div>
                        <span style={styles.statLabel}>Prenotazioni</span>
                        <p style={styles.statValue}>{data.count}</p>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <span style={styles.statLabel}>Ricavo</span>
                        <p style={styles.statValue}>€{data.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Appointments Table */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Appuntamenti Completati</h2>
            <div style={styles.tableContainer}>
              {report.appointments.length === 0 ? (
                <p style={styles.empty}>Nessun appuntamento completato nel periodo</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Cliente</th>
                      <th>Servizio</th>
                      <th>Ricavo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.appointments.map((apt: any) => (
                      <tr key={apt.id}>
                        <td>{new Date(apt.startTime).toLocaleDateString('it-IT')}</td>
                        <td>{apt.client.firstName} {apt.client.lastName}</td>
                        <td>{apt.service.name}</td>
                        <td>€{apt.price?.toFixed(2) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
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

const styles = {
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 30px 0',
  } as React.CSSProperties,
  filterBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  } as React.CSSProperties,
  filterBtn: {
    padding: '8px 16px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
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
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  } as React.CSSProperties,
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
  } as React.CSSProperties,
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  } as React.CSSProperties,
  serviceCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #eee',
  } as React.CSSProperties,
  serviceName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 12px 0',
  } as React.CSSProperties,
  serviceStats: {
    display: 'flex',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '12px',
    color: '#999',
  } as React.CSSProperties,
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '4px 0 0 0',
  } as React.CSSProperties,
  empty: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#999',
  } as React.CSSProperties,
  tableContainer: {
    overflow: 'hidden',
    borderRadius: '6px',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  } as React.CSSProperties,
};
