import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { appointmentSchema } from '@/lib/validation';
import { scheduleAppointmentReminder } from '@/services/notifications';

/**
 * Controlla se l'appuntamento non si sovrappone con altri
 */
async function checkConflict(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string
) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      userId,
      deletedAt: null,
      status: { notIn: ['CANCELLED'] },
      NOT: { id: excludeId },
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  return !!conflict;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const query: any = { deletedAt: null };
    if (clientId) query.clientId = clientId;

    const appointments = await prisma.appointment.findMany({
      where: query,
      include: {
        client: true,
        provider: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Errore GET appuntamenti:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = appointmentSchema.parse(body);

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Controlla conflitti di orario
    if (await checkConflict(data.userId, startTime, endTime)) {
      return NextResponse.json(
        { error: 'Conflitto: esiste un appuntamento sovrapposto' },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: data.clientId,
        userId: data.userId,
        serviceId: data.serviceId,
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        price: data.price,
        notes: data.notes,
      },
      include: {
        client: true,
        provider: true,
        service: true,
      },
    });

    // Programma il promemoria WhatsApp
    await scheduleAppointmentReminder(appointment.id);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Errore POST appuntamento:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Dati non validi' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
