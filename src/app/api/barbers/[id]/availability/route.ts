import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const scheduleSchema = z.array(
  z.object({
    dayOfWeek: z.number().min(0).max(6),
    isActive: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  })
)

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const availability = await prisma.availability.findMany({
      where: { barberId: params.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return NextResponse.json({ data: availability })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const shopId = (session.user as { shopId?: string }).shopId
    const barber = await prisma.barber.findUnique({
      where: { id: params.id },
    })
    
    if (barber?.shopId !== shopId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = scheduleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Clear old availability
      await tx.availability.deleteMany({
        where: { barberId: params.id },
      })
      
      // Insert new ones
      const activeDays = parsed.data.filter(d => d.isActive)
      for (const day of activeDays) {
        await tx.availability.create({
          data: {
            barberId: params.id,
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/barbers/[id]/availability]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
