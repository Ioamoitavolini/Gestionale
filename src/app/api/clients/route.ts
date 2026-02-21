import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { clientSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Errore GET clienti:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = clientSchema.parse(body);

    // Verifica email univocità se fornita
    if (data.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: data.email,
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

    // Verifica numero WhatsApp univocità
    const whatsappExists = await prisma.client.findFirst({
      where: {
        whatsappNumber: data.whatsappNumber,
        deletedAt: null,
      },
    });

    if (whatsappExists) {
      return NextResponse.json(
        { error: 'Numero WhatsApp già in uso' },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber,
        address: data.address || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        dateOfBirth: data.dateOfBirth,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Errore POST cliente:', error);

    if (error instanceof Error && error.message.includes('Zod')) {
      return NextResponse.json(
        { error: 'Dati non validi', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
