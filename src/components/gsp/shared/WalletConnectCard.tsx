'use client'

import { useCallback, useEffect, useState } from 'react'
import { Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function shortAddress(addr: string): string {
  if (addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function utf8ToHex(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let hex = '0x'
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// ─── Connect wallet via SIWE (EIP-4361) using the injected provider ─────────

export function WalletConnectCard() {
  const t = useT()
  const { toast } = useToast()
  const user = useAppStore((s) => s.user)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [linkedAt, setLinkedAt] = useState<string | null>(null)
  const [hasProvider, setHasProvider] = useState(false)
  const [busy, setBusy] = useState(false)

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet')
      if (!res.ok) return
      const data = await res.json()
      setWalletAddress(data.walletAddress ?? null)
      setLinkedAt(data.walletLinkedAt ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    setHasProvider(typeof window !== 'undefined' && !!window.ethereum)
  }, [])

  useEffect(() => {
    if (user) refreshStatus()
  }, [user, refreshStatus])

  const handleConnect = async () => {
    const eth = window.ethereum
    if (!eth) {
      toast({
        title: t('common.error'),
        description: 'No se detectó una wallet. Instala MetaMask, Rabby o Coinbase Wallet.',
        variant: 'destructive',
      })
      return
    }

    setBusy(true)
    try {
      // 1. Pedir la cuenta
      const accounts = (await eth.request({ method: 'eth_requestAccounts', params: [] })) as unknown[]
      const address = (accounts?.[0] as string)?.toLowerCase()
      if (!address?.startsWith('0x')) throw new Error('No se pudo obtener la cuenta de tu wallet.')

      // 2. Nonce del servidor
      const nonceRes = await fetch('/api/wallet/nonce', { method: 'POST' })
      if (!nonceRes.ok) {
        const data = await nonceRes.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo obtener el nonce.')
      }
      const nonce = (await nonceRes.json()).nonce as string

      // 3. Firmar el mensaje EIP-4361
      const chainId = await eth.request({ method: 'eth_chainId', params: [] })
      const issuedAt = new Date().toISOString()
      const domain = window.location.host
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        address,
        '',
        'Conecta tu wallet a 3GSP para recibir dividendos y operar en el mercado secundario.',
        '',
        `URI: ${window.location.origin}`,
        'Version: 1',
        `Chain ID: ${Number(chainId)}`,
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
      ].join('\n')

      const signature = (await eth.request({
        method: 'personal_sign',
        params: [utf8ToHex(message), address],
      })) as string

      // 4. Enlazar
      const linkRes = await fetch('/api/wallet/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, address }),
      })
      const linkData = await linkRes.json().catch(() => ({}))
      if (!linkRes.ok) throw new Error(linkData.error || 'No se pudo enlazar la wallet.')

      setWalletAddress(linkData.walletAddress as string)
      setLinkedAt(linkData.walletLinkedAt as string)
      toast({ title: t('common.success'), description: 'Wallet enlazada correctamente.' })
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : 'No se pudo conectar la wallet.',
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className={cn('border-border/40 mb-6')}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Wallet className="size-4 text-primary" />
          Wallet / Billetera Digital
        </CardTitle>
        <CardDescription className="text-sm font-light text-muted-foreground">
          Vincula una wallet para recibir dividendos on-chain y operar en el mercado secundario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="size-[18px]" />
              </div>
              <div>
                <p className="text-sm font-medium font-mono">{shortAddress(walletAddress)}</p>
                <p className="text-xs text-muted-foreground font-light">
                  {formatDate(linkedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400">
                Vinculada
              </Badge>
              <Button variant="outline" size="sm" className="border-border/50 cursor-pointer" onClick={handleConnect} disabled={busy}>
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : 'Cambiar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {!hasProvider && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/30">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-800 dark:text-amber-300 font-light">
                  No se detectó una wallet en este navegador. Instala una extensión como{' '}
                  <span className="font-medium">MetaMask</span>, <span className="font-medium">Rabby</span> o{' '}
                  <span className="font-medium">Coinbase Wallet</span> para conectar tu billetera.
                </p>
              </div>
            )}
            <Button
              className="gap-2 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer self-start"
              onClick={handleConnect}
              disabled={busy}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
              {busy ? 'Firmando…' : 'Conectar wallet'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}