'use client'

import { type ReactNode, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

/**
 * Publishable key — must be set in NEXT_PUBLIC env.
 */
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

interface StripeProviderProps {
  clientSecret: string
  children: ReactNode
}

/**
 * Wraps children in the Stripe <Elements> provider.
 * Lazy-loads the Stripe.js SDK when a clientSecret is provided.
 *
 * Usage:
 *   <StripeProvider clientSecret="pi_xxx_secret_yyy">
 *     <PaymentForm />
 *   </StripeProvider>
 */
export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  // Memoize the stripe promise — loadStripe is idempotent and safe for render
  const stripePromise = useMemo(() => {
    if (!clientSecret || !STRIPE_PK) return null
    return loadStripe(STRIPE_PK)
  }, [clientSecret])

  // Config error: no publishable key set
  if (!STRIPE_PK && clientSecret) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
        Stripe no está configurado. Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    )
  }

  // Loading state
  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'inherit',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
        },
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
