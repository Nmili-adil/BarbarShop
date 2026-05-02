import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildSeedHolidays } from '@/lib/moroccanHolidays'

/**
 * POST /api/shops/holidays/seed
 * Seeds the current year's fixed Moroccan holidays for the shop.
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const year = new Date().getFullYear()
    const holidays = buildSeedHolidays(shopId, year)

    // createMany with skipDuplicates — but ShopHoliday has no unique key on (shopId, date),
    // so we delete existing fixed holidays for this year first, then re-create.
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)
    await prisma.shopHoliday.deleteMany({
      where: { shopId, recurring: true, date: { gte: yearStart, lte: yearEnd } },
    })
    await prisma.shopHoliday.createMany({ data: holidays })

    return NextResponse.json({ data: { seeded: holidays.length } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
