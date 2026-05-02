import { Calendar, TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import type { DashboardStats } from '@/types'
import { formatPrice } from '@/lib/utils'

interface StatsBarProps {
  stats: DashboardStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const statCards = [
    {
      label: 'Today',
      value: stats.appointmentsToday,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      suffix: 'appts',
    },
    {
      label: 'This Week',
      value: stats.appointmentsThisWeek,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      suffix: 'appts',
    },
    {
      label: 'Pending',
      value: stats.pendingConfirmations,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      suffix: 'pending',
    },
    {
      label: 'No-Shows',
      value: stats.noShowsThisMonth,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      suffix: 'this mo.',
    },
    {
      label: 'Revenue',
      value: null,
      rawValue: formatPrice(stats.revenueThisMonth),
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
      suffix: 'this mo.',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map(({ label, value, rawValue, icon: Icon, color, suffix }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3"
        >
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {rawValue ?? value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
