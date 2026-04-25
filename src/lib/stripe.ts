import Stripe from 'stripe'

// ─── Stripe Singleton ────────────────────────────────────────────────────────

let _stripe: Stripe | null = null

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not configured')
}

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

// Direct export for convenience (may be null if not configured)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || ''

// ─── Stripe Fee Calculator ─────────────────────────────────────
// Stripe charges 2.9% + $0.30 for US cards (international may vary)
export function calculateStripeFee(amount: number): number {
  return Math.round((amount * 0.029 + 0.30) * 100) / 100
}

// ─── Platform Fee (3GSP commission) ────────────────────────────
// This is the fee that 3GSP/GALAXY LLC takes from each transaction
const PLATFORM_FEE_PERCENT = 2.5 // 2.5% platform fee

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100
}

export { PLATFORM_FEE_PERCENT }

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
  const s = getStripe()
  if (!s) return null

  const paymentIntent = await s.paymentIntents.create({
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
  const s = getStripe()
  if (!s) return null

  const customers = await s.customers.list({ email, limit: 1 })
  if (customers.data.length > 0) {
    return customers.data[0]
  }

  return s.customers.create({ email, name })
}

/**
 * Retrieve a PaymentIntent by its ID.
 */
export async function retrievePaymentIntent(
  id: string,
): Promise<Stripe.PaymentIntent | null> {
  const s = getStripe()
  if (!s) return null

  return s.paymentIntents.retrieve(id)
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
  const s = getStripe()
  if (!s) return null

  return s.refunds.create({
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
  const s = getStripe()
  if (!s) {
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

  return s.webhooks.constructEvent(body, sig, webhookSecret)
}

// ─── Publishable Key (client-safe) ───────────────────────────────────────────

/**
 * Returns the Stripe publishable key for client-side initialisation.
 * Returns an empty string when not configured so the UI can show a banner.
 */
export function getPublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || ''
}
