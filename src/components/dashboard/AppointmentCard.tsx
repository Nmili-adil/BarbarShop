'use client'

import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Clock, User, Scissors } from 'lucide-react'
import type { AppointmentStatus } from '@prisma/client'

interface AppointmentCardProps {
  appointment: {
    id: string
    startsAt: Date | string
    endsAt: Date | string
    status: AppointmentStatus
    client: { name: string; phone: string | null }
    barber: { name: string }
    service: { name: string; priceCents: number }
  }
  onClick?: () => void
}

function statusVariant(status: AppointmentStatus) {
  switch (status) {
    case 'CONFIRMED': return 'success'
    case 'COMPLETED': return 'secondary'
    case 'CANCELLED': return 'cancelled'
    case 'NO_SHOW': return 'noshow'
    case 'PENDING': return 'pending'
    default: return 'outline'
  }
}

function statusLabel(status: AppointmentStatus) {
  return status === 'NO_SHOW' ? 'No Show' : status.charAt(0) + status.slice(1).toLowerCase()
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const start = new Date(appointment.startsAt)
  const end = new Date(appointment.endsAt)

  const timeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-amber-200 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-gray-900 text-sm">{appointment.client.name}</span>
            <Badge variant={statusVariant(appointment.status) as 'success' | 'pending' | 'cancelled' | 'noshow' | 'secondary'}>
              {statusLabel(appointment.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              {appointment.service.name}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {appointment.barber.name}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
            <Clock className="w-3 h-3" />
            {timeStr}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">→ {endStr}</div>
          <div className="text-sm font-bold text-amber-600 mt-1">
            {formatPrice(appointment.service.priceCents)}
          </div>
        </div>
      </div>
    </button>
  )
}
