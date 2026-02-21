import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
  price: z.number().positive().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          where: { deletedAt: null },
          select: { id: true, startTime: true, clientId: true },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Errore GET servizio:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateServiceSchema.parse(body);

    const serviceExists = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!serviceExists) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Errore PATCH servizio:', error);

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
    const serviceExists = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!serviceExists) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    // Soft delete: disattiva il servizio (non lo elimina completamente per mantenere la storia)
    const deactivatedService = await prisma.service.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json(
      { message: 'Servizio disattivato', service: deactivatedService },
      { status: 200 }
    );
  } catch (error) {
    console.error('Errore DELETE servizio:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
