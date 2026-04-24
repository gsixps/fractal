---
Task ID: 6
Agent: Stripe Integration Scaffolding
Task: Create complete Stripe payment scaffolding for production readiness

Work Log:
- Installed packages: stripe@22.1.0, @stripe/stripe-js@9.3.1, @stripe/react-stripe-js@6.2.0
- Created src/lib/stripe.ts — server-side Stripe singleton with helpers:
  - getStripe() — lazy init with STRIPE_SECRET_KEY, returns null if not configured
  - createPaymentIntent(amount, currency, metadata) — creates PaymentIntent
  - createCustomer(email, name) — creates/retrieves Stripe customer
  - retrievePaymentIntent(id) — fetches PI status
  - createRefund(paymentIntentId, amount?) — full or partial refund
  - verifyWebhookSignature(body, sig) — validates webhook events
  - getPublishableKey() — returns client-side key
- Created /api/payments/create-intent/route.ts:
  - POST endpoint, requires auth via requireAuth()
  - Validates body (amount, currency, assetId, fractions)
  - Checks asset exists, is active, has enough available fractions
  - Creates Stripe PaymentIntent with metadata (assetId, userId, fractions)
  - Creates pending Investment record with stripePaymentId
  - Returns { clientSecret, paymentIntentId, investmentId }
- Created /api/payments/webhook/route.ts:
  - POST endpoint, verifies Stripe webhook signature
  - Handles payment_intent.succeeded: marks Investment completed, decreases availableFractions, updates fundedPercentage, updates user totalInvested, creates Transaction record, creates Notification
  - Handles payment_intent.payment_failed: marks Investment failed, creates failed Transaction
  - Handles charge.refunded: marks Investment refunded, restores fractions, creates refund Transaction, creates Notification
  - All handlers are idempotent (skip if already processed)
- Created /api/payments/confirm/route.ts:
  - POST endpoint, requires auth
  - Retrieves PaymentIntent from Stripe, verifies status
  - Ensures DB consistency with webhook (idempotent updates)
  - Handles succeeded, processing, and failed statuses
  - Returns investment details with success/error status
- Created src/components/gsp/shared/StripeProvider.tsx:
  - Client component using useMemo to load Stripe.js lazily
  - Wraps children in Elements provider with themed appearance
  - Shows config error banner if NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing
  - Shows loading spinner while initializing
- Created src/components/gsp/shared/PaymentForm.tsx:
  - Uses PaymentElement (tabs layout) from @stripe/react-stripe-js
  - submit handler calls stripe.confirmPayment with redirect:'if_required'
  - On success: calls /api/payments/confirm, invokes onSuccess callback
  - States: idle, processing (with Loader2 spinner), success (CheckCircle2), error (AlertCircle)
  - Security footer with CreditCard and Lock icons
- Created src/components/gsp/shared/InvestmentDialog.tsx:
  - 3-step dialog flow: review → payment → success
  - Review step: asset preview image, fraction selector (buttons + Slider), investment summary (price, yield, dividends), investor info
  - Payment step: wraps PaymentForm in StripeProvider
  - Success step: congratulations with PartyPopper icon, investment summary, "Ver Mi Portafolio" action
  - Props: open, onOpenChange, asset (minimal type), user
  - Resets all state on close
- Created .env.example with all required variables:
  - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
  - DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, SMTP settings

Stage Summary:
- All 7 files created and passing ESLint with zero errors
- Complete Stripe payment flow: create intent → client confirm → webhook reconcile → DB update
- Investment dialog supports 1000-fraction model (pricePerFraction × quantity)
- Graceful degradation when keys not configured (server returns 503, client shows banner)
- Idempotent handlers prevent double-processing
- Ready for production: add keys to .env and configure Stripe webhook endpoint
