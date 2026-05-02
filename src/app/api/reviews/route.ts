import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** GET /api/reviews?shopId=xxx — public reviews for a shop */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get('shopId')
    if (!shopId) return NextResponse.json({ error: 'shopId required' }, { status: 400 })

    const reviews = await prisma.review.findMany({
      where: {
        isPublic: true,
        appointment: { barber: { shopId } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

    return NextResponse.json({ data: { reviews, averageRating: avg, total: reviews.length } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
