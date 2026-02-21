import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serviceSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Errore GET servizi:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        active: data.active,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Errore POST servizio:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Dati non validi' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
