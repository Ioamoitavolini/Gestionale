import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seed del database...');

  // Crea utenti demo
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gestionale.local' },
    update: {},
    create: {
      email: 'admin@gestionale.local',
      password: await bcryptjs.hash('AdminPass123', 10),
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
    },
  });

  const receptionistUser = await prisma.user.upsert({
    where: { email: 'receptionist@gestionale.local' },
    update: {},
    create: {
      email: 'receptionist@gestionale.local',
      password: await bcryptjs.hash('ReceptionPass123', 10),
      name: 'Sara Rossi',
      role: 'RECEPTIONIST',
      active: true,
    },
  });

  console.log('✅ Utenti creati:', { admin: adminUser.email, receptionist: receptionistUser.email });

  // Crea servizi demo
  const services = await Promise.all([
    prisma.service.upsert({
      where: { name: 'Manicure Semipermanente' },
      update: {},
      create: {
        name: 'Manicure Semipermanente',
        description: 'Manicure con smalto semipermanente, durata 3-4 settimane',
        duration: 60,
        price: 35.00,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { name: 'Pedicure Completo' },
      update: {},
      create: {
        name: 'Pedicure Completo',
        description: 'Pedicure con pulizia, massaggio e smalto semipermanente',
        duration: 75,
        price: 45.00,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { name: 'Trattamento Viso' },
      update: {},
      create: {
        name: 'Trattamento Viso',
        description: 'Pulizia profonda, peeling, idratazione e massaggio',
        duration: 90,
        price: 60.00,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { name: 'Estensioni Ciglia' },
      update: {},
      create: {
        name: 'Estensioni Ciglia',
        description: 'Applicazione ciglia finte volumetiche, durata 4-6 settimane',
        duration: 120,
        price: 70.00,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { name: 'Massaggio Relax' },
      update: {},
      create: {
        name: 'Massaggio Relax',
        description: 'Massaggio rilassante con oli essenziali',
        duration: 60,
        price: 50.00,
        active: true,
      },
    }),
  ]);

  console.log('✅ Servizi creati:', services.length);

  // Crea clienti demo
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { whatsappNumber: '+393471234567' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Rossi',
        phone: '3471234567',
        whatsappNumber: '+393471234567',
        email: 'maria.rossi@example.com',
        city: 'Milano',
        address: 'Via Roma 123',
        postalCode: '20100',
        notes: 'Cliente frequente, preferisce colori vivaci',
        active: true,
      },
    }),
    prisma.client.upsert({
      where: { whatsappNumber: '+393489876543' },
      update: {},
      create: {
        firstName: 'Anna',
        lastName: 'Bianchi',
        phone: '3489876543',
        whatsappNumber: '+393489876543',
        email: 'anna.bianchi@example.com',
        city: 'Milano',
        address: 'Via Torino 456',
        postalCode: '20123',
        notes: 'Preferisce unghie naturali',
        active: true,
      },
    }),
    prisma.client.upsert({
      where: { whatsappNumber: '+393401112222' },
      update: {},
      create: {
        firstName: 'Giulia',
        lastName: 'Verdi',
        phone: '3401112222',
        whatsappNumber: '+393401112222',
        email: 'giulia.verdi@example.com',
        city: 'Milano',
        address: 'Corso Magenta 789',
        postalCode: '20154',
        notes: 'Cliente VIP - niente allergie',
        active: true,
      },
    }),
    prisma.client.upsert({
      where: { whatsappNumber: '+393333444555' },
      update: {},
      create: {
        firstName: 'Laura',
        lastName: 'Neri',
        phone: '3333444555',
        whatsappNumber: '+393333444555',
        email: 'laura.neri@example.com',
        city: 'Milano',
        address: 'Piazza Duomo 111',
        postalCode: '20122',
        notes: 'Ama i trattamenti rilassanti',
        active: true,
      },
    }),
    prisma.client.upsert({
      where: { whatsappNumber: '+393555666777' },
      update: {},
      create: {
        firstName: 'Francesca',
        lastName: 'Marini',
        phone: '3555666777',
        whatsappNumber: '+393555666777',
        email: 'francesca.marini@example.com',
        city: 'Milano',
        address: 'Via Montenapoleone 222',
        postalCode: '20121',
        notes: 'Professional, appuntamenti puntuali',
        active: true,
      },
    }),
  ]);

  console.log('✅ Clienti creati:', clients.length);

  // Crea appuntamenti demo per questa settimana
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await Promise.all([
    // Domani
    prisma.appointment.upsert({
      where: { id: 'demo_apt_1' },
      update: {},
      create: {
        id: 'demo_apt_1',
        clientId: clients[0].id,
        userId: adminUser.id,
        serviceId: services[0].id, // Manicure
        title: 'Manicure Semipermanente',
        description: 'Primo appuntamento',
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // domani 14:00
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // domani 15:00
        status: 'SCHEDULED',
        price: 35.00,
        notes: 'Colore Rosa Soft',
      },
    }),
    // Dopodomani
    prisma.appointment.upsert({
      where: { id: 'demo_apt_2' },
      update: {},
      create: {
        id: 'demo_apt_2',
        clientId: clients[1].id,
        userId: receptionistUser.id,
        serviceId: services[1].id, // Pedicure
        title: 'Pedicure Completo',
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // tra 2 giorni 10:00
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 11.25 * 60 * 60 * 1000), // tra 2 giorni 11:15
        status: 'CONFIRMED',
        price: 45.00,
        notes: 'Cliente regolare',
      },
    }),
    // Tra 3 giorni
    prisma.appointment.upsert({
      where: { id: 'demo_apt_3' },
      update: {},
      create: {
        id: 'demo_apt_3',
        clientId: clients[2].id,
        userId: adminUser.id,
        serviceId: services[2].id, // Trattamento Viso
        title: 'Trattamento Viso',
        startTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // tra 3 giorni 15:00
        endTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 16.5 * 60 * 60 * 1000), // tra 3 giorni 16:30
        status: 'SCHEDULED',
        price: 60.00,
        notes: 'VIP - massaggio extra',
      },
    }),
    // Tra 5 giorni
    prisma.appointment.upsert({
      where: { id: 'demo_apt_4' },
      update: {},
      create: {
        id: 'demo_apt_4',
        clientId: clients[3].id,
        userId: receptionistUser.id,
        serviceId: services[4].id, // Massaggio Relax
        title: 'Massaggio Relax',
        startTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // tra 5 giorni 16:00
        endTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // tra 5 giorni 17:00
        status: 'SCHEDULED',
        price: 50.00,
        notes: 'Rilassamento totale',
      },
    }),
  ]);

  console.log('✅ Appuntamenti creati:', appointments.length);

  console.log('\n✨ Seed completato con successo!');
  console.log('\n📊 Riepilogo:');
  console.log(`  - Utenti: ${2}`);
  console.log(`  - Servizi: ${services.length}`);
  console.log(`  - Clienti: ${clients.length}`);
  console.log(`  - Appuntamenti: ${appointments.length}`);
  console.log('\n🔐 Credenziali demo:');
  console.log('  Admin: admin@gestionale.local / AdminPass123');
  console.log('  Receptionist: receptionist@gestionale.local / ReceptionPass123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Errore seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
