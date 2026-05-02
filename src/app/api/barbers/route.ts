import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBarberSchema } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const barbers = await prisma.barber.findMany({
      where: { shopId, isActive: true },
      include: { services: true, _count: { select: { availability: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: barbers })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const body = await req.json()
    const parsed = createBarberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // Create barber + default Mon–Sat 9:00–18:00 availability in one transaction
    const barber = await prisma.$transaction(async (tx) => {
      const newBarber = await tx.barber.create({
        data: { ...parsed.data, shopId },
      })
      // Mon=1 … Sat=6
      const defaultDays = [1, 2, 3, 4, 5, 6]
      await tx.availability.createMany({
        data: defaultDays.map(day => ({
          barberId: newBarber.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
        })),
      })
      return newBarber
    })
    return NextResponse.json({ data: barber }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error && err.message.includes('Unique constraint') ? 'Email already in use' : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
