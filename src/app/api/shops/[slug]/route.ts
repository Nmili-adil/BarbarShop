import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public — no auth needed (used by booking page)
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug: params.slug },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        barbers: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

    return NextResponse.json({ data: shop })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
