import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateAppointmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  price: z.number().positive().optional(),
  notes: z.string().optional(),
});

async function checkConflict(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeId: string
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        provider: true,
        service: true,
        notifications: true,
      },
    });

    if (!appointment || appointment.deletedAt) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Errore GET appuntamento:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateAppointmentSchema.parse(body);

    const appointmentExists = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointmentExists || appointmentExists.deletedAt) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    // Validazione orari
    const startTime = data.startTime ? new Date(data.startTime) : appointmentExists.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : appointmentExists.endTime;

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'L\'orario di fine deve essere dopo l\'inizio' },
        { status: 400 }
      );
    }

    // Controllo conflitti se gli orari sono stati modificati
    if (data.startTime || data.endTime) {
      if (await checkConflict(appointmentExists.userId, startTime, endTime, params.id)) {
        return NextResponse.json(
          { error: 'Conflitto: esiste un appuntamento sovrapposto' },
          { status: 409 }
        );
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...data,
        startTime: data.startTime ? startTime : undefined,
        endTime: data.endTime ? endTime : undefined,
      },
      include: {
        client: true,
        provider: true,
        service: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Errore PATCH appuntamento:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentExists = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointmentExists || appointmentExists.deletedAt) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    // Soft delete: marca come eliminato
    const deletedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: 'Appuntamento eliminato', deletedAt: deletedAppointment.deletedAt },
      { status: 200 }
    );
  } catch (error) {
    console.error('Errore DELETE appuntamento:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
