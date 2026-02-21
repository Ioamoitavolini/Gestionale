# Gestionale - Sistema di Gestione Clienti per Centri Estetici

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Gestionale** è una piattaforma completa di gestione clienti e appuntamenti per centri estetici, beauty center e spa, con integrazione di notifiche WhatsApp automatiche tramite Twilio.

## Caratteristiche Principali

✨ **Gestione Clienti**
- CRUD completo clienti con validazione
- Storico appuntamenti per cliente
- Note e preferenze personalizzate

📅 **Calendario e Appuntamenti**
- Pianificazione appuntamenti con rilevamento conflitti
- Stati appuntamento (SCHEDULED, CONFIRMED, COMPLETED, ecc.)
- Filtri per cliente/provider

🔔 **Notifiche WhatsApp**
- Promemoria automatici 24 ore prima appuntamento
- Coda notifiche con retry logico (max 3 tentativi)
- Tracking stato consegna/lettura
- Cleanup automatico notifiche > 90 giorni

📊 **Reportistica**
- Report entrate per periodo
- Breakdown revenue per servizio
- Statistiche clienti unici

🔐 **Sicurezza e Autenticazione**
- NextAuth con Credentials Provider
- Autenticazione basata su ruoli (ADMIN, RECEPTIONIST)
- Middleware di autorizzazione su rotte protette
- Password hashate con bcrypt

🗄️ **Database**
- PostgreSQL con Prisma ORM
- Schema con soft-delete e timestamp
- Migrazioni gestite

---

## Stack Tecnologico

| Aspetto | Tecnologia |
|---------|-----------|
| **Frontend** | React 19, Next.js 15, TypeScript |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Auth** | NextAuth 5 |
| **Validazione** | Zod |
| **WhatsApp** | Twilio |
| **Scheduling** | node-cron |
| **Testing** | Jest, React Testing Library |

---

## Quick Start

### Setup locale con Docker (Consigliato)

```bash
# 1. Clone
git clone https://github.com/Ioamoitavolini/Gestionale.git && cd Gestionale

# 2. Setup ambiente
cp .env.example .env
# Edita .env con credenziali

# 3. Avvia servizi
docker-compose up -d

# 4. Installa e migra database
npm install
npm run db:migrate

# 5. Avvia dev server
npm run dev
```

Accedi a http://localhost:3000

---

## Configurazione

### Variabili Obbligatorie

```env
DATABASE_URL="postgresql://gestionale_user:gestionale_password@localhost:5432/gestionale"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-token-here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+393512345678"
```

---

## API Documentation

Vedi [API.md](API.md) per guida completa.

**Endpoint principali:**
- `POST /api/auth/register` - Registra utente
- `POST /api/clients` - Crea cliente
- `POST /api/appointments` - Prenota appuntamento
- `GET /api/reports` - Report entrate
- `POST /api/notifications/process-queue` - Processa notifiche

---

## Comandi

```bash
npm run dev            # Dev server
npm run build          # Build produzione
npm test              # Test con Jest
npm run db:migrate    # Migrazioni Prisma
npm run lint          # ESLint
```

---

## Architettura

```
src/
├── app/api/           # API Routes (clients, appointments, services, reports, auth)
├── app/dashboard/     # UI Dashboard
├── lib/               # Utilità (auth, validation, cron, db)
├── services/          # Servizi (notifiche WhatsApp)
└── __tests__/         # Test suite (24 test)
```

**Cron Jobs:**
- Ogni 5 minuti: Processa coda notifiche WhatsApp
- Ogni mezzanotte: Cleanup notifiche > 90 giorni

---

## Features

### Validazione Dati
- Email univoche
- Numeri WhatsApp formato E.164 (+39XXXXXXXXX)
- Password sicure (8+ char, maiusc, minusc, numero)
- Appuntamenti non sovrappositi
- Date nel futuro

### Autenticazione RBAC
- **ADMIN**: Accesso completo + registrazione utenti
- **RECEPTIONIST**: Gestione clienti, appuntamenti, report

### Notifiche WhatsApp
```
Appuntamento creato → Coda notifiche → Inviato Twilio → Tracking consegna
```
- Promemoria 24 ore prima
- Retry automatico (max 3 tentativi)
- Soft-delete dopo 90 giorni

---

## Testing

```bash
npm test              # Esegui test
npm test:watch        # Modalità watch
npm test -- coverage  # Con coverage report
```

**Test Coverage:**
- Notifiche (11 test)
- Cron Jobs (13 test)

---

## Deploy

### Docker
```bash
docker build -t gestionale:latest .
docker run -p 3000:3000 --env-file .env gestionale:latest
```

### Vercel
```bash
vercel
# Configura variabili su dashboard Vercel
```

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| PostgreSQL non connette | `docker-compose ps` e `docker-compose up -d` |
| Migrazioni falliscono | `npx prisma migrate reset` (DEV ONLY) |
| WhatsApp non invia | Verifica formato E.164 e credenziali Twilio |

---

## Roadmap

- [ ] Multi-language (EN, IT, FR)
- [ ] SMS fallback
- [ ] Pagamenti (Stripe)
- [ ] App mobile
- [ ] Analytics avanzate
- [ ] Voucher/promozioni
- [ ] Sincronizzazione calendario

---

## License

MIT – vedi [LICENSE](LICENSE)

---

**Versione:** 0.1.0  
**Status:** In sviluppo  
**Ultimo aggiornamento:** 21 Febbraio 2026
