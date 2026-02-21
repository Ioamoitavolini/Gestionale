# Documentazione API - Gestionale

## Overview
API RESTful per sistema di gestione clienti con notifiche WhatsApp per beauty/spa centers.

## Base URL
```
http://localhost:3000/api
```

## Autenticazione
Tutte le rotte (tranne login e register) richiedono autenticazione NextAuth tramite sessione/token JWT.

### Login
**POST** `/auth/[...nextauth]/callback/credentials`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Register (Admin only)
**POST** `/auth/register`
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "Nome Cognome",
  "role": "RECEPTIONIST"
}
```

---

## Clienti

### Elenco clienti
**GET** `/clients`

**Response:**
```json
[
  {
    "id": "clx...",
    "firstName": "Mario",
    "lastName": "Rossi",
    "email": "mario@example.com",
    "phone": "3123456789",
    "whatsappNumber": "+393123456789",
    "address": "Via Roma 1",
    "city": "Milano",
    "postalCode": "20100",
    "dateOfBirth": "1990-01-15T00:00:00Z",
    "active": true,
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
]
```

### Dettagli cliente
**GET** `/clients/{id}`

### Crea cliente
**POST** `/clients`

**Request:**
```json
{
  "firstName": "Mario",
  "lastName": "Rossi",
  "phone": "3123456789",
  "whatsappNumber": "+393123456789",
  "email": "mario@example.com",
  "address": "Via Roma 1",
  "city": "Milano",
  "postalCode": "20100",
  "dateOfBirth": "1990-01-15",
  "notes": "Cliente VIP"
}
```

**Validazione:**
- `firstName`, `lastName`: min 1 char, max 100
- `phone`: min 10 digits
- `whatsappNumber`: formato E.164 (+39XXXXXXXXX)
- `email`: email valida (opzionale)
- `postalCode`: CAP italiano 5 cifre (opzionale)
- Email e WhatsApp number devono essere unici

### Aggiorna cliente
**PATCH** `/clients/{id}`

Stesso schema di POST, tutti i campi sono opzionali.

### Elimina cliente (soft delete)
**DELETE** `/clients/{id}`

---

## Appuntamenti

### Elenco appuntamenti
**GET** `/appointments?clientId={clientId}`

**Query params:**
- `clientId` (opzionale): filtra per cliente

**Response:**
```json
[
  {
    "id": "clx...",
    "clientId": "clx...",
    "userId": "clx...",
    "serviceId": "clx...",
    "title": "Manicure",
    "description": "Manicure semipermanente",
    "startTime": "2026-02-28T14:00:00Z",
    "endTime": "2026-02-28T15:00:00Z",
    "status": "SCHEDULED",
    "price": 35.00,
    "notes": "Cliente preferisce rosa",
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
]
```

### Dettagli appuntamento
**GET** `/appointments/{id}`

### Crea appuntamento
**POST** `/appointments`

**Request:**
```json
{
  "clientId": "clx...",
  "userId": "clx...",
  "serviceId": "clx...",
  "title": "Manicure",
  "description": "Semipermanente",
  "startTime": "2026-02-28T14:00:00Z",
  "endTime": "2026-02-28T15:00:00Z",
  "price": 35.00,
  "notes": "Preferenza colore?"
}
```

**Validazione:**
- `startTime` deve essere nel futuro
- `endTime` deve essere dopo `startTime`
- Non devono esserci appuntamenti sovrapposti per lo stesso provider
- Durata massima consigliata: 4 ore

**Comportamento:**
- Crea automaticamente notifica WhatsApp 24 ore prima
- Status iniziale: SCHEDULED

### Aggiorna appuntamento
**PATCH** `/appointments/{id}`

**Status validi:**
- SCHEDULED
- CONFIRMED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- NO_SHOW

### Elimina appuntamento (soft delete)
**DELETE** `/appointments/{id}`

---

## Servizi

### Elenco servizi
**GET** `/services`

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "Manicure",
    "description": "Manicure semipermanente",
    "duration": 60,
    "price": 35.00,
    "active": true,
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
]
```

### Dettagli servizio
**GET** `/services/{id}`

### Crea servizio
**POST** `/services`

**Request:**
```json
{
  "name": "Manicure",
  "description": "Semipermanente con finitura brillante",
  "duration": 60,
  "price": 35.00,
  "active": true
}
```

**Validazione:**
- `name`: min 1, max 100 char
- `duration`: minuti positivi (interi)
- `price`: numeroù positivo

### Aggiorna servizio
**PATCH** `/services/{id}`

### Disattiva servizio
**DELETE** `/services/{id}`

---

## Reportistica

### Report entrate
**GET** `/reports?startDate=2026-02-01&endDate=2026-02-28`

**Query params (opzionali):**
- `startDate`: data inizio (ISO 8601)
- `endDate`: data fine (ISO 8601)

**Response:**
```json
{
  "summary": {
    "totalRevenue": 1250.50,
    "totalAppointments": 25,
    "uniqueClients": 15,
    "averageRevenue": 50.02
  },
  "revenueByService": {
    "Manicure": { "count": 10, "revenue": 350.00 },
    "Pedicure": { "count": 8, "revenue": 280.00 }
  },
  "appointments": [
    {
      "id": "clx...",
      "clientId": "clx...",
      "client": { "firstName": "Mario", "lastName": "Rossi" },
      "service": { "name": "Manicure" },
      "price": 35.00,
      "startTime": "2026-02-28T14:00:00Z"
    }
  ]
}
```

---

## Notifiche

### Processa coda notifiche
**POST** `/notifications/process-queue`

**Comportamento (automatico ogni 5 minuti):**
- Prende fino a 10 notifiche in stato QUEUED
- Invia tramite Twilio WhatsApp
- Passa a SENT o FAILED + retry

**Response:**
```json
{
  "processed": 5,
  "succeeded": 4,
  "failed": 1
}
```

---

## Webhook

### Webhook Twilio (Status callback)
**POST** `/webhooks/twilio`

Riceve callback da Twilio per tracciare stato di consegna dei messaggi WhatsApp.

---

## Errori

### Status HTTP
- **200**: Success
- **201**: Created
- **400**: Bad Request (dati non validi)
- **401**: Unauthorized (autenticazione richiesta)
- **403**: Forbidden (insufficienti permessi)
- **404**: Not Found
- **409**: Conflict (es. email duplicata, appuntamento sovrapposto)
- **500**: Internal Server Error

### Response Errore
```json
{
  "error": "Descrizione errore",
  "details": [
    { "code": "too_small", "path": ["firstName"], "message": "Nome richiesto" }
  ]
}
```

---

## Cron Jobs

### Notifiche WhatsApp (ogni 5 minuti)
```
*/5 * * * *
```
Process 10 notifiche alla volta con retry fino a 3 tentativ.

### Pulizia notifiche (ogni mezzanotte)
```
0 0 * * *
```
Soft-delete notifiche più di 90 giorni.

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/gestionale
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+393512345678
NODE_ENV=development
```

---

## Testing

```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test:watch
```
