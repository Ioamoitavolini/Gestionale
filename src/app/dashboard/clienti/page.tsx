'use client';

import { useState, useEffect } from 'react';

export default function ClientiPage() {
  const [clienti, setClienti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    city: '',
  });

  useEffect(() => {
    fetchClienti();
  }, []);

  async function fetchClienti() {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClienti(data);
    } catch (err) {
      console.error('Errore caricamento clienti:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          whatsappNumber: '',
          email: '',
          city: '',
        });
        setShowForm(false);
        fetchClienti();
      }
    } catch (err) {
      console.error('Errore aggiunta cliente:', err);
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestione Clienti</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.button}
        >
          {showForm ? '✕ Annulla' : '+ Aggiungi Cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddClient} style={styles.form}>
          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Nome"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Cognome"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="Telefono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="WhatsApp (es: +393123456789)"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Città"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitBtn}>
            Salva Cliente
          </button>
        </form>
      )}

      {loading ? (
        <div style={styles.loading}>Caricamento clienti...</div>
      ) : (
        <div style={styles.tableContainer}>
          {clienti.length === 0 ? (
            <p style={styles.empty}>Nessun cliente. Inizia ad aggiungerne uno!</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefono</th>
                  <th>WhatsApp</th>
                  <th>Email</th>
                  <th>Città</th>
                </tr>
              </thead>
              <tbody>
                {clienti.map((client) => (
                  <tr key={client.id}>
                    <td>{client.firstName} {client.lastName}</td>
                    <td>{client.phone}</td>
                    <td>{client.whatsappNumber}</td>
                    <td>{client.email || '-'}</td>
                    <td>{client.city || '-'}</td>
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
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  empty: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#999',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,
};
