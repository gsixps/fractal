'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Loader2,
} from 'lucide-react'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const { setUser } = useAppStore()
  const { toast } = useToast()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Error de inicio de sesión',
          description: 'Email o contraseña incorrectos. Verifica tus credenciales.',
          variant: 'destructive',
        })
      } else if (result?.ok) {
        // Fetch session data to get user info
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()

        if (session?.user) {
          setUser({
            id: (session.user as Record<string, unknown>).id as string,
            name: session.user.name || '',
            email: session.user.email || '',
            role: (session.user as Record<string, unknown>).role as 'investor' | 'admin' | 'superadmin',
            kycStatus: (session.user as Record<string, unknown>).kycStatus as 'pending' | 'submitted' | 'verified' | 'rejected',
            avatarUrl: session.user.image as string | undefined,
          })

          toast({
            title: '¡Bienvenido de vuelta!',
            description: `Hola ${session.user.name || 'Inversionista'}, tu sesión ha sido iniciada correctamente.`,
          })
        }
      }
    } catch {
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Error al crear cuenta',
          description: data.error || 'No se pudo crear la cuenta.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: '¡Cuenta creada exitosamente!',
          description: 'Ahora puedes iniciar sesión con tus credenciales.',
        })
        resetForm()
        setMode('login')
      }
    } catch {
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al crear la cuenta. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    resetForm()
    setMode(mode === 'login' ? 'register' : 'login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-gsp-slide-up">
        {/* Logo & Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl gsp-gradient shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white tracking-tight">G</span>
          </div>
          <h1 className="gsp-serif text-3xl font-bold tracking-tight">
            <span className="gsp-gradient-text">GSP</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inversión Inmobiliaria Fraccionada
          </p>
        </div>

        {/* Card */}
        <Card className="border-border/50 shadow-xl shadow-black/[0.03] backdrop-blur-sm">
          <div className="space-y-1 pb-4 text-center px-6 pt-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Ingresa tus credenciales para acceder a tu portafolio'
                : 'Regístrate para comenzar a invertir en bienes raíces'}
            </p>
          </div>

          <CardContent className="pb-4">
            <form
              onSubmit={mode === 'login' ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {/* Name field (register only) */}
              {mode === 'register' && (
                <div className="animate-gsp-fade-in space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 pl-10 transition-colors duration-200"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 transition-colors duration-200"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-10 transition-colors duration-200"
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password (login only) */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary transition-colors duration-200 hover:text-primary/80 focus:outline-none"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="h-11 w-full gap-2 font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-border/50 pt-4">
            {/* Toggle mode */}
            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus:outline-none"
            >
              {mode === 'login' ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <span className="font-semibold text-primary hover:text-primary/80">
                    Regístrate aquí
                  </span>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <span className="font-semibold text-primary hover:text-primary/80">
                    Inicia sesión
                  </span>
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3" />
                <span>Encriptación SSL</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Building2 className="size-3" />
                <span>Regulado por CMF</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GSP — Global Solidarity Partners. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
