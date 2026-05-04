'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type DashboardNotification } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { cn } from '@/lib/utils'
import {
  Bell,
  Check,
  CheckCheck,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Info,
  CalendarDays,
  BellOff,
} from 'lucide-react'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'dividend':
    case 'payment':
      return <DollarSign className="size-4 text-emerald-500" />
    case 'investment':
    case 'market':
      return <TrendingUp className="size-4 text-blue-500" />
    case 'security':
    case 'kyc':
      return <ShieldCheck className="size-4 text-amber-500" />
    case 'alert':
    case 'warning':
      return <AlertCircle className="size-4 text-red-500" />
    case 'milestone':
      return <CalendarDays className="size-4 text-purple-500" />
    default:
      return <Info className="size-4 text-muted-foreground" />
  }
}

function timeAgo(dateStr: string, language: 'es' | 'en'): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (language === 'es') {
    if (diffMin < 1) return 'Justo ahora'
    if (diffMin < 60) return `Hace ${diffMin} min`
    if (diffH < 24) return `Hace ${diffH}h`
    if (diffD < 7) return `Hace ${diffD}d`
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 7) return `${diffD}d ago`
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

interface NotificationPanelProps {
  onCountChange?: (count: number) => void
}

export function NotificationPanel({ onCountChange }: NotificationPanelProps) {
  const t = useT()
  const language = useAppStore((s) => s.language)
  const dashboardData = useAppStore((s) => s.dashboardData)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  // Load notifications from dashboard data or fetch fresh
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        // API returns { notifications: [...], unreadCount: number }
        setNotifications(Array.isArray(data.notifications) ? data.notifications : Array.isArray(data) ? data : [])
      } else {
        // Fallback to dashboard notifications
        setNotifications(dashboardData.notifications || [])
      }
    } catch {
      setNotifications(dashboardData.notifications || [])
    } finally {
      setLoading(false)
    }
  }, [dashboardData.notifications])

  useEffect(() => {
    // Use dashboard notifications as initial data
    if (dashboardData.notifications?.length > 0) {
      setNotifications(dashboardData.notifications)
    }
  }, [dashboardData.notifications])

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open, loadNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Notify parent of count changes
  useEffect(() => {
    onCountChange?.(unreadCount)
  }, [unreadCount, onCountChange])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      // Silently fail
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    setMarkingAll(true)
    try {
      const unread = notifications.filter((n) => !n.read)
      await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}/read`, { method: 'PUT' })))
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // Silently fail
    } finally {
      setMarkingAll(false)
    }
  }, [notifications])

  const hasUnread = unreadCount > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 transition-colors duration-200 hover:text-foreground"
          aria-label={t('nav.notifications')}
        >
          <Bell className="size-[18px]" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex min-size-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0 shadow-xl border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">
              {language === 'es' ? 'Notificaciones' : 'Notifications'}
            </h3>
            {hasUnread && (
              <span className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {unreadCount}
              </span>
            )}
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="size-3.5" />
              {language === 'es' ? 'Leer todo' : 'Mark all read'}
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                {language === 'es' ? 'Cargando...' : 'Loading...'}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted/50 mb-3">
                <BellOff className="size-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === 'es' ? 'Sin notificaciones' : 'No notifications'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {language === 'es'
                  ? 'Las notificaciones nuevas aparecerán aquí'
                  : 'New notifications will appear here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-secondary/50 cursor-pointer',
                    !notification.read && 'bg-primary/[0.03]'
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    'flex items-center justify-center size-9 rounded-lg shrink-0 mt-0.5',
                    !notification.read ? 'bg-primary/10' : 'bg-muted/50'
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm leading-snug',
                        !notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 mt-1">
                      {timeAgo(notification.createdAt, language)}
                    </p>
                  </div>

                  {/* Mark read icon */}
                  {!notification.read && (
                    <Check className="size-3.5 text-muted-foreground/30 shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator className="bg-border/30" />
            <div className="px-4 py-2.5">
              <button
                onClick={() => { setOpen(false) }}
                className="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {language === 'es' ? 'Ver todas las notificaciones' : 'View all notifications'}
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
