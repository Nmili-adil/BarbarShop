'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, UserCog, Mail, Phone, Clock } from 'lucide-react'

interface Barber {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: 'OWNER' | 'MANAGER' | 'BARBER'
  isActive: boolean
  _count?: { availability: number }
}

const emptyForm = { name: '', email: '', phone: '', role: 'BARBER' as Barber['role'] }

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Barber | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduling, setScheduling] = useState<Barber | null>(null)
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)

  async function fetchBarbers() {
    setLoading(true)
    const res = await fetch('/api/barbers?counts=1')
    const data = await res.json()
    setBarbers(data.data ?? [])
    setLoading(false)
  }

  async function seedDefaultHours(barberId: string) {
    const defaultDays = [1,2,3,4,5,6] // Mon–Sat
    const payload = defaultDays.map(d => ({ dayOfWeek: d, isActive: true, startTime: '09:00', endTime: '18:00' }))
    await fetch(`/api/barbers/${barberId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await fetchBarbers()
  }

  useEffect(() => { fetchBarbers() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function openEdit(b: Barber) {
    setEditing(b)
    setForm({ name: b.name, email: b.email, phone: b.phone ?? '', role: b.role })
    setError('')
    setOpen(true)
  }

  async function openSchedule(b: Barber) {
    setScheduling(b)
    setScheduleOpen(true)
    setScheduleLoading(true)
    setError('')
    
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const defaultData = DAYS.map((d, i) => ({
      dayOfWeek: i,
      dayName: d,
      isActive: i > 0 && i < 6,
      startTime: '09:00',
      endTime: '17:00',
    }))

    try {
      const res = await fetch(`/api/barbers/${b.id}/availability`)
      const data = await res.json()
      if (data.data?.length > 0) {
        const merged = defaultData.map(d => {
          const existing = data.data.find((e: any) => e.dayOfWeek === d.dayOfWeek)
          if (existing) {
            return { ...d, isActive: true, startTime: existing.startTime, endTime: existing.endTime }
          }
          return { ...d, isActive: false }
        })
        setScheduleData(merged)
      } else {
        setScheduleData(defaultData)
      }
    } catch {
      setScheduleData(defaultData)
    } finally {
      setScheduleLoading(false)
    }
  }

  async function handleSaveSchedule() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/barbers/${scheduling!.id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setScheduleOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const body = { name: form.name, email: form.email, phone: form.phone || undefined, role: form.role }
    try {
      const res = editing
        ? await fetch(`/api/barbers/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/barbers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setOpen(false)
      await fetchBarbers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this barber? Their appointments will remain.')) return
    await fetch(`/api/barbers/${id}`, { method: 'DELETE' })
    await fetchBarbers()
  }

  const roleColor = (role: string) =>
    role === 'OWNER' ? 'default' : role === 'MANAGER' ? 'pending' : 'secondary'

  return (
    <div className="p-6 space-y-6">
      <Header title="Team" subtitle="Manage your barbers and their roles" />

      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Barber
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-20">
          <UserCog className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No barbers yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your team members to start scheduling</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map(barber => (
            <div key={barber.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={barber.avatarUrl ?? undefined} />
                    <AvatarFallback>{getInitials(barber.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900">{barber.name}</div>
                    <Badge variant={roleColor(barber.role) as 'default' | 'pending' | 'secondary'} className="mt-1 text-xs">
                      {barber.role.charAt(0) + barber.role.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openSchedule(barber)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Working Hours">
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEdit(barber)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors" title="Edit Barber">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {barber.role !== 'OWNER' && (
                    <button onClick={() => handleDelete(barber.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove Barber">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{barber.email}</div>
                {barber.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{barber.phone}</div>}
              </div>

              {/* No-schedule warning */}
              {(!barber._count || barber._count.availability === 0) && (
                <div className="mt-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <span className="text-xs text-amber-700 font-medium">⚠ Aucun horaire défini</span>
                  <button
                    onClick={() => seedDefaultHours(barber.id)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 underline underline-offset-2"
                  >
                    Définir Lun–Sam 9h–18h
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Barber' : 'Add Barber'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input className="mt-1" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Marcus Johnson" />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="marcus@shop.com" />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input className="mt-1" type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({...p, role: v as Barber['role']}))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BARBER">Barber</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.email} className="flex-1">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Barber'}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Working Hours - {scheduling?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {scheduleLoading ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Loading schedule...</div>
            ) : (
              <div className="space-y-3">
                {scheduleData.map((day, i) => (
                  <div key={day.dayOfWeek} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 w-1/3">
                      <input 
                        type="checkbox"
                        checked={day.isActive}
                        onChange={e => {
                          const newD = [...scheduleData]
                          newD[i].isActive = e.target.checked
                          setScheduleData(newD)
                        }}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{day.dayName}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${!day.isActive ? 'opacity-40 pointer-events-none' : ''}`}>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={e => {
                          const newD = [...scheduleData]
                          newD[i].startTime = e.target.value
                          setScheduleData(newD)
                        }}
                        className="w-24 text-sm px-2 py-1 h-8"
                      />
                      <span className="text-gray-400 text-xs">to</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={e => {
                          const newD = [...scheduleData]
                          newD[i].endTime = e.target.value
                          setScheduleData(newD)
                        }}
                        className="w-24 text-sm px-2 py-1 h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveSchedule} disabled={saving || scheduleLoading} className="flex-1">
                {saving ? 'Saving...' : 'Save Schedule'}
              </Button>
              <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
