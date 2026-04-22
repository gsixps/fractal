'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/gsp/layout/Navbar'
import { Footer } from '@/components/gsp/layout/Footer'
import HomePage from '@/components/gsp/home/HomePage'
import MarketplacePage from '@/components/gsp/marketplace/MarketplacePage'
import AssetDetailPage from '@/components/gsp/asset/AssetDetailPage'
import DashboardPage from '@/components/gsp/dashboard/DashboardPage'
import AdminPage from '@/components/gsp/admin/AdminPage'

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
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  )
}
