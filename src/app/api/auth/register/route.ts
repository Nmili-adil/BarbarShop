import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { shopName, ownerName, email, password } = parsed.data

    // Check if email already exists
    const existing = await prisma.barber.findFirst({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const slug = generateSlug(shopName) + '-' + Math.random().toString(36).slice(2, 6)

    // Create shop + owner barber in a transaction
    const shop = await prisma.$transaction(async (tx) => {
      const newShop = await tx.shop.create({
        data: { name: shopName, slug },
      })

      const ownerBarber = await tx.barber.create({
        data: {
          shopId: newShop.id,
          name: ownerName,
          email,
          role: 'OWNER',
          // Store hash in a temporary field — in production add a proper auth table
          ...(({ passwordHash }) => ({ phone: `hash:${passwordHash}` }))({ passwordHash }),
        },
      })

      // Auto-create default Mon–Sat 9:00–18:00 availability for the owner
      await tx.availability.createMany({
        data: [1, 2, 3, 4, 5, 6].map(day => ({
          barberId: ownerBarber.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
        })),
      })

      return newShop
    })

    return NextResponse.json({ data: { shopId: shop.id, slug: shop.slug } }, { status: 201 })
  } catch (error) {
    console.error('[register]', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
