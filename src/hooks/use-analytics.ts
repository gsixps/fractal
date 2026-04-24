'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * useAnalytics — tracks page visits to /api/analytics/visit
 * - Fires once per unique page change
 * - Debounced: max once per 5 minutes per page
 * - Uses navigator.sendBeacon on unload for reliability
 */
export function useAnalytics() {
  const currentPage = useAppStore((s) => s.currentPage)
  const lastTrackedRef = useRef<Record<string, number>>({})
  const sessionIdRef = useRef<string>('')

  // Generate or restore a session ID
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('gsp-analytics-session')
    if (stored) {
      sessionIdRef.current = stored
    } else {
      const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      sessionIdRef.current = id
      sessionStorage.setItem('gsp-analytics-session', id)
    }
  }, [])

  const trackVisit = useCallback((page: string) => {
    const now = Date.now()
    // Only track once per page every 5 minutes
    const lastTracked = lastTrackedRef.current[page] || 0
    if (now - lastTracked < 5 * 60 * 1000) return

    lastTrackedRef.current[page] = now

    const payload = {
      page,
      path: window.location.pathname,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent || null,
      sessionId: sessionIdRef.current,
    }

    // Use sendBeacon for reliability, fallback to fetch
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/visit', blob)
      } catch {
        // Fallback
        fetch('/api/analytics/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      }
    } else {
      fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }
  }, [])

  // Track page changes
  useEffect(() => {
    if (typeof window === 'undefined' || !currentPage) return
    // Small delay to avoid tracking during SSR/hydration
    const timer = setTimeout(() => {
      trackVisit(currentPage)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentPage, trackVisit])

  // Track initial page load
  useEffect(() => {
    if (typeof window === 'undefined') return
    const timer = setTimeout(() => {
      trackVisit('home')
    }, 1000)
    return () => clearTimeout(timer)
  }, [trackVisit])
}
