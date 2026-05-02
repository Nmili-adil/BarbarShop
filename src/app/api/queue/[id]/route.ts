import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppQueueNotification } from '@/lib/whatsapp'

/** PATCH /api/queue/[id] — update walk-in status (call next, done, cancel) */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { status } = body as { status: 'IN_PROGRESS' | 'DONE' | 'CANCELLED' }

    const walkIn = await prisma.walkIn.update({
      where: { id: params.id },
      data: {
        status,
        calledAt: status === 'IN_PROGRESS' ? new Date() : undefined,
        doneAt: status === 'DONE' ? new Date() : undefined,
      },
    })

    // When called to IN_PROGRESS, notify the client who is now next
    if (status === 'IN_PROGRESS' && walkIn.clientPhone) {
      const shopId = walkIn.shopId
      const waiting = await prisma.walkIn.findMany({
        where: { shopId, status: 'WAITING' },
        orderBy: { position: 'asc' },
        take: 1,
      })
      const nextWalkIn = waiting[0]
      if (nextWalkIn?.clientPhone) {
        const shop = await prisma.shop.findUnique({ where: { id: shopId } })
        sendWhatsAppQueueNotification({
          clientPhone: nextWalkIn.clientPhone,
          clientName: nextWalkIn.clientName,
          shopName: shop?.name ?? 'Barbershop',
          position: 1,
          estimatedWaitMins: 5,
        }).catch((err) => console.warn('[whatsapp] Queue notify failed:', err))
      }
    }

    return NextResponse.json({ data: walkIn })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** DELETE /api/queue/[id] — remove from queue */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.walkIn.update({ where: { id: params.id }, data: { status: 'CANCELLED' } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
