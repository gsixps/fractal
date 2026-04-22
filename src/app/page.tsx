'use client'

import dynamic from 'next/dynamic'
import { Toaster } from '@/components/ui/toaster'
import { Loader2 } from 'lucide-react'
import { AppProvider } from '@/lib/store'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-8 animate-spin text-emerald-600" />
    </div>
  )
}

const AppContent = dynamic(
  () => import('@/components/gsp/AppShell'),
  {
    loading: () => <PageLoader />,
    ssr: false,
  }
)

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        <AppContent />
        <Toaster />
      </div>
    </AppProvider>
  )
}
