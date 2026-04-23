'use client'

import { useEffect, lazy, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/gsp/layout/Navbar'
import { Footer } from '@/components/gsp/layout/Footer'
import { LoginPage } from '@/components/gsp/auth/LoginPage'
import { Loader2 } from 'lucide-react'

const HomePage = lazy(() => import('@/components/gsp/home/HomePage'))
const MarketplacePage = lazy(() => import('@/components/gsp/marketplace/MarketplacePage'))
const AssetDetailPage = lazy(() => import('@/components/gsp/asset/AssetDetailPage'))
const DashboardPage = lazy(() => import('@/components/gsp/dashboard/DashboardPage'))
const AdminPage = lazy(() => import('@/components/gsp/admin/AdminPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-8 animate-spin text-emerald-600" />
    </div>
  )
}

export default function AppShell() {
  const currentPage = useAppStore((s) => s.currentPage)
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const navigate = useAppStore((s) => s.navigate)
  const { data: session, status } = useSession()

  // Sync NextAuth session with app store
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      const sUser = session.user as Record<string, unknown>
      setUser({
        id: sUser.id as string,
        name: session.user.name || '',
        email: session.user.email || '',
        role: sUser.role as 'investor' | 'admin' | 'superadmin',
        kycStatus: sUser.kycStatus as 'pending' | 'submitted' | 'verified' | 'rejected',
        avatarUrl: session.user.image as string | undefined,
      })
    } else if (status === 'unauthenticated' && user) {
      setUser(null)
      navigate('login')
    }
  }, [session, status, user, setUser, navigate])

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentPage])

  // Show login page when user is not authenticated
  if (!user) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login': return <HomePage />
      case 'home': return <HomePage />
      case 'marketplace': return <MarketplacePage />
      case 'asset-detail': return <AssetDetailPage />
      case 'dashboard': return <DashboardPage />
      case 'admin': case 'admin-assets': case 'admin-users': case 'admin-financial': case 'admin-liquidity': return <AdminPage />
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
    </>
  )
}
