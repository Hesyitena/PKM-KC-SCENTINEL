"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <AlertTriangle size={36} className="text-destructive" />
      <h2 className="text-lg font-semibold">Terjadi Kesalahan</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{error.message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
