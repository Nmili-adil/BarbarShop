'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, Clock, User, Scissors, MapPin, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration, formatPrice, generateICS } from '@/lib/utils'

interface AppointmentDetails {
  id: string
  startsAt: string
  endsAt: string
  client: { name: string }
  barber: { name: string; shop: { name: string; address: string | null; phone: string | null; slug: string } }
  service: { name: string; durationMins: number; priceCents: number }
}

export default function ConfirmPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')
  const [appt, setAppt] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appointmentId) { setLoading(false); return }
    fetch(`/api/appointments/${appointmentId}/public`)
      .then(r => r.json())
      .then(d => { setAppt(d.data); setLoading(false) })
  }, [appointmentId])

  function downloadICS() {
    if (!appt) return
    const ics = generateICS({
      title: `${appt.service.name} at ${appt.barber.shop.name}`,
      description: `Appointment with ${appt.barber.name}`,
      location: appt.barber.shop.address ?? '',
      startsAt: new Date(appt.startsAt),
      endsAt: new Date(appt.endsAt),
    })
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'appointment.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!appt) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment not found</h1>
        <p className="text-gray-500">Something went wrong. Please try booking again.</p>
      </div>
    </div>
  )

  const start = new Date(appt.startsAt)
  const dateStr = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-md w-full overflow-hidden">
        {/* Success header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">You&apos;re booked!</h1>
          <p className="text-green-100 mt-2">
            See you soon, {appt.client.name}!
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">{appt.barber.shop.name}</h2>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Scissors className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>{appt.service.name}</strong>
                <span className="text-gray-400"> · {formatDuration(appt.service.durationMins)} · {formatPrice(appt.service.priceCents)}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-amber-500 shrink-0" />
              <span>with <strong>{appt.barber.name}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{timeStr}</span>
            </div>
            {appt.barber.shop.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-gray-600">{appt.barber.shop.address}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={downloadICS} variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Add to Calendar
            </Button>
            <Link href={`/book/${appt.barber.shop.slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Book Again
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-gray-400 pt-2">
            A confirmation has been sent to your email (if provided).
          </p>
        </div>
      </div>
    </div>
  )
}
