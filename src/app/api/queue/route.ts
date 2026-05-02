import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/queue — list today's queue for the shop */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const queue = await prisma.walkIn.findMany({
      where: {
        shopId,
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
      orderBy: { position: 'asc' },
      include: { client: true },
    })
    return NextResponse.json({ data: queue })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** POST /api/queue — client joins the queue (public) */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { shopId, clientName, clientPhone } = body
    if (!shopId || !clientName) {
      return NextResponse.json({ error: 'shopId and clientName are required' }, { status: 400 })
    }

    // Get current max position
    const last = await prisma.walkIn.findFirst({
      where: { shopId, status: { in: ['WAITING', 'IN_PROGRESS'] } },
      orderBy: { position: 'desc' },
    })
    const position = (last?.position ?? 0) + 1

    // Link to existing client if phone matches
    let clientId: string | undefined
    if (clientPhone) {
      const existing = await prisma.client.findFirst({ where: { shopId, phone: clientPhone } })
      if (existing) clientId = existing.id
    }

    const walkIn = await prisma.walkIn.create({
      data: {
        shopId,
        clientName,
        clientPhone: clientPhone ?? null,
        clientId: clientId ?? null,
        position,
        status: 'WAITING',
      },
    })

    return NextResponse.json({ data: { id: walkIn.id, position, estimatedWaitMins: position * 20 } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
