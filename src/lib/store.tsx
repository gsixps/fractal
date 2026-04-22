'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Page =
  | 'home'
  | 'marketplace'
  | 'asset-detail'
  | 'dashboard'
  | 'admin'
  | 'admin-assets'
  | 'admin-users'
  | 'admin-financial'
  | 'admin-liquidity'
  | 'kyc'
  | 'liquidity'

// ─── Embedded Asset Data Types ────────────────────────────────────────────────

export interface AssetImage {
  id: string
  url: string
  alt?: string
  sortOrder: number
  isCover: boolean
}

export interface AssetDocument {
  id: string
  title: string
  documentType: string
  fileUrl: string
  fileSize?: number
}

export interface CashFlowProjection {
  id: string
  period: string
  periodType: string
  grossIncome: number
  operationalCost: number
  netIncome: number
  appreciation: number
  totalReturn: number
  cumulativeReturn: number
}

export interface Asset {
  id: string
  name: string
  slug: string
  type: string
  status: string
  address: string
  city: string
  region: string
  country: string
  totalValue: number
  pricePerFraction: number
  totalFractions: number
  availableFractions: number
  minimumInvestment: number
  fundedPercentage: number
  annualYield: number
  projectedAppreciation: number
  totalProjectedReturn: number
  leaseStatus: string
  monthlyRent: number
  tenantName: string
  totalArea: number
  units: number
  constructionYear: number
  landUse: string
  shortDescription: string
  fullDescription: string
  highlights: string
  badge?: string
  operationalCostsPct: number
  images: AssetImage[]
  documents: AssetDocument[]
  cashFlowProjections: CashFlowProjection[]
  _count: { investments: number }
  createdAt: string
  updatedAt: string
}

// ─── Dashboard Data Types ─────────────────────────────────────────────────────

export interface DashboardUser {
  id: string
  name: string | null
  email: string
  role: string
  kycStatus: string
  balance: number
  totalInvested: number
  totalEarnings: number
}

export interface DashboardInvestment {
  id: string
  userId: string
  assetId: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  status: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  asset: {
    id: string
    name: string
    type: string
    status: string
    pricePerFraction: number
    annualYield: number
    images: AssetImage[]
  }
}

export interface DashboardTransaction {
  id: string
  type: string
  amount: number
  currency: string
  status: string
  description?: string
  createdAt: string
}

export interface DashboardDividend {
  id: string
  amount: number
  perFraction: number
  fractions: number
  periodStart: string
  periodEnd: string
  paymentDate?: string
  status: string
  createdAt: string
  investment: {
    id: string
    asset: {
      id: string
      name: string
    }
  }
}

export interface DashboardLiquidityPool {
  id: string
  totalReserve: number
  totalAssets: number
  activeRequests: number
  utilizationRate: number
  monthlyContribution?: number
  autoReplenish: boolean
}

export interface DashboardNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface DashboardData {
  user: DashboardUser | null
  investments: DashboardInvestment[]
  transactions: DashboardTransaction[]
  dividendPayments: DashboardDividend[]
  liquidityPool: DashboardLiquidityPool | null
  notifications: DashboardNotification[]
  totalDividends: number
  unreadNotifications: number
}

// ─── Seed Data (moved to separate file to keep store clean) ──────────────────

// Import seed data
import { SEED_ASSETS, SEED_DASHBOARD_DATA } from './seed-data'

// ─── Context Types ──────────────────────────────────────────────────────────

interface AppState {
  currentPage: Page
  selectedAssetId: string | null
  user: {
    id: string
    name: string
    email: string
    role: 'investor' | 'admin'
    kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected'
    avatarUrl?: string
  } | null
  isSidebarOpen: boolean
  adminTab: string
  assets: Asset[]
  dashboardData: DashboardData
  navigate: (page: Page) => void
  selectAsset: (id: string) => void
  setUser: (user: AppState['user']) => void
  toggleSidebar: () => void
  setAdminTab: (tab: string) => void
  getAssetById: (id: string) => Asset | undefined
}

const AppContext = createContext<AppState | null>(null)

export function useAppStore(): AppState
export function useAppStore<T>(selector: (state: AppState) => T): T
export function useAppStore<T>(selector?: (state: AppState) => T): T | AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return selector ? selector(ctx) : ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [adminTab, setAdminTab] = useState('overview')
  const [user, setUser] = useState<AppState['user']>({
    id: 'usr_demo_001',
    name: 'María González',
    email: 'maria@example.com',
    role: 'investor',
    kycStatus: 'verified',
  })

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page)
  }, [])

  const selectAsset = useCallback((id: string) => {
    setSelectedAssetId(id)
    setCurrentPage('asset-detail')
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  const handleSetAdminTab = useCallback((tab: string) => {
    setAdminTab(tab)
    setCurrentPage('admin')
  }, [])

  const getAssetById = useCallback((id: string) => {
    return SEED_ASSETS.find((a) => a.id === id || a.slug === id)
  }, [])

  const value: AppState = {
    currentPage,
    selectedAssetId,
    user,
    isSidebarOpen,
    adminTab,
    assets: SEED_ASSETS,
    dashboardData: SEED_DASHBOARD_DATA,
    navigate,
    selectAsset,
    setUser,
    toggleSidebar,
    setAdminTab: handleSetAdminTab,
    getAssetById,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
