'use client';

import { useState, useEffect } from 'react';

export default function ServiziPage() {
  const [servizi, setServizi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
  });

  useEffect(() => {
    fetchServizi();
  }, []);

  async function fetchServizi() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServizi(data);
    } catch (err) {
      console.error('Errore caricamento servizi:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          name: '',
          description: '',
          duration: 30,
          price: 0,
        });
        setShowForm(false);
        fetchServizi();
      }
    } catch (err) {
      console.error('Errore aggiunta servizio:', err);
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestione Servizi</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.button}
        >
          {showForm ? '✕ Annulla' : '+ Aggiungi Servizio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddService} style={styles.form}>
          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Nome servizio (es: Manicure)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Descrizione (opzionale)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Durata (minuti)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Prezzo (€)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
              step="0.01"
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitBtn}>
            Salva Servizio
          </button>
        </form>
      )}

      {loading ? (
        <div style={styles.loading}>Caricamento servizi...</div>
      ) : (
        <div style={styles.grid}>
          {servizi.length === 0 ? (
            <p style={styles.empty}>Nessun servizio. Aggiungi il primo!</p>
          ) : (
            servizi.map((servizio) => (
              <div key={servizio.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{servizio.name}</h3>
                {servizio.description && (
                  <p style={styles.cardDesc}>{servizio.description}</p>
                )}
                <div style={styles.cardFooter}>
                  <span style={styles.duration}>⏱️ {servizio.duration} min</span>
                  <span style={styles.price}>€{servizio.price.toFixed(2)}</span>
                </div>
              </div>
            ))
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
    gridColumn: '1 / -1' as const,
    padding: '40px',
    textAlign: 'center' as const,
    color: '#999',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  cardDesc: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 15px 0',
  } as React.CSSProperties,
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
  } as React.CSSProperties,
  duration: {
    fontSize: '13px',
    color: '#666',
  } as React.CSSProperties,
  price: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#9c27b0',
  } as React.CSSProperties,
};
