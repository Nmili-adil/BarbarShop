import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const STRIPE_PLANS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID ?? '',
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? '',
  BUSINESS: process.env.STRIPE_BUSINESS_PRICE_ID ?? '',
} as const

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  shopSlug: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { shopSlug: params.shopSlug },
  })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
