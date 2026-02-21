import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validazione per aggiornamento cliente
const updateClientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  whatsappNumber: z.string().regex(/^\+\d{1,3}\d{1,14}$/, 'Formato E.164 richiesto').optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          where: { deletedAt: null },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    if (client.deletedAt) {
      return NextResponse.json({ error: 'Cliente eliminato' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Errore GET cliente:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateClientSchema.parse(body);

    const clientExists = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!clientExists || clientExists.deletedAt) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    // Se l'email viene aggiornata, verificare che non sia in uso
    if (data.email && data.email !== clientExists.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: data.email,
          NOT: { id: params.id },
          deletedAt: null,
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email già in uso' },
          { status: 409 }
        );
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Errore PATCH cliente:', error);

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
    const clientExists = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!clientExists || clientExists.deletedAt) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    // Soft delete: marca come eliminato
    const deletedClient = await prisma.client.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: 'Cliente eliminato', deletedAt: deletedClient.deletedAt },
      { status: 200 }
    );
  } catch (error) {
    console.error('Errore DELETE cliente:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
