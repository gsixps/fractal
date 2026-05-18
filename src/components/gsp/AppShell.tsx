'use client'

import React, { useEffect, lazy, Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/gsp/layout/Navbar'
import { Footer } from '@/components/gsp/layout/Footer'
import { LoginPage } from '@/components/gsp/auth/LoginPage'
import { ChangePasswordDialog } from '@/components/gsp/auth/ChangePasswordDialog'
import { OnboardingModal } from '@/components/gsp/shared/OnboardingModal'
import { ChatWidget } from '@/components/gsp/shared/ChatWidget'
import { Loader2 } from 'lucide-react'
import { useT } from '@/lib/i18n-utils'
import { useAnalytics } from '@/hooks/use-analytics'

const HomePage = lazy(() => import('@/components/gsp/home/HomePage'))
const MarketplacePage = lazy(() => import('@/components/gsp/marketplace/MarketplacePage'))
const AssetDetailPage = lazy(() => import('@/components/gsp/asset/AssetDetailPage'))
const DashboardPage = lazy(() => import('@/components/gsp/dashboard/DashboardPage'))
const AdminPage = lazy(() => import('@/components/gsp/admin/AdminPage'))
const KYCPage = lazy(() => import('@/components/gsp/kyc/KYCPage'))
const ProfilePage = lazy(() => import('@/components/gsp/profile/ProfilePage'))
const LiquidityPage = lazy(() => import('@/components/gsp/liquidity/LiquidityPage'))
const ReferralPage = lazy(() => import('@/components/gsp/referral/ReferralPage'))
const ReportsPage = lazy(() => import('@/components/gsp/reports/ReportsPage'))
const SecondaryMarketPage = lazy(() => import('@/components/gsp/secondary-market/SecondaryMarketPage'))
const CmsPageView = lazy(() => import('@/components/gsp/cms/CmsPageView').then(m => ({ default: m.CmsPageView })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-8 animate-spin text-emerald-600" />
    </div>
  )
}

// Per-page error boundary so one failing component doesn't crash the whole app
class PageErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 p-6">
          <p className="text-sm text-muted-foreground">
            Error loading page: {this.state.error?.message}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// Wraps each lazy component with its own error boundary + Suspense
function SafeSuspense({ children }: { children: React.ReactNode }) {
  return (
    <PageErrorBoundary fallback={<PageLoader />}>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </PageErrorBoundary>
  )
}

// Pages that require authentication
const PROTECTED_PAGES = new Set(['dashboard', 'admin', 'admin-assets', 'admin-users', 'admin-financial', 'admin-liquidity', 'kyc', 'liquidity', 'profile', 'referral', 'reports'])

export default function AppShell() {
  const currentPage = useAppStore((s) => s.currentPage)
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const { data: session, status } = useSession()
  const t = useT()
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Analytics tracking
  useAnalytics()

  // Sync NextAuth session with app store
  // Only sync when authenticated — do NOT null out user when "unauthenticated"
  // because the custom /api/auth/login sets cookies directly and the session
  // may take a tick to load, causing a flash of logged-out state.
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const su = session.user
      setUser({
        id: su.id,
        name: su.name || '',
        email: su.email || '',
        role: (su.role as 'investor' | 'admin' | 'superadmin') || 'investor',
        kycStatus: (su.kycStatus as 'pending' | 'submitted' | 'verified' | 'rejected') || 'pending',
        avatarUrl: su.image as string | undefined,
      })
    }
  }, [session, status, setUser])

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentPage])

  // If navigating to login page, show login form
  if (currentPage === 'login') {
    return <LoginPage />
  }

  // Check if current page requires auth
  const requiresAuth = PROTECTED_PAGES.has(currentPage)
  if (requiresAuth && !user) {
    // Show login page for protected routes
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <SafeSuspense><HomePage /></SafeSuspense>
      case 'marketplace': return <SafeSuspense><MarketplacePage /></SafeSuspense>
      case 'asset-detail': return <SafeSuspense><AssetDetailPage /></SafeSuspense>
      case 'dashboard': return user ? <SafeSuspense><DashboardPage /></SafeSuspense> : <LoginPage />
      case 'admin': case 'admin-assets': case 'admin-users': case 'admin-financial': case 'admin-liquidity':
        return user ? <SafeSuspense><AdminPage /></SafeSuspense> : <LoginPage />
      case 'kyc': return user ? <SafeSuspense><KYCPage /></SafeSuspense> : <LoginPage />
      case 'profile': return user ? <SafeSuspense><ProfilePage /></SafeSuspense> : <LoginPage />
      case 'liquidity': return user ? <SafeSuspense><LiquidityPage /></SafeSuspense> : <LoginPage />
      case 'reports': return user ? <SafeSuspense><ReportsPage /></SafeSuspense> : <LoginPage />
      case 'referral': return user ? <SafeSuspense><ReferralPage /></SafeSuspense> : <LoginPage />
      case 'secondary-market': return <SafeSuspense><SecondaryMarketPage /></SafeSuspense>
      case 'cms-page': return <SafeSuspense><CmsPageView /></SafeSuspense>
      default: return <SafeSuspense><HomePage /></SafeSuspense>
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      {user && <OnboardingModal />}
      {user && <ChatWidget />}
    </>
  )
}
