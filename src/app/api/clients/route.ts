import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const clients = await prisma.client.findMany({
      where: {
        shopId,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        } : {}),
      },
      include: { _count: { select: { appointments: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: clients })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
