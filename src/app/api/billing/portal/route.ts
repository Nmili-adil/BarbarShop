import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop' }, { status: 400 })

    const subscription = await prisma.subscription.findUnique({ where: { shopId } })
    if (!subscription) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

    const portalSession = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[billing portal]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
