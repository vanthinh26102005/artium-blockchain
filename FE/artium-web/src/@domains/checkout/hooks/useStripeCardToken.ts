import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export async function createStripePaymentMethod(card: {
  number: string
  exp_month: number
  exp_year: number
  cvc: string
}): Promise<string> {
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe failed to load')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await stripe.createPaymentMethod({ type: 'card', card: card as any })

  if (result.error) throw new Error(result.error.message ?? 'Card tokenization failed')
  return result.paymentMethod.id
}
