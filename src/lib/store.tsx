'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useTranslation, type Locale } from '@/lib/i18n'

export type Page =
  | 'login'
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
  | 'profile'
  | 'referral'
  | 'forgot-password'
  | 'reports'
  | 'secondary-market'
  | 'cms-page'

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
  monthlyRent: number | null
  tenantName: string | null
  totalArea: number | null
  units: number | null
  constructionYear: number | null
  landUse: string | null
  shortDescription: string
  fullDescription: string
  highlights: string
  badge?: string
  operationalCostsPct: number | null
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
  totalInvested: number
  currentValue: number
  totalReturn: number
  unreadNotifications: number
}

// ─── Default empty dashboard data ──────────────────────────────────────────

const EMPTY_DASHBOARD_DATA: DashboardData = {
  user: null,
  investments: [],
  transactions: [],
  dividendPayments: [],
  liquidityPool: null,
  notifications: [],
  totalDividends: 0,
  totalInvested: 0,
  currentValue: 0,
  totalReturn: 0,
  unreadNotifications: 0,
}

// ─── Context Types ──────────────────────────────────────────────────────────

interface AppState {
  currentPage: Page
  selectedAssetId: string | null
  selectedAsset: Asset | null
  user: {
    id: string
    name: string
    email: string
    role: 'investor' | 'admin' | 'superadmin'
    kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected'
    avatarUrl?: string
  } | null
  isSidebarOpen: boolean
  adminTab: string
  assets: Asset[]
  assetsLoading: boolean
  dashboardData: DashboardData
  dashboardLoading: boolean
  selectedAssetLoading: boolean
  theme: 'light' | 'dark'
  language: 'es' | 'en'
  currency: string
  cmsPageSlug: string | null
  navigate: (page: Page) => void
  selectAsset: (id: string) => void
  setUser: (user: AppState['user']) => void
  toggleSidebar: () => void
  setAdminTab: (tab: string) => void
  navigateCmsPage: (slug: string) => void
  getAssetById: (id: string) => Asset | undefined
  fetchAssets: () => Promise<void>
  fetchDashboard: () => Promise<void>
  fetchAssetById: (id: string) => Promise<void>
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'es' | 'en') => void
  setCurrency: (currency: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function useAppStore(): AppState
export function useAppStore<T>(selector: (state: AppState) => T): T
export function useAppStore<T>(selector?: (state: AppState) => T): T | AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return selector ? selector(ctx) : ctx
}

// ─── Re-export i18n types and hook ──────────────────────────────────────────

export { useTranslation, type Locale } from '@/lib/i18n'

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [adminTab, setAdminTab] = useState('overview')
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  const [language, setLanguageState] = useState<'es' | 'en'>('es')
  const [currency, setCurrencyState] = useState<string>('USD')

  const [user, setUser] = useState<AppState['user']>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [selectedAssetLoading, setSelectedAssetLoading] = useState(false)
  const [cmsPageSlug, setCmsPageSlug] = useState<string | null>(null)

  const assetsFetched = useRef(false)
  const dashboardFetched = useRef(false)

  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', t === 'dark')
    }
  }, [])

  const { setLocale } = useTranslation()

  const setLanguage = useCallback((l: 'es' | 'en') => {
    setLanguageState(l)
    setLocale(l as Locale)
  }, [setLocale])

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c)
  }, [])

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

  const navigateCmsPage = useCallback((slug: string) => {
    setCmsPageSlug(slug)
    setCurrentPage('cms-page')
  }, [])

  const getAssetById = useCallback((id: string) => {
    return assets.find((a) => a.id === id || a.slug === id)
  }, [assets])

  const fetchAssets = useCallback(async () => {
    try {
      setAssetsLoading(true)
      const res = await fetch('/api/assets')
      if (!res.ok) return
      const data = await res.json()
      setAssets(data)
      assetsFetched.current = true
    } catch {
      // Silently fail — assets will remain empty
    } finally {
      setAssetsLoading(false)
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true)
      const res = await fetch('/api/dashboard')
      if (!res.ok) return
      const data = await res.json()
      setDashboardData(data)
      dashboardFetched.current = true
    } catch {
      // Silently fail — dashboard will remain empty
    } finally {
      setDashboardLoading(false)
    }
  }, [])

  const fetchAssetById = useCallback(async (id: string) => {
    try {
      setSelectedAssetLoading(true)
      setSelectedAsset(null)
      const res = await fetch(`/api/assets/${id}`)
      if (!res.ok) {
        setSelectedAsset(null)
        return
      }
      const data = await res.json()
      setSelectedAsset(data)
    } catch {
      setSelectedAsset(null)
    } finally {
      setSelectedAssetLoading(false)
    }
  }, [])

  // Pre-fetch assets on mount (with guard to avoid duplicate fetches)
  useEffect(() => {
    if (!assetsFetched.current) {
      fetchAssets()
    }
  }, [fetchAssets])

  const value: AppState = {
    currentPage,
    selectedAssetId,
    selectedAsset,
    user,
    isSidebarOpen,
    adminTab,
    theme,
    language,
    currency,
    cmsPageSlug,
    assets,
    assetsLoading,
    dashboardData,
    dashboardLoading,
    selectedAssetLoading,
    navigate,
    selectAsset,
    setUser,
    toggleSidebar,
    setAdminTab: handleSetAdminTab,
    navigateCmsPage,
    getAssetById,
    fetchAssets,
    fetchDashboard,
    fetchAssetById,
    setTheme,
    setLanguage,
    setCurrency,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Re-export for external usage
export type { Asset, DashboardData, DashboardUser, DashboardInvestment, DashboardTransaction, DashboardDividend, DashboardLiquidityPool, DashboardNotification }
