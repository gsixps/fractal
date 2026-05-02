'use client'

import { useState, useCallback } from 'react'
import {
  User,
  FileText,
  MapPin,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Upload,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'personalInfo', icon: User },
  { key: 'idVerification', icon: FileText },
  { key: 'addressProof', icon: MapPin },
] as const

type StepKey = (typeof STEPS)[number]['key']

// ─── KYC Status Card ──────────────────────────────────────────────────────────

function KYCStatusCard({ status }: { status: string }) {
  const t = useT()

  if (status === 'verified') {
    return (
      <Card className="border-border/40">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
            <ShieldCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="gsp-serif text-xl font-semibold">{t('kyc.verified')}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground font-light">
            Tu identidad ha sido verificada exitosamente. Tienes acceso completo a todas las funcionalidades de inversión.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'submitted' || status === 'pending') {
    return (
      <Card className="border-border/40">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50">
            <Clock className="size-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="gsp-serif text-xl font-semibold">{t('kyc.pending')}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground font-light">
            {t('kyc.pendingDesc')}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'rejected') {
    return (
      <Card className="border-red-200/60 dark:border-red-800/40">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="gsp-serif text-xl font-semibold">{t('kyc.rejected')}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground font-light">
            Tu verificación fue rechazada. Por favor, revisa la información y vuelve a enviar los documentos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return null
}

// ─── File Upload Component ────────────────────────────────────────────────────

function FileUploadBox({
  label,
  preview,
  onFileChange,
  onClear,
}: {
  label: string
  preview: string | null
  onFileChange: (file: File) => void
  onClear: () => void
}) {
  const t = useT()

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {preview ? (
        <div className="relative group">
          <div className="overflow-hidden rounded-xl border border-border/50 h-40 w-full">
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
          <Badge className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px]">
            <Check className="mr-1 size-3" />
            {t('common.save')}
          </Badge>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-muted/30 h-40 w-full transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{t('common.upload')}</span>
          <span className="text-[10px] text-muted-foreground/70">JPG, PNG — Max 5MB</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileChange(file)
            }}
          />
        </label>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KYCPage() {
  const t = useT()
  const user = useAppStore((s) => s.user)
  const navigate = useAppStore((s) => s.navigate)
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [nationality, setNationality] = useState('')
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')

  // Step 2: Documents
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null)
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null)
  const [idBackFile, setIdBackFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)

  // Step 3: Address
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [zipCode, setZipCode] = useState('')

  const handleFileChange = useCallback(
    (field: 'front' | 'back' | 'selfie') => (file: File) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        if (field === 'front') {
          setIdFrontPreview(dataUrl)
          setIdFrontFile(file)
        } else if (field === 'back') {
          setIdBackPreview(dataUrl)
          setIdBackFile(file)
        } else {
          setSelfiePreview(dataUrl)
          setSelfieFile(file)
        }
      }
      reader.readAsDataURL(file)
    },
    []
  )

  const canProceed = () => {
    if (currentStep === 0) {
      return firstName && lastName && birthDate && nationality && idType && idNumber
    }
    if (currentStep === 1) {
      return idFrontFile && idBackFile && selfieFile
    }
    if (currentStep === 2) {
      return address && city && country && zipCode
    }
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('birthDate', birthDate)
      formData.append('nationality', nationality)
      formData.append('idType', idType)
      formData.append('idNumber', idNumber)
      if (idFrontFile) formData.append('idFront', idFrontFile)
      if (idBackFile) formData.append('idBack', idBackFile)
      if (selfieFile) formData.append('selfie', selfieFile)
      formData.append('address', address)
      formData.append('city', city)
      formData.append('country', country)
      formData.append('zipCode', zipCode)

      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast({
          title: t('common.success'),
          description: 'Tu verificación ha sido enviada correctamente. Recibirás una notificación cuando esté lista.',
        })
        navigate('dashboard')
      } else {
        const data = await res.json()
        toast({
          title: t('common.error'),
          description: data.error || 'No se pudo enviar la verificación. Intenta de nuevo.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: t('common.error'),
        description: 'Ocurrió un error inesperado. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const kycStatus = user?.kycStatus

  // Show status card if not pending (unverified) state
  if (kycStatus && kycStatus !== 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
              {t('kyc.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-light">
              {t('kyc.subtitle')}
            </p>
          </div>
          <KYCStatusCard status={kycStatus} />
          {kycStatus === 'rejected' && (
            <div className="mt-4">
              <Button
                className="w-full gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                onClick={() => {
                  setCurrentStep(0)
                }}
              >
                {t('kyc.resubmit')}
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
            {t('kyc.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-light">
            {t('kyc.subtitle')}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon
              const isActive = idx === currentStep
              const isCompleted = idx < currentStep
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompleted || idx === currentStep) setCurrentStep(idx)
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 cursor-pointer group',
                      !isCompleted && !isActive && 'opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full transition-all duration-200',
                        isActive
                          ? 'gsp-gradient text-white shadow-lg shadow-emerald-500/25'
                          : isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="size-4.5" />
                      ) : (
                        <StepIcon className="size-4.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-medium whitespace-nowrap',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {t(`kyc.${step.key}`)}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1 transition-colors duration-200',
                        idx < currentStep ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-border/50'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-border/40">
          <CardContent className="p-5 sm:p-6">
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    {t('kyc.personalInfo')}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">
                    Ingresa tus datos personales tal como aparecen en tu documento de identidad.
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kyc-firstName">{t('kyc.firstName')}</Label>
                    <Input
                      id="kyc-firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Juan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kyc-lastName">{t('kyc.lastName')}</Label>
                    <Input
                      id="kyc-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kyc-birthDate">{t('kyc.birthDate')}</Label>
                    <Input
                      id="kyc-birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kyc-nationality">{t('kyc.nationality')}</Label>
                    <Input
                      id="kyc-nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="Chilena"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('kyc.idType')}</Label>
                    <Select value={idType} onValueChange={setIdType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('kyc.idType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="cedula">Cédula de Identidad</SelectItem>
                        <SelectItem value="driver_license">Licencia de Conducir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kyc-idNumber">{t('kyc.idNumber')}</Label>
                    <Input
                      id="kyc-idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="12345678"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Document Upload */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    {t('kyc.idVerification')}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">
                    Sube fotos claras de tu documento de identidad y una selfie sosteniéndolo.
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FileUploadBox
                    label={t('kyc.idFront')}
                    preview={idFrontPreview}
                    onFileChange={handleFileChange('front')}
                    onClear={() => {
                      setIdFrontPreview(null)
                      setIdFrontFile(null)
                    }}
                  />
                  <FileUploadBox
                    label={t('kyc.idBack')}
                    preview={idBackPreview}
                    onFileChange={handleFileChange('back')}
                    onClear={() => {
                      setIdBackPreview(null)
                      setIdBackFile(null)
                    }}
                  />
                  <div className="sm:col-span-2">
                    <FileUploadBox
                      label={t('kyc.selfie')}
                      preview={selfiePreview}
                      onFileChange={handleFileChange('selfie')}
                      onClear={() => {
                        setSelfiePreview(null)
                        setSelfieFile(null)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address Proof */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="size-5 text-primary" />
                    {t('kyc.addressProof')}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">
                    Ingresa tu dirección de residencia actual.
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="kyc-address">{t('kyc.address')}</Label>
                    <Input
                      id="kyc-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Av. Providencia 1234, Oficina 56"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kyc-city">{t('kyc.city')}</Label>
                    <Input
                      id="kyc-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Santiago"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kyc-country">{t('kyc.country')}</Label>
                    <Input
                      id="kyc-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Chile"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 sm:max-w-[200px]">
                    <Label htmlFor="kyc-zipCode">{t('kyc.zipCode')}</Label>
                    <Input
                      id="kyc-zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="7500000"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep > 0) setCurrentStep((s) => s - 1)
              else navigate('dashboard')
            }}
            className="gap-2 border-border/50 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
            {currentStep > 0 ? t('common.previous') : t('common.back')}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-2 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
            >
              {t('common.next')}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {t('kyc.submit')}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
