'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/dashboard/Header'
import { AppointmentCard } from '@/components/dashboard/AppointmentCard'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, formatDuration } from '@/lib/utils'
import { Calendar, Phone, Mail, FileText, Clock, User, Scissors, CreditCard, Banknote, ArrowRightLeft, Star } from 'lucide-react'
import type { AppointmentWithRelations } from '@/types'

type Status = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

function statusVariant(s: string) {
  const map: Record<string, string> = {
    CONFIRMED: 'success', COMPLETED: 'secondary', CANCELLED: 'cancelled',
    NO_SHOW: 'noshow', PENDING: 'pending',
  }
  return (map[s] ?? 'outline') as 'success' | 'pending' | 'cancelled' | 'noshow' | 'secondary' | 'outline'
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filterBarber, setFilterBarber] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState<Status>('ALL')
  const [barbers, setBarbers] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<AppointmentWithRelations | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterBarber !== 'ALL') params.set('barberId', filterBarber)
    if (filterStatus !== 'ALL') params.set('status', filterStatus)
    const res = await fetch(`/api/appointments?${params}`)
    const data = await res.json()
    setAppointments(data.data ?? [])
    setLoading(false)
  }, [filterBarber, filterStatus])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    fetch('/api/barbers').then(r => r.json()).then(d => setBarbers(d.data ?? []))
  }, [])

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchAppointments()
    setSelected(null)
    setUpdating(false)
  }

  async function markPayment(id: string, paymentMethod: string) {
    setUpdating(true)
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, paymentStatus: 'PAID' }),
    })
    await fetchAppointments()
    setUpdating(false)
  }

  const grouped = appointments.reduce<Record<string, AppointmentWithRelations[]>>((acc, appt) => {
    const dateKey = new Date(appt.startsAt).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(appt)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <Header title="Appointments" subtitle="Manage your schedule" />

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterBarber} onValueChange={setFilterBarber}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="All Barbers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Barbers</SelectItem>
            {barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status)}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map(s => (
              <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s === 'NO_SHOW' ? 'No Show' : s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Appointment list grouped by date */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No appointments found</p>
          <p className="text-sm mt-1">Adjust your filters or wait for bookings</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, appts]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{date}</h3>
              <div className="space-y-2">
                {appts.map(appt => (
                  <AppointmentCard key={appt.id} appointment={appt} onClick={() => setSelected(appt)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{selected.client.name}</span>
                  <Badge variant={statusVariant(selected.status)}>
                    {selected.status === 'NO_SHOW' ? 'No Show' : selected.status.charAt(0) + selected.status.slice(1).toLowerCase()}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Scissors className="w-4 h-4 text-amber-500" />
                    <span>{selected.service.name} · {formatDuration(selected.service.durationMins)} · <strong>{formatPrice(selected.service.priceCents)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <User className="w-4 h-4 text-amber-500" />
                    <span>{selected.barber.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>
                      {new Date(selected.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      {' – '}
                      {new Date(selected.endsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  {selected.client.phone && (
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Phone className="w-4 h-4 text-amber-500" />
                      <a href={`tel:${selected.client.phone}`} className="hover:text-amber-600">{selected.client.phone}</a>
                    </div>
                  )}
                  {selected.client.email && (
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Mail className="w-4 h-4 text-amber-500" />
                      <a href={`mailto:${selected.client.email}`} className="hover:text-amber-600">{selected.client.email}</a>
                    </div>
                  )}
                  {selected.notes && (
                    <div className="flex items-start gap-2.5 text-gray-600">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{selected.notes}</span>
                    </div>
                  )}
                  {/* Payment status */}
                  {(selected as AppointmentWithRelations & { paymentStatus?: string; paymentMethod?: string }).paymentStatus === 'PAID' && (
                    <div className="flex items-center gap-2.5 text-green-600 font-medium text-sm">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>Payé — {(selected as AppointmentWithRelations & { paymentMethod?: string }).paymentMethod ?? 'Non spécifié'}</span>
                    </div>
                  )}
                </div>

                {/* Payment actions for completed/confirmed appointments */}
                {(selected.status === 'CONFIRMED' || selected.status === 'COMPLETED') &&
                  (selected as AppointmentWithRelations & { paymentStatus?: string }).paymentStatus !== 'PAID' && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Enregistrer le paiement</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" onClick={() => markPayment(selected.id, 'CASH')} disabled={updating} className="flex flex-col h-auto py-2 gap-1 text-xs">
                          <Banknote className="w-4 h-4 text-green-600" />
                          Espèces
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => markPayment(selected.id, 'CARD')} disabled={updating} className="flex flex-col h-auto py-2 gap-1 text-xs">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          Carte
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => markPayment(selected.id, 'TRANSFER')} disabled={updating} className="flex flex-col h-auto py-2 gap-1 text-xs">
                          <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                          Virement
                        </Button>
                      </div>
                    </div>
                  )
                }

                {/* Status actions */}
                {selected.status !== 'COMPLETED' && selected.status !== 'CANCELLED' && (
                  <div className="grid grid-cols-2 gap-2">
                    {selected.status === 'PENDING' && (
                      <Button onClick={() => updateStatus(selected.id, 'CONFIRMED')} disabled={updating} className="col-span-2">
                        ✓ Confirm Appointment
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => updateStatus(selected.id, 'COMPLETED')} disabled={updating}>
                      Mark Completed
                    </Button>
                    <Button variant="outline" onClick={() => updateStatus(selected.id, 'NO_SHOW')} disabled={updating} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                      No Show
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus(selected.id, 'CANCELLED')} disabled={updating} className="col-span-2">
                      Cancel Appointment
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
