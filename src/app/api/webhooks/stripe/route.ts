import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch (err) {
    console.error('[stripe webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  async function findSubscriptionByCustomer(customerId: string) {
    return prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } })
  }

  async function mapStatus(stripeStatus: string): Promise<'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'> {
    const map: Record<string, 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'> = {
      trialing: 'TRIALING',
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELLED',
      cancelled: 'CANCELLED',
      unpaid: 'PAST_DUE',
    }
    return map[stripeStatus] ?? 'ACTIVE'
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const existing = await findSubscriptionByCustomer(customerId)
        if (!existing) break

        const priceId = sub.items.data[0]?.price?.id ?? null
        const status = await mapStatus(sub.status)

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            status,
            currentPeriodEnd: new Date((sub as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000),
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'CANCELLED', stripeSubscriptionId: null },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (!customerId) break
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'PAST_DUE' },
        })
        console.warn(`[stripe] Payment failed for customer ${customerId}`)
        break
      }
    }
  } catch (err) {
    console.error('[stripe webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
