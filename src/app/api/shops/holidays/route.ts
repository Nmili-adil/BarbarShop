import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/shops/holidays — list shop holidays */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const holidays = await prisma.shopHoliday.findMany({
      where: { shopId },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ data: holidays })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** POST /api/shops/holidays — add a holiday */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const body = await req.json()
    const { name, nameAr, nameFr, date, recurring } = body
    if (!name || !date) return NextResponse.json({ error: 'name and date are required' }, { status: 400 })

    const holiday = await prisma.shopHoliday.create({
      data: { shopId, name, nameAr: nameAr ?? null, nameFr: nameFr ?? null, date: new Date(date), recurring: recurring ?? true },
    })
    return NextResponse.json({ data: holiday }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** DELETE /api/shops/holidays?id=xxx — remove a holiday */
export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.shopHoliday.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
