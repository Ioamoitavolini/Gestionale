'use client';

import { useState, useEffect } from 'react';

export default function AppuntamentiPage() {
  const [appuntamenti, setAppuntamenti] = useState<any[]>([]);
  const [clienti, setClienti] = useState<any[]>([]);
  const [servizi, setServizi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    userId: '', // Da implementare: selezione provider
    serviceId: '',
    title: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [appRes, clientRes, servRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/clients'),
        fetch('/api/services'),
      ]);

      const [appData, clientData, servData] = await Promise.all([
        appRes.json(),
        clientRes.json(),
        servRes.json(),
      ]);

      setAppuntamenti(appData);
      setClienti(clientData);
      setServizi(servData);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.clientId || !formData.serviceId || !formData.startTime || !formData.endTime) {
      alert('Compila tutti i campi richiesti');
      return;
    }

    try {
      // Usa l'ID utente da sessione (TODO: implementare)
      const currentUserId = 'test-user-id'; // Placeholder

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: currentUserId,
        }),
      });

      if (res.ok) {
        setFormData({
          clientId: '',
          userId: '',
          serviceId: '',
          title: '',
          startTime: '',
          endTime: '',
          notes: '',
        });
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Errore creazione appuntamento');
      }
    } catch (err) {
      console.error('Errore aggiunta appuntamento:', err);
    }
  }

  const selectedService = servizi.find(s => s.id === formData.serviceId);

  const handleStartTimeChange = (startTime: string) => {
    setFormData({ ...formData, startTime });
    
    if (selectedService) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + selectedService.duration * 60000);
      setFormData(prev => ({
        ...prev,
        startTime,
        endTime: end.toISOString().slice(0, 16),
      }));
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestione Appuntamenti</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.button}
        >
          {showForm ? '✕ Annulla' : '+ Nuovo Appuntamento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddAppointment} style={styles.form}>
          <div style={styles.formGrid}>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
              style={styles.input}
            >
              <option value="">-- Seleziona cliente --</option>
              {clienti.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>

            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
              style={styles.input}
            >
              <option value="">-- Seleziona servizio --</option>
              {servizi.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (€{s.price})
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              required
              style={styles.input}
            />

            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
              style={styles.input}
              disabled={!selectedService}
            />

            <input
              type="text"
              placeholder="Note (opzionale)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitBtn}>
            Salva Appuntamento
          </button>
        </form>
      )}

      {loading ? (
        <div style={styles.loading}>Caricamento appuntamenti...</div>
      ) : (
        <div style={styles.tableContainer}>
          {appuntamenti.filter(a => a.status !== 'CANCELLED').length === 0 ? (
            <p style={styles.empty}>Nessun appuntamento. Aggiungine uno!</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servizio</th>
                  <th>Data e Ora</th>
                  <th>Stato</th>
                  <th>Prezzo</th>
                </tr>
              </thead>
              <tbody>
                {appuntamenti
                  .filter(a => a.status !== 'CANCELLED')
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((apt) => (
                    <tr key={apt.id}>
                      <td>{apt.client.firstName} {apt.client.lastName}</td>
                      <td>{apt.service.name}</td>
                      <td>{new Date(apt.startTime).toLocaleDateString('it-IT')} {new Date(apt.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span style={{
                          ...styles.badge,
                          backgroundColor:
                            apt.status === 'COMPLETED' ? '#4caf50' :
                            apt.status === 'SCHEDULED' ? '#2196f3' :
                            '#ff9800'
                        }}>
                          {apt.status}
                        </span>
                      </td>
                      <td>€{apt.price?.toFixed(2) || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  } as React.CSSProperties,
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  } as React.CSSProperties,
  button: {
    padding: '10px 20px',
    backgroundColor: '#9c27b0',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  form: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  } as React.CSSProperties,
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#4caf50',
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
  empty: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#999',
  } as React.CSSProperties,
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,
  badge: {
    padding: '4px 8px',
    borderRadius: '3px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  } as React.CSSProperties,
};
