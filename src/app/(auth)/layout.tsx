import type { Metadata } from 'next'
import { Scissors } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/40">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-black text-2xl">BarberBook</span>
      </Link>
      {children}
    </div>
  )
}
