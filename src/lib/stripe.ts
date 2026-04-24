import Stripe from 'stripe'

// ─── Stripe Singleton ────────────────────────────────────────────────────────

let _stripe: Stripe | null = null

/**
 * Returns the Stripe instance initialized with the server secret key.
 * Returns null if STRIPE_SECRET_KEY is not set (graceful degradation for dev).
 */
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.warn(
      '[stripe] STRIPE_SECRET_KEY is not set. All Stripe operations will be no-ops. ' +
      'Set it in .env to enable payments.'
    )
    return null
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: '2025-04-30.basil',
    typescript: true,
  })

  return _stripe
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Create a Stripe PaymentIntent for a given amount and currency.
 *
 * @param amount  - Amount in the smallest currency unit (e.g. cents for USD, pesos for CLP)
 * @param currency - ISO 4217 currency code (lowercase, e.g. "usd", "clp")
 * @param metadata - Arbitrary key/value pairs attached to the intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string>,
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe()
  if (!stripe) return null

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    // Automatic payment methods — Stripe will handle the UI via PaymentElement
    automatic_payment_methods: { enabled: true },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Create (or retrieve an existing) Stripe Customer record.
 *
 * @param email - Customer email address
 * @param name  - Customer full name
 */
export async function createCustomer(
  email: string,
  name: string,
): Promise<Stripe.Customer | null> {
  const stripe = getStripe()
  if (!stripe) return null

  const customers = await stripe.customers.list({ email, limit: 1 })
  if (customers.data.length > 0) {
    return customers.data[0]
  }

  return stripe.customers.create({ email, name })
}

/**
 * Retrieve a PaymentIntent by its ID.
 */
export async function retrievePaymentIntent(
  id: string,
): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripe()
  if (!stripe) return null

  return stripe.paymentIntents.retrieve(id)
}

/**
 * Create a refund for a given PaymentIntent.
 *
 * @param paymentIntentId - The Stripe PaymentIntent ID to refund
 * @param amount          - Optional partial amount (smallest unit). Omit for full refund.
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
): Promise<Stripe.Refund | null> {
  const stripe = getStripe()
  if (!stripe) return null

  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  })
}

/**
 * Verify a Stripe webhook signature.
 *
 * @param body     - Raw request body as string
 * @param sig      - Value of the `stripe-signature` header
 */
export function verifyWebhookSignature(
  body: string,
  sig: string,
): Stripe.Event {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error(
      '[stripe] Cannot verify webhook: STRIPE_SECRET_KEY is not configured.',
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error(
      '[stripe] STRIPE_WEBHOOK_SECRET is not configured. Webhook verification failed.',
    )
  }

  return stripe.webhooks.constructEvent(body, sig, webhookSecret)
}

// ─── Publishable Key (client-safe) ───────────────────────────────────────────

/**
 * Returns the Stripe publishable key for client-side initialisation.
 * Returns an empty string when not configured so the UI can show a banner.
 */
export function getPublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || ''
}
