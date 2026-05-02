import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint — no auth required
// GET /api/appointments/[id]/public
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { name: true } },
        barber: {
          select: {
            name: true,
            shop: { select: { name: true, address: true, phone: true, slug: true } },
          },
        },
        service: { select: { name: true, durationMins: true, priceCents: true } },
      },
    })

    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: appt })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
