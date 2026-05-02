import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createServiceSchema } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const services = await prisma.service.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: services })
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
    const parsed = createServiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { barberIds, ...rest } = parsed.data
    const service = await prisma.service.create({
      data: {
        ...rest,
        shopId,
        barbers: barberIds?.length
          ? { connect: barberIds.map(id => ({ id })) }
          : undefined,
      },
    })

    return NextResponse.json({ data: service }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
