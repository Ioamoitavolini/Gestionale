import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {
      deletedAt: null,
      status: 'COMPLETED',
    };

    if (startDate && endDate) {
      query.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Appuntamenti completati con dettagli
    const appointments = await prisma.appointment.findMany({
      where: query,
      include: {
        client: true,
        service: true,
        provider: true,
      },
    });

    // Calcoli
    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    const totalAppointments = appointments.length;

    // Revenue per servizio
    const revenueByService: Record<string, any> = {};
    appointments.forEach(apt => {
      if (!revenueByService[apt.service.name]) {
        revenueByService[apt.service.name] = {
          count: 0,
          revenue: 0,
        };
      }
      revenueByService[apt.service.name].count += 1;
      revenueByService[apt.service.name].revenue += apt.price || 0;
    });

    // Clienti unici
    const uniqueClients = new Set(appointments.map(a => a.clientId)).size;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalAppointments,
        uniqueClients,
        averageRevenue: totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
      },
      revenueByService,
      appointments,
    });
  } catch (error) {
    console.error('Errore reportistica:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
