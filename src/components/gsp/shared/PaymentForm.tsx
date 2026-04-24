'use client'

import { useState } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'

interface PaymentFormProps {
  /** Called after successful payment confirmation */
  onSuccess?: (paymentIntentId: string) => void
  /** Called on payment failure */
  onError?: (message: string) => void
  /** Called when the user cancels or closes the form */
  onCancel?: () => void
  /** Optional submit label */
  submitLabel?: string
  /** Optional className for the submit button */
  className?: string
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error'

export function PaymentForm({
  onSuccess,
  onError,
  submitLabel = 'Pagar Ahora',
  className,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isProcessing = status === 'processing'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    if (isProcessing || isSuccess) return

    setStatus('processing')
    setErrorMessage(null)

    // Confirm the payment with Stripe
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return to the same page — PaymentElement handles redirects automatically
        return_url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      // Prevent redirect — we handle the result in the UI
      redirect: 'if_required',
    })

    if (confirmError) {
      // Payment failed or was cancelled
      const msg = confirmError.message || 'Error al procesar el pago'
      setStatus('error')
      setErrorMessage(msg)
      onError?.(msg)
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment confirmed on the client side — notify our backend
      setStatus('success')

      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          console.warn('[PaymentForm] /confirm returned', res.status, data)
          // Payment succeeded on Stripe but confirm endpoint had an issue.
          // The webhook will eventually reconcile the DB.
        }
      } catch (err) {
        console.warn('[PaymentForm] Failed to call /confirm:', err)
        // Same as above — webhook handles reconciliation.
      }

      onSuccess?.(paymentIntent.id)
    } else if (paymentIntent?.status === 'processing') {
      setStatus('idle')
      setErrorMessage('El pago está siendo procesado. Te notificaremos cuando se complete.')
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold">Pago exitoso</h3>
        <p className="text-sm text-muted-foreground font-light">
          Tu inversión ha sido procesada correctamente. Recibirás una confirmación por correo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Stripe PaymentElement — renders card inputs, Apple Pay, Google Pay, etc. */}
        <div className="rounded-xl border border-border/40 p-3">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {/* Error message */}
        {isError && errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando pago…
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" />
          <span>Pago seguro con Stripe</span>
          <span className="text-muted-foreground/60">•</span>
          <Lock className="h-3 w-3" />
          <span>Encriptación SSL</span>
        </div>
      </div>
    </form>
  )
}
