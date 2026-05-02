'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCog,
  Settings,
  LogOut,
  Zap,
  ListOrdered,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/queue', label: 'Queue', icon: ListOrdered },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/services', label: 'Services', icon: Scissors },
  { href: '/barbers', label: 'Team', icon: UserCog },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-950 flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">BarberBook</span>
            <span className="block text-amber-500 text-[10px] font-medium tracking-wide uppercase">
              Pro
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade prompt */}
      <div className="mx-3 mb-3 p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">
            Upgrade
          </span>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          Unlock SMS reminders, analytics, and more with Pro.
        </p>
        <Link
          href="/settings?tab=billing"
          className="mt-3 block text-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          View Plans →
        </Link>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-gray-800 pt-4">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
