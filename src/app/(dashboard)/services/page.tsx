'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPrice, formatDuration } from '@/lib/utils'
import { Plus, Pencil, Trash2, Scissors, ToggleLeft, ToggleRight } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  durationMins: number
  priceCents: number
  isActive: boolean
}

interface FormData {
  name: string
  description: string
  durationMins: string
  priceCents: string
  isActive: boolean
}

const emptyForm: FormData = { name: '', description: '', durationMins: '30', priceCents: '2500', isActive: true }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchServices() {
    setLoading(true)
    const res = await fetch('/api/services')
    const data = await res.json()
    setServices(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function openEdit(svc: Service) {
    setEditing(svc)
    setForm({
      name: svc.name,
      description: svc.description ?? '',
      durationMins: String(svc.durationMins),
      priceCents: String(svc.priceCents),
      isActive: svc.isActive,
    })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const body = {
      name: form.name,
      description: form.description || undefined,
      durationMins: parseInt(form.durationMins),
      priceCents: parseInt(form.priceCents),
      isActive: form.isActive,
    }
    try {
      const res = editing
        ? await fetch(`/api/services/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setOpen(false)
      await fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service? This cannot be undone.')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    await fetchServices()
  }

  async function handleToggle(svc: Service) {
    await fetch(`/api/services/${svc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !svc.isActive }),
    })
    await fetchServices()
  }

  return (
    <div className="p-6 space-y-6">
      <Header title="Services" subtitle="Manage what you offer" />

      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <Scissors className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No services yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first service to start taking bookings</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Service</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Duration</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map(svc => (
                <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{svc.name}</div>
                    {svc.description && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{svc.description}</div>}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDuration(svc.durationMins)}</td>
                  <td className="px-5 py-4 font-bold text-amber-600">{formatPrice(svc.priceCents)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(svc)} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                      {svc.isActive
                        ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600 text-xs font-medium">Active</span></>
                        : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400 text-xs">Inactive</span></>
                      }
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(svc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Service Name</Label>
              <Input className="mt-1" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Skin Fade" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input className="mt-1" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Brief description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (minutes)</Label>
                <Input className="mt-1" type="number" min="5" max="480" value={form.durationMins} onChange={e => setForm(p => ({...p, durationMins: e.target.value}))} />
              </div>
              <div>
                <Label>Price (cents, e.g. 2500 = $25)</Label>
                <Input className="mt-1" type="number" min="0" value={form.priceCents} onChange={e => setForm(p => ({...p, priceCents: e.target.value}))} />
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
