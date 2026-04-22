'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Page } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Bell,
  ChevronDown,
  Home,
  Store,
  PieChart,
  ShieldCheck,
  Settings,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react'

interface NavLink {
  label: string
  page: Page
  icon: React.ReactNode
}

const navLinks: NavLink[] = [
  { label: 'Inicio', page: 'home', icon: <Home className="size-4" /> },
  { label: 'Marketplace', page: 'marketplace', icon: <Store className="size-4" /> },
  { label: 'Mi Portafolio', page: 'dashboard', icon: <PieChart className="size-4" /> },
]

export function Navbar() {
  const navigate = useAppStore((s) => s.navigate)
  const currentPage = useAppStore((s) => s.currentPage)
  const user = useAppStore((s) => s.user)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 8)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'gsp-glass border-b shadow-sm'
          : 'bg-background/80 backdrop-blur-sm'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none"
        >
          <div className="flex size-8 items-center justify-center rounded-lg gsp-gradient">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="gsp-gradient-text">GSP</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page
            return (
              <Button
                key={link.page}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate(link.page)}
                className={cn(
                  'gap-2 font-medium transition-colors',
                  isActive && 'bg-secondary text-secondary-foreground'
                )}
              >
                {link.icon}
                {link.label}
              </Button>
            )
          })}
          {/* Admin Link (demo) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('admin')}
            className={cn(
              'gap-2 font-medium text-muted-foreground transition-colors',
              currentPage === 'admin' &&
                'bg-secondary text-secondary-foreground'
            )}
          >
            <ShieldCheck className="size-4" />
            Admin
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9"
            onClick={() => setNotificationCount(0)}
          >
            <Bell className="size-[18px]" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                {notificationCount}
              </span>
            )}
            <span className="sr-only">Notificaciones</span>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden gap-2 pl-1 pr-2 sm:flex"
              >
                <Avatar className="size-7">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                    {user?.name ? getInitials(user.name) : 'US'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left lg:flex">
                  <span className="text-sm font-medium leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {user?.role === 'admin' ? 'Administrador' : 'Inversionista'}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge
                    variant="outline"
                    className="mt-1 w-fit bg-primary/5 text-[10px] font-medium text-primary"
                  >
                    {user?.role === 'admin' ? 'Admin' : 'Inversionista'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('dashboard')}>
                  <LayoutDashboard className="size-4" />
                  Mi Portafolio
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="size-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="size-4" />
                  Configuración
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('admin')}
                variant="default"
                className="gap-2 font-medium"
              >
                <ShieldCheck className="size-4" />
                Panel Admin (Demo)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="text-destructive">
                <LogOut className="size-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="flex size-7 items-center justify-center rounded-md gsp-gradient">
                    <span className="text-xs font-bold text-white">G</span>
                  </div>
                  <span className="gsp-gradient-text text-lg font-bold">
                    GSP
                  </span>
                </SheetTitle>
                <SheetDescription className="text-left">
                  Global Solidarity Partners
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-2" />

              {/* Mobile User Info */}
              {user && (
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <Avatar className="size-10">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.role === 'admin' ? 'Administrador' : 'Inversionista'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1 px-2 pt-2">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Navegación
                </span>
                {navLinks.map((link) => {
                  const isActive = currentPage === link.page
                  return (
                    <SheetClose asChild key={link.page}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 px-3 py-5',
                          isActive && 'bg-primary/5 text-primary'
                        )}
                        onClick={() => navigate(link.page)}
                      >
                        <span
                          className={cn(
                            'flex size-8 items-center justify-center rounded-lg',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {link.icon}
                        </span>
                        {link.label}
                      </Button>
                    </SheetClose>
                  )
                })}

                <Separator className="my-2" />

                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin (Demo)
                </span>
                <SheetClose asChild>
                  <Button
                    variant={currentPage === 'admin' ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-5',
                      currentPage === 'admin' && 'bg-primary/5 text-primary'
                    )}
                    onClick={() => navigate('admin')}
                  >
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        currentPage === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <ShieldCheck className="size-4" />
                    </span>
                    Panel de Administración
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
