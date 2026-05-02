'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppointmentCard } from '@/components/dashboard/AppointmentCard'
import { Users, Phone, Mail, FileText, Calendar, Search } from 'lucide-react'
import type { AppointmentWithRelations } from '@/types'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: string
  _count?: { appointments: number }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [clientAppts, setClientAppts] = useState<AppointmentWithRelations[]>([])
  const [apptLoading, setApptLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/clients').then(r => r.json()).then(d => {
      setClients(d.data ?? [])
      setLoading(false)
    })
  }, [])

  async function openClient(client: Client) {
    setSelected(client)
    setApptLoading(true)
    const res = await fetch(`/api/appointments?clientId=${client.id}`)
    const data = await res.json()
    setClientAppts(data.data ?? [])
    setApptLoading(false)
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="p-6 space-y-6">
      <Header title="Clients" subtitle={`${clients.length} total clients`} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No clients found' : 'No clients yet'}</p>
          <p className="text-sm text-gray-400 mt-1">{search ? 'Try a different search' : 'Clients appear automatically when they book'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.map((client, idx) => (
            <button
              key={client.id}
              onClick={() => openClient(client)}
              className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-amber-50/50 transition-colors text-left ${idx < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-400 truncate">
                  {[client.phone, client.email].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <Badge variant="secondary" className="text-xs">
                  {client._count?.appointments ?? 0} visits
                </Badge>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Client Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg">{getInitials(selected.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                    <p className="text-sm text-gray-400">
                      Client since {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  {selected.phone && (
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Phone className="w-4 h-4 text-amber-500" />
                      <a href={`tel:${selected.phone}`} className="hover:text-amber-600">{selected.phone}</a>
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <Mail className="w-4 h-4 text-amber-500" />
                      <a href={`mailto:${selected.email}`} className="hover:text-amber-600">{selected.email}</a>
                    </div>
                  )}
                  {selected.notes && (
                    <div className="flex items-start gap-2.5 text-gray-600">
                      <FileText className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span>{selected.notes}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    Appointment History
                  </h3>
                  {apptLoading ? (
                    <div className="space-y-2">
                      {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : clientAppts.length === 0 ? (
                    <p className="text-sm text-gray-400">No appointments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {clientAppts.map(appt => (
                        <AppointmentCard key={appt.id} appointment={appt} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
