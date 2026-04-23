'use client'

import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useAppStore, type Page } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
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
  LogOut,
  User,
  LayoutDashboard,
  Sun,
  Moon,
  Globe,
  DollarSign,
  LogIn,
} from 'lucide-react'

interface NavLink {
  labelKey: string
  page: Page
  icon: React.ReactNode
}

export function Navbar() {
  const t = useT()
  const navigate = useAppStore((s) => s.navigate)
  const currentPage = useAppStore((s) => s.currentPage)
  const user = useAppStore((s) => s.user)
  const appTheme = useAppStore((s) => s.theme)
  const setAppTheme = useAppStore((s) => s.setTheme)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const currency = useAppStore((s) => s.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isScrolled, setIsScrolled] = useState(false)

  // Dynamic nav links based on auth state
  const navLinks = user
    ? [
        { labelKey: 'nav.home', page: 'home' as Page, icon: <Home className="size-4" /> },
        { labelKey: 'nav.marketplace', page: 'marketplace' as Page, icon: <Store className="size-4" /> },
        { labelKey: 'nav.portfolio', page: 'dashboard' as Page, icon: <PieChart className="size-4" /> },
      ]
    : [
        { labelKey: 'nav.home', page: 'home' as Page, icon: <Home className="size-4" /> },
        { labelKey: 'nav.marketplace', page: 'marketplace' as Page, icon: <Store className="size-4" /> },
      ]

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

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
        'sticky top-0 z-50 w-full transition-all duration-300 ease-out',
        isScrolled
          ? 'gsp-glass border-b border-border/50 shadow-[0_1px_3px_oklch(0.45_0.155_162/0.06)]'
          : 'bg-background/60 backdrop-blur-md'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('nav.home')}
        >
          <div className="flex size-8 items-center justify-center rounded-lg gsp-gradient shadow-[0_2px_8px_oklch(0.45_0.155_162/0.25)]">
            <span className="text-sm font-bold text-white tracking-tight">G</span>
          </div>
          <span className="text-xl font-bold tracking-tight gsp-gradient-text">
            GSP
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
                  'gap-2 font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.icon}
                {t(link.labelKey)}
              </Button>
            )
          })}
          {/* Admin Link - only for admins */}
          {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('admin')}
            className={cn(
              'gap-2 font-medium transition-colors duration-200',
              currentPage === 'admin'
                ? 'bg-secondary text-secondary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ShieldCheck className="size-4" />
            {t('nav.admin')}
          </Button>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5">
          {/* Controls: Theme, Language, Currency */}
          <div className="hidden items-center gap-0.5 sm:flex">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 transition-colors duration-200 hover:text-foreground"
              onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {appTheme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 px-2 text-xs font-medium transition-colors duration-200 hover:text-foreground"
                >
                  <Globe className="size-3.5" />
                  {language === 'es' ? 'ES' : 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('es')} className={language === 'es' ? 'bg-secondary' : ''}>
                  🇨🇱 Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-secondary' : ''}>
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 px-2 text-xs font-medium transition-colors duration-200 hover:text-foreground"
                >
                  <DollarSign className="size-3.5" />
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[
                  { code: 'CLP', label: '🇨🇱 CLP - Peso Chileno' },
                  { code: 'USD', label: '🇺🇸 USD - Dólar' },
                  { code: 'EUR', label: '🇪🇺 EUR - Euro' },
                  { code: 'MXN', label: '🇲🇽 MXN - Peso Mexicano' },
                  { code: 'COP', label: '🇨🇴 COP - Peso Colombiano' },
                  { code: 'ARS', label: '🇦🇷 ARS - Peso Argentino' },
                  { code: 'PEN', label: '🇵🇪 PEN - Sol Peruano' },
                  { code: 'BRL', label: '🇧🇷 BRL - Real Brasilero' },
                ].map((c) => (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={currency === c.code ? 'bg-secondary' : ''}
                  >
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notification Bell - only when logged in */}
          {user && (
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 transition-colors duration-200 hover:text-foreground"
            onClick={() => setNotificationCount(0)}
            aria-label={t('nav.notifications')}
          >
            <Bell className="size-[18px]" />
            {notificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center rounded-full bg-emerald-500">
                <span className="sr-only">{notificationCount} {t('nav.notifications').toLowerCase()}</span>
              </span>
            )}
          </Button>
          )}

          {/* User Dropdown or Login Button */}
          {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden gap-2 pl-1.5 pr-2 sm:flex transition-colors duration-200 hover:bg-secondary"
              >
                <Avatar className="size-7 ring-2 ring-primary/10">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                    {user.name ? getInitials(user.name) : 'US'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left lg:flex">
                  <span className="text-sm font-medium leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {user.role === 'admin' || user.role === 'superadmin' ? t('nav.admin') : t('nav.portfolio').replace('Mi ', '')}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge
                    variant="outline"
                    className="mt-0.5 w-fit bg-primary/5 text-[10px] font-medium text-primary border-primary/15"
                  >
                    {user?.role === 'admin' ? t('nav.admin') : t('nav.portfolio').replace('Mi ', '')}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('dashboard')} className="cursor-pointer">
                  <LayoutDashboard className="size-4" />
                  {t('nav.portfolio')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="size-4" />
                  {t('nav.profile')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {isAdmin && (
              <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('admin')} className="cursor-pointer">
                <ShieldCheck className="size-4" />
                {t('nav.adminPanel')}
              </DropdownMenuItem>
              </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="text-destructive cursor-pointer" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="size-4" />
                {t('nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate('login')}
              className="gap-2 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200"
              size="sm"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden transition-colors duration-200" aria-label={t('nav.menu')}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="flex size-7 items-center justify-center rounded-md gsp-gradient">
                    <span className="text-xs font-bold text-white">G</span>
                  </div>
                  <span className="gsp-gradient-text text-lg font-bold">GSP</span>
                </SheetTitle>
                <SheetDescription className="text-left text-muted-foreground">
                  Global Solidarity Partners
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-3" />

              {user && (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                  <Avatar className="size-10 ring-2 ring-primary/10">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.role === 'admin' || user.role === 'superadmin' ? t('nav.admin') : t('nav.portfolio').replace('Mi ', '')}
                    </span>
                  </div>
                </div>
              )}
              {!user && (
                <SheetClose asChild>
                  <Button onClick={() => navigate('login')} className="w-full gap-2 gsp-gradient text-white hover:shadow-lg">
                    <LogIn className="size-4" />
                    {t('nav.login')}
                  </Button>
                </SheetClose>
              )}

              <div className="flex flex-col gap-1 px-2 pt-3">
                <span className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('nav.menu')}
                </span>
                {navLinks.map((link) => {
                  const isActive = currentPage === link.page
                  return (
                    <SheetClose asChild key={link.page}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 px-3 py-5 rounded-xl transition-colors duration-200 cursor-pointer',
                          isActive
                            ? 'bg-primary/8 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        onClick={() => navigate(link.page)}
                      >
                        <span
                          className={cn(
                            'flex size-9 items-center justify-center rounded-lg transition-colors duration-200',
                            isActive
                              ? 'bg-primary/12 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {link.icon}
                        </span>
                        {t(link.labelKey)}
                      </Button>
                    </SheetClose>
                  )
                })}

                <Separator className="my-2" />

                {isAdmin && (
                <>
                <span className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('nav.admin')}
                </span>
                <SheetClose asChild>
                  <Button
                    variant={currentPage === 'admin' ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-5 rounded-xl transition-colors duration-200 cursor-pointer',
                      currentPage === 'admin'
                        ? 'bg-primary/8 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => navigate('admin')}
                  >
                    <span
                      className={cn(
                        'flex size-9 items-center justify-center rounded-lg transition-colors duration-200',
                        currentPage === 'admin'
                          ? 'bg-primary/12 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <ShieldCheck className="size-4" />
                    </span>
                    {t('nav.adminPanel')}
                  </Button>
                </SheetClose>
                </>
                )}

                <Separator className="my-3" />

                {/* Mobile: Theme, Language, Currency Controls */}
                <div className="flex flex-col gap-1 px-2">
                  <span className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('nav.settings')}
                  </span>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-3 rounded-xl transition-colors duration-200 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      {appTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </span>
                    {appTheme === 'dark' ? t('settings.theme.light') : t('settings.theme.dark')}
                  </Button>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 px-3 py-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="mr-auto text-sm text-muted-foreground">{t('settings.language')}</span>
                    <Button
                      variant={language === 'es' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setLanguage('es')}
                    >
                      🇨🇱 ES
                    </Button>
                    <Button
                      variant={language === 'en' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setLanguage('en')}
                    >
                      🇺🇸 EN
                    </Button>
                  </div>

                  {/* Currency Selector */}
                  <div className="flex items-center gap-1 px-3 py-2">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <span className="mr-auto text-sm text-muted-foreground">{t('common.currency')}</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="CLP">🇨🇱 CLP</option>
                      <option value="USD">🇺🇸 USD</option>
                      <option value="EUR">🇪🇺 EUR</option>
                      <option value="MXN">🇲🇽 MXN</option>
                      <option value="COP">🇨🇴 COP</option>
                      <option value="ARS">🇦🇷 ARS</option>
                      <option value="PEN">🇵🇪 PEN</option>
                      <option value="BRL">🇧🇷 BRL</option>
                    </select>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
