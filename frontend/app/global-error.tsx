'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8">
            <h2 className="text-2xl font-semibold text-foreground">Something went wrong!</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <button
              onClick={() => reset()}
              className="btn-primary mt-4"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
