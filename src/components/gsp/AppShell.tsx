'use client'

import { useEffect, lazy, Suspense, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { signIn } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/gsp/layout/Navbar'
import { Footer } from '@/components/gsp/layout/Footer'
import { LoginPage } from '@/components/gsp/auth/LoginPage'
import { ChangePasswordDialog } from '@/components/gsp/auth/ChangePasswordDialog'
import { OnboardingModal } from '@/components/gsp/shared/OnboardingModal'
import { ChatWidget } from '@/components/gsp/shared/ChatWidget'
import { Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-8 animate-spin text-emerald-600" />
    </div>
  )
}

// Pages that require authentication
const PROTECTED_PAGES = new Set(['dashboard', 'admin', 'admin-assets', 'admin-users', 'admin-financial', 'admin-liquidity', 'kyc', 'liquidity', 'profile', 'referral', 'reports'])

export default function AppShell() {
  const currentPage = useAppStore((s) => s.currentPage)
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const navigate = useAppStore((s) => s.navigate)
  const { data: session, status } = useSession()
  const t = useT()
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Analytics tracking
  useAnalytics()

  // Sync NextAuth session with app store
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
    } else if (status === 'unauthenticated') {
      setUser(null)
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
      case 'home': return <HomePage />
      case 'marketplace': return <MarketplacePage />
      case 'asset-detail': return <AssetDetailPage />
      case 'dashboard': return user ? <DashboardPage /> : <LoginPage />
      case 'admin': case 'admin-assets': case 'admin-users': case 'admin-financial': case 'admin-liquidity':
        return user ? <AdminPage /> : <LoginPage />
      case 'kyc': return user ? <KYCPage /> : <LoginPage />
      case 'profile': return user ? <ProfilePage /> : <LoginPage />
      case 'liquidity': return user ? <LiquidityPage /> : <LoginPage />
      case 'reports': return user ? <ReportsPage /> : <LoginPage />
      case 'referral': return user ? <ReferralPage /> : <LoginPage />
      case 'secondary-market': return <SecondaryMarketPage />
      default: return <HomePage />
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
      </main>
      <Footer />
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      {user && <OnboardingModal />}
      {user && <ChatWidget />}
    </>
  )
}
