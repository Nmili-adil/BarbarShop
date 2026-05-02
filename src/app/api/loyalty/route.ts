import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/loyalty?clientId=xxx — client loyalty balance & history */
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        loyaltyPoints: true,
        loyaltyTransactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: client })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** POST /api/loyalty/redeem — redeem points for a client */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { clientId, points, description } = body as {
      clientId: string
      points: number
      description?: string
    }

    if (!clientId || !points || points <= 0) {
      return NextResponse.json({ error: 'clientId and positive points are required' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    if (client.loyaltyPoints < points) {
      return NextResponse.json({ error: 'Insufficient loyalty points' }, { status: 422 })
    }

    const [updated] = await prisma.$transaction([
      prisma.client.update({
        where: { id: clientId },
        data: { loyaltyPoints: { decrement: points } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          clientId,
          points: -points,
          type: 'REDEEM',
          description: description ?? 'Points redeemed',
        },
      }),
    ])

    return NextResponse.json({ data: { loyaltyPoints: updated.loyaltyPoints } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
