'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Copy, Check, Zap } from 'lucide-react'

interface ShopData {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  city: string | null
  timezone: string
  logoUrl: string | null
  prayerBreaksEnabled: boolean
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd: string | null
  } | null
}

const TIMEZONES = [
  'Africa/Casablanca',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'Europe/London',
  'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata',
  'Asia/Tokyo', 'Australia/Sydney',
]

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Tétouan', 'Safi', 'El Jadida', 'Kénitra',
]

const PLAN_LABELS: Record<string, string> = { STARTER: 'Starter', PRO: 'Pro', BUSINESS: 'Business' }
const STATUS_COLOR: Record<string, 'success' | 'pending' | 'cancelled' | 'default'> = {
  ACTIVE: 'success', TRIALING: 'pending', PAST_DUE: 'noshow' as 'cancelled', CANCELLED: 'cancelled',
}

export default function SettingsPage() {
  const [shop, setShop] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', slug: '', phone: '', address: '', city: '', timezone: 'Africa/Casablanca', prayerBreaksEnabled: false })

  useEffect(() => {
    fetch('/api/shops/me').then(r => r.json()).then(d => {
      const s = d.data
      setShop(s)
      setForm({
        name: s?.name ?? '',
        slug: s?.slug ?? '',
        phone: s?.phone ?? '',
        address: s?.address ?? '',
        city: s?.city ?? '',
        timezone: s?.timezone ?? 'Africa/Casablanca',
        prayerBreaksEnabled: s?.prayerBreaksEnabled ?? false,
      })
      setLoading(false)
    })
  }, [])

  async function handleSaveShop() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/shops/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const d = await res.json()
      setShop(d.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleBillingPortal() {
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  function copyBookingLink() {
    if (!shop?.slug) return
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/book/${shop.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Header title="Settings" subtitle="Manage your shop preferences" />

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="holidays">Jours fériés</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="booking">Booking Link</TabsTrigger>
        </TabsList>

        {/* Shop Tab */}
        <TabsContent value="shop">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 max-w-xl">
            <h2 className="text-lg font-bold text-gray-900">Shop Details</h2>
            <div>
              <Label>Shop Name</Label>
              <Input className="mt-1" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <Label>URL Slug</Label>
              <div className="flex items-center mt-1">
                <span className="px-3 h-10 flex items-center bg-gray-100 border border-r-0 border-input rounded-l-lg text-sm text-gray-500">
                  /book/
                </span>
                <Input
                  value={form.slug}
                  onChange={e => setForm(p => ({...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')}))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <Label>Address</Label>
              <Input className="mt-1" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="123 Main St, City, State" />
            </div>
            <div>
              <Label>City (for prayer times)</Label>
              <Select value={form.city || 'Casablanca'} onValueChange={v => setForm(p => ({...p, city: v}))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {MOROCCAN_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Prayer break slots</p>
                <p className="text-xs text-gray-400 mt-0.5">Block booking slots during Dhuhr, Asr & Maghrib</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({...p, prayerBreaksEnabled: !p.prayerBreaksEnabled}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.prayerBreaksEnabled ? 'bg-amber-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.prayerBreaksEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={v => setForm(p => ({...p, timezone: v}))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
            <Button onClick={handleSaveShop} disabled={saving} className="gap-2">
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 max-w-xl">
            <h2 className="text-lg font-bold text-gray-900">Billing & Plan</h2>
            {shop?.subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-bold text-gray-900">{PLAN_LABELS[shop.subscription.plan] ?? shop.subscription.plan} Plan</div>
                    {shop.subscription.currentPeriodEnd && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        Renews {new Date(shop.subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <Badge variant={STATUS_COLOR[shop.subscription.status] ?? 'default'}>
                    {shop.subscription.status.charAt(0) + shop.subscription.status.slice(1).toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
                <Button variant="outline" onClick={handleBillingPortal} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Manage Billing on Stripe
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                    <Zap className="w-4 h-4" />
                    You&apos;re on the free trial
                  </div>
                  <p className="text-sm text-amber-700">
                    Upgrade to unlock SMS reminders, team analytics, and priority support.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Starter', price: 29, priceId: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY },
                    { name: 'Pro', price: 49, highlighted: true },
                    { name: 'Business', price: 79 },
                  ].map(plan => (
                    <div key={plan.name} className={`p-4 rounded-xl border ${plan.highlighted ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                      <div className={`font-bold ${plan.highlighted ? 'text-amber-800' : 'text-gray-900'}`}>{plan.name}</div>
                      <div className="text-2xl font-black text-gray-900 mt-1">${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2">
                  <Zap className="w-4 h-4" />
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Moroccan Holidays Tab */}
        <TabsContent value="holidays">
          <HolidaysTab />
        </TabsContent>

        {/* Booking Link Tab */}
        <TabsContent value="booking">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 max-w-xl">
            <h2 className="text-lg font-bold text-gray-900">Your Booking Link</h2>
            <p className="text-sm text-gray-500">Share this link with your clients to let them book online 24/7.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-sm text-gray-700 truncate">
                {typeof window !== 'undefined' ? window.location.origin : ''}/book/{shop?.slug}
              </code>
              <Button variant="outline" onClick={copyBookingLink} className="shrink-0 gap-2">
                {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </Button>
              <Button variant="outline" asChild className="shrink-0">
                <a href={`/book/${shop?.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <strong>Tip:</strong> Add this link to your Instagram bio, Facebook page, or text it directly to clients. They can book from their phone in under 2 minutes.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface Holiday { id: string; name: string; nameAr?: string | null; nameFr?: string | null; date: string; recurring: boolean }

function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [seeding, setSeeding] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' })

  const fetch_ = () =>
    fetch('/api/shops/holidays').then(r => r.json()).then(d => setHolidays(d.data ?? []))

  useEffect(() => { fetch_() }, [])

  async function seed() {
    setSeeding(true)
    await fetch('/api/shops/holidays/seed', { method: 'POST' })
    await fetch_()
    setSeeding(false)
  }

  async function addHoliday() {
    if (!newHoliday.name || !newHoliday.date) return
    setAdding(true)
    await fetch('/api/shops/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newHoliday, recurring: false }),
    })
    setNewHoliday({ name: '', date: '' })
    await fetch_()
    setAdding(false)
  }

  async function removeHoliday(id: string) {
    await fetch(`/api/shops/holidays?id=${id}`, { method: 'DELETE' })
    await fetch_()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Jours fériés marocains</h2>
        <Button variant="outline" onClick={seed} disabled={seeding} size="sm">
          {seeding ? 'Import...' : 'Importer les fériés fixes'}
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Les créneaux de réservation seront bloqués lors de ces jours.
      </p>

      <div className="space-y-2">
        {holidays.map(h => (
          <div key={h.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">{h.nameFr ?? h.name}</p>
              <p className="text-xs text-gray-400">{new Date(h.date).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <button onClick={() => removeHoliday(h.id)} className="text-red-400 hover:text-red-600 text-xs">Supprimer</button>
          </div>
        ))}
        {holidays.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucun jour férié configuré</p>}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Ajouter un jour férié islamique</p>
        <div className="flex gap-2">
          <Input placeholder="Ex: Aïd Al Fitr 2026" value={newHoliday.name} onChange={e => setNewHoliday(p => ({...p, name: e.target.value}))} />
          <Input type="date" value={newHoliday.date} onChange={e => setNewHoliday(p => ({...p, date: e.target.value}))} className="w-44" />
          <Button onClick={addHoliday} disabled={adding}>Ajouter</Button>
        </div>
      </div>
    </div>
  )
}
