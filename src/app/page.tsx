'use client'

import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from '@/lib/store'
import { I18nProvider } from '@/lib/i18n'
import AppShell from '@/components/gsp/AppShell'

export default function App() {
  return (
    <I18nProvider defaultLocale='es'>
      <AppProvider>
        <div className="flex min-h-screen flex-col">
          <AppShell />
          <Toaster />
        </div>
      </AppProvider>
    </I18nProvider>
  )
}
