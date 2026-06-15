import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="stripe-card-elevated max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <FileQuestion className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-foreground">404</h1>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm text-muted-foreground">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
        </div>

        <Link href="/" className="btn-primary inline-block">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
