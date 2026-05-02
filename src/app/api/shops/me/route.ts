import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateShopSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { subscription: true },
    })

    return NextResponse.json({ data: shop })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const body = await req.json()
    const parsed = updateShopSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // Check slug uniqueness if changing
    if (parsed.data.slug) {
      const existing = await prisma.shop.findFirst({
        where: { slug: parsed.data.slug, id: { not: shopId } },
      })
      if (existing) {
        return NextResponse.json({ error: 'This URL slug is already taken' }, { status: 400 })
      }
    }

    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: parsed.data,
      include: { subscription: true },
    })

    return NextResponse.json({ data: shop })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
