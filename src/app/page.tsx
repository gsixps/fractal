'use client'

import React from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from '@/lib/store'
import { I18nProvider } from '@/lib/i18n'
import AppShell from '@/components/gsp/AppShell'

// Error Boundary — class component required by React
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
          <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider defaultLocale='es'>
        <AppProvider>
          <div className="flex min-h-screen flex-col">
            <AppShell />
            <Toaster />
          </div>
        </AppProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}
