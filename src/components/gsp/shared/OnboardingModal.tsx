'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Rocket,
  ArrowRight,
  Check,
} from 'lucide-react'

const ONBOARDING_KEY = 'gsp-onboarding-complete'

const steps = [
  {
    icon: Sparkles,
    titleEs: 'Bienvenido a GALAXY',
    titleEn: 'Welcome to GALAXY',
    descEs: 'Tu puerta de entrada a la inversión inmobiliaria fraccionada en Latinoamérica. Comienza desde $100 USD.',
    descEn: 'Your gateway to fractional real estate investment in Latin America. Start from just $100 USD.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: TrendingUp,
    titleEs: 'Invierte en activos fraccionados',
    titleEn: 'Invest in fractional assets',
    descEs: 'Accede a propiedades inmobiliarias premium, data centers, energía solar y más. Cada activo está verificado y auditado por nuestro equipo.',
    descEn: 'Access premium real estate, data centers, solar energy and more. Every asset is verified and audited by our team.',
    gradient: 'from-emerald-600 to-cyan-600',
  },
  {
    icon: DollarSign,
    titleEs: 'Gana rendimientos pasivos',
    titleEn: 'Earn passive returns',
    descEs: 'Recibe dividendos mensuales de arriendos y plusvalía. Nuestra comisión es solo del 3%, la más baja del mercado.',
    descEn: 'Receive monthly dividends from rents and appreciation. Our fee is only 3%, the lowest in the market.',
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Rocket,
    titleEs: 'Comienza tu viaje',
    titleEn: 'Start your journey',
    descEs: 'Explora nuestro marketplace, elige tus activos favoritos y comienza a invertir hoy mismo.',
    descEn: 'Explore our marketplace, pick your favorite assets, and start investing today.',
    gradient: 'from-emerald-500 to-green-600',
  },
]

export function OnboardingModal() {
  const t = useT()
  const language = useAppStore((s) => s.language)
  const navigate = useAppStore((s) => s.navigate)
  const user = useAppStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const completed = localStorage.getItem(ONBOARDING_KEY)
      if (!completed) {
        // Small delay to let the app settle before showing the modal
        const timer = setTimeout(() => setOpen(true), 800)
        return () => clearTimeout(timer)
      }
    }
  }, [user])

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    }
    setOpen(false)
    navigate('marketplace')
  }, [navigate])

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection('forward')
      setCurrentStep((s) => s + 1)
    } else {
      completeOnboarding()
    }
  }, [currentStep, completeOnboarding])

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection('back')
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const skip = useCallback(() => {
    completeOnboarding()
  }, [completeOnboarding])

  const step = steps[currentStep]
  const Icon = step.icon
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) skip() }}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-border/50">
        {/* Gradient top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all duration-500 ease-out',
                  i === currentStep
                    ? 'w-8 bg-primary'
                    : i < currentStep
                      ? 'w-2 bg-primary/60'
                      : 'w-2 bg-muted-foreground/20'
                )}
              />
            ))}
          </div>

          {/* Icon + Content */}
          <div className={cn(
            'flex flex-col items-center text-center animate-gsp-fade-in',
          )} key={`${currentStep}-${direction}`}>
            {/* Icon */}
            <div className={cn(
              'flex items-center justify-center size-16 sm:size-20 rounded-2xl mb-5 shadow-lg transition-all duration-300',
              `bg-gradient-to-br ${step.gradient} text-white shadow-emerald-500/20`
            )}>
              <Icon className="size-8 sm:size-9" />
            </div>

            <DialogHeader className="space-y-3 mb-4">
              <DialogTitle className="gsp-serif text-2xl sm:text-3xl tracking-tight">
                {language === 'es' ? step.titleEs : step.titleEn}
              </DialogTitle>
              <DialogDescription className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {language === 'es' ? step.descEs : step.descEn}
              </DialogDescription>
            </DialogHeader>

            {/* Feature highlights for step 2 and 3 */}
            {currentStep === 1 && (
              <div className="w-full max-w-xs mx-auto mt-2 space-y-2.5 text-left">
                {[
                  language === 'es' ? 'Propiedades verificadas y auditadas' : 'Verified & audited properties',
                  language === 'es' ? 'Desde $100 USD mínimo' : 'From $100 USD minimum',
                  language === 'es' ? 'Diversifica tu portafolio fácilmente' : 'Diversify your portfolio easily',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="w-full max-w-xs mx-auto mt-2 space-y-2.5 text-left">
                {[
                  language === 'es' ? 'Dividendos mensuales por arriendos' : 'Monthly rental dividends',
                  language === 'es' ? 'Solo 3% de comisión' : 'Only 3% platform fee',
                  language === 'es' ? 'Salida Express en 48 horas' : 'Express exit in 48 hours',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex items-center justify-between gap-3 mt-2">
          <div className="flex-1">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goPrev}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'es' ? 'Anterior' : 'Previous'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLast && (
              <Button
                variant="ghost"
                size="sm"
                onClick={skip}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'es' ? 'Saltar' : 'Skip'}
              </Button>
            )}

            <Button
              onClick={goNext}
              className={cn(
                'gap-2 transition-all duration-200 shadow-md',
                isLast
                  ? 'gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/25 px-6'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              )}
              size={isLast ? 'lg' : 'default'}
            >
              {isLast
                ? (language === 'es' ? 'Explorar Marketplace' : 'Explore Marketplace')
                : (language === 'es' ? 'Siguiente' : 'Next')
              }
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
