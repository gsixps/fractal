'use client'

import { useEffect, lazy, Suspense } from 'react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/gsp/layout/Navbar'
import { Footer } from '@/components/gsp/layout/Footer'
import { Loader2 } from 'lucide-react'

// Lazy load page components to reduce initial compilation memory
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

export default function App() {
  const currentPage = useAppStore((s) => s.currentPage)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'marketplace':
        return <MarketplacePage />
      case 'asset-detail':
        return <AssetDetailPage />
      case 'dashboard':
        return <DashboardPage />
      case 'admin':
      case 'admin-assets':
      case 'admin-users':
      case 'admin-financial':
      case 'admin-liquidity':
        return <AdminPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
