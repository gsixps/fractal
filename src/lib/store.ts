import { create } from 'zustand'

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

export interface AppState {
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

  navigate: (page: Page) => void
  selectAsset: (id: string) => void
  setUser: (user: AppState['user']) => void
  toggleSidebar: () => void
  setAdminTab: (tab: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  selectedAssetId: null,
  user: {
    id: 'usr_demo_001',
    name: 'María González',
    email: 'maria@example.com',
    role: 'investor',
    kycStatus: 'verified',
  },
  isSidebarOpen: false,
  adminTab: 'overview',

  navigate: (page) => set({ currentPage: page }),
  selectAsset: (id) => set({ selectedAssetId: id, currentPage: 'asset-detail' }),
  setUser: (user) => set({ user }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setAdminTab: (tab) => set({ adminTab: tab, currentPage: 'admin' }),
}))
