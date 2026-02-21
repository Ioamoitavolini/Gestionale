#!/bin/bash
set -e

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🚀 Avvio Gestionale - Sistema Gestione Clienti${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Step 1: Installa dipendenze
echo -e "${BLUE}📦 Step 1: Installazione dipendenze npm...${NC}"
if [ ! -d "node_modules" ]; then
  npm install
  echo -e "${GREEN}✅ Dipendenze installate${NC}\n"
else
  echo -e "${GREEN}✅ Dipendenze già presenti${NC}\n"
fi

# Step 2: Setup ambiente
echo -e "${BLUE}⚙️  Step 2: Setup file di configurazione...${NC}"
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ File .env creato da .env.example${NC}"
    echo -e "${BLUE}⚠️  NOTA: Configura le credenziali Twilio in .env se necessario${NC}\n"
  fi
else
  echo -e "${GREEN}✅ File .env già configurato${NC}\n"
fi

# Step 3: Setup database con Docker
echo -e "${BLUE}🐳 Step 3: Avvio servizi Docker (PostgreSQL)...${NC}"
if command -v docker &> /dev/null; then
  docker-compose up -d
  echo -e "${GREEN}✅ Servizi Docker avviati${NC}"
  sleep 3  # Aspetta che il database sia pronto
  echo -e "${GREEN}✅ Database pronto${NC}\n"
else
  echo -e "${RED}⚠️  Docker non trovato. Assicurati che il database sia disponibile!${NC}\n"
fi

# Step 4: Migrazioni database
echo -e "${BLUE}🗄️  Step 4: Esecuzione migrazioni database...${NC}"
npm run db:migrate
echo -e "${GREEN}✅ Database migrato${NC}\n"

# Step 5: Seed database
echo -e "${BLUE}🌱 Step 5: Popolamento database con dati demo...${NC}"
npm run db:seed
echo -e "${GREEN}✅ Database popolato${NC}\n"

# Step 6: Avvio server
echo -e "${BLUE}🚀 Step 6: Avvio server di sviluppo...${NC}\n"
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✨ Gestionale è pronto!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${BLUE}🌐 URL:${NC} http://localhost:3000"
echo -e "${BLUE}👤 Login:${NC} admin@gestionale.local"
echo -e "${BLUE}🔑 Password:${NC} AdminPass123"
echo -e "${GREEN}================================================${NC}\n"

npm run dev
