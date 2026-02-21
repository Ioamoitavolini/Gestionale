# Istruzioni Copilot per Gestionale

## Panoramica del Progetto
**Gestionale** è un sistema di gestione clienti per centri estetici (beauty/spa) con notifiche di promemoria WhatsApp integrate.

### Requisiti Principali
- Gestione database clienti (contatti, cronologia appuntamenti, preferenze)
- Pianificazione appuntamenti e viste calendario
- Notifiche WhatsApp di promemoria per appuntamenti imminenti
- Catalogo servizi/trattamenti
- Reportistica semplice (visite clienti, ricavi per servizio)

## Linee Guida Architetturali

### Stack Tecnologico Consigliato
- **Frontend**: React/Vue.js con TypeScript (o Next.js full-stack)
- **Backend**: Node.js/Express o Python/FastAPI
- **Database**: PostgreSQL (clienti, appuntamenti) + Redis (gestione sessioni)
- **Integrazione WhatsApp**: API Twilio o Meta Business API (canali ufficiali)
- **Deploy**: Container Docker, CI/CD GitHub Actions

### Strutture Chiave da Stabilire
1. **Separazione dei Compiti**: Mantenere route API, logica di business e modelli database in directory separate
2. **Modulo Clienti**: `src/clients/` - operazioni CRUD, ricerca, filtraggio
3. **Modulo Appuntamenti**: `src/appointments/` - pianificazione, rilevamento conflitti, tracciamento stato
4. **Modulo Notifiche**: `src/notifications/` - coda WhatsApp, tracciamento consegne, logica retry
5. **Livello Database**: Usare migrazioni da subito per tracciare cambiamenti schema

## Convenzioni Critiche

### Autenticazione e Sicurezza
- Implementare accesso basato su ruoli (admin, receptionist, viste clienti)
- Hash password con bcrypt
- Usare autenticazione JWT o basata su sessioni, verificare su ogni rotta protetta
- Validare numeri WhatsApp (formato E.164: +[prefisso paese][numero])

### Logica Appuntamenti
- Forzare prenotazioni non sovrapposte per provider/stanza
- Memorizzare timestamp appuntamenti in UTC, visualizzare in fuso orario locale
- Implementare soft-delete per record storici

### Pattern Integrazione WhatsApp
```
Appuntamento Creato → Aggiunto in Coda → Invia WhatsApp → Registra Consegna → Retry su fallimento
```
- Inviare promemoria 24 ore prima appuntamento
- Implementare backoff esponenziale per messaggi falliti
- Tracciare stato consegna/lettura

## Workflow di Sviluppo

### Setup
```bash
# Inizializzare struttura progetto
npm install
git checkout -b feature/initial-setup

# Configurare ambiente
cp .env.example .env
# Configurare: DB_URL, TWILIO_XXXXXX, JWT_SECRET

# Setup database
npm run db:migrate
npm run db:seed  # Popola con dati demo
```

### Comandi
- `npm run dev` - Avvia server dev
- `npm run db:migrate` - Migrazioni Prisma
- `npm run db:seed` - Popola database con dati demo
- `npm run db:reset` - Reset database (DEV ONLY)
- `npm test` - Test unitari
- `npm run lint` - Linting

## Organizzazione File
```
src/
├── clients/        # Gestione clienti
├── appointments/   # Logica pianificazione
├── notifications/  # Coda WhatsApp e consegne
├── auth/          # Autenticazione
├── db/            # Modelli e migrazioni
├── utils/         # Helper condivisi
└── tests/         # File test

.github/
├── workflows/     # Pipeline CI/CD
└── copilot-instructions.md (questo file)
```

## Punti Decisionali Importanti per Agenti IA

1. **Scope MVP**: Iniziare con CRUD base per clienti + appuntamenti + pianificazione single-provider
2. **Aggiornamenti Real-time**: Considerare WebSocket solo se è richiesta collaborazione live
3. **Multi-lingua**: Interfaccia italiana inizialmente; codice in inglese
4. **Reportistica**: Usare query di aggregazione, non calcoli lato client per dataset grandi

## Requisiti Testing
- Test unitari per rilevamento conflitti appuntamenti e logica retry WhatsApp (percorsi critici)
- Test integrazione per endpoint API
- Mock API esterne (Twilio/Meta) nei test

## Prima di Fare Modifiche
- Rivedere la struttura file corrente e moduli esistenti
- Controllare file migrazione prima di modificare schema database
- Verificare che template messaggi WhatsApp siano conformi a linee guida Meta/Twilio

## Error Handling e Logging

### Utility Error Handling
Usare `src/lib/error-handler.ts` per gestione centralizzata:
- `AppError` classe custom per errori applicativi
- `ErrorCodes` enum predefinito di errori comuni (VALIDATION_ERROR, NOT_FOUND, DUPLICATE_EMAIL, ecc.)
- `logger` utility per debug/info/warn/error
- `createError()` per creare errori type-safe
- `serializeError()` per risposta API
- `handleZodError()` per Zod validation errors

### Pattern API Routes
```typescript
import { createError, handleZodError, ErrorCodes, logger } from '@/lib/error-handler';

try {
  const data = mySchema.parse(body);
  // Logica...
  return NextResponse.json(data);
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('DB error:', error);
    throw createError(ErrorCodes.DATABASE_ERROR);
  }
  if (error instanceof ZodError) {
    throw handleZodError(error);
  }
  throw error;
}
// Middleware globale gestisce AppError → response JSON + logger
```

## Seed Database
- Script: `prisma/seed.ts`
- Comando: `npm run db:seed`
- Popola con utenti demo, servizi, clienti e appuntamenti
- Da eseguire dopo `npm run db:migrate`
