'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="stripe-card-elevated max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Maaf, terjadi kesalahan yang tidak terduga.'}
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
