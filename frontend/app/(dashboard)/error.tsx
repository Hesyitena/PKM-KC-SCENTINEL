'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="stripe-card-elevated max-w-lg w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Dashboard Error
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message || 'Terjadi kesalahan saat memuat dashboard. Silakan refresh halaman.'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </button>
          
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
