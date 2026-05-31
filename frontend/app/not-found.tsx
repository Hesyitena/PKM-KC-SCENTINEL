import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center bg-background">
      <p className="text-8xl font-black gradient-text">404</p>
      <h2 className="text-xl font-semibold">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-muted-foreground">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
