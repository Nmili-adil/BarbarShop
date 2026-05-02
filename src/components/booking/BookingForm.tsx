'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice, formatDuration } from '@/lib/utils'
import { Scissors, User, Clock, Calendar, Phone, Mail, MessageSquare, ArrowRight, AlertCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface BookingFormProps {
  shopId: string
  shopSlug: string
  service: { id: string; name: string; durationMins: number; priceCents: number }
  barber: { id: string; name: string }
  slot: { startsAt: Date; endsAt: Date; label: string }
}

export function BookingForm({ shopId, shopSlug, service, barber, slot }: BookingFormProps) {
  const router = useRouter()
  const t = useTranslations('booking')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', notes: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientName.trim() || !form.clientPhone.trim()) {
      setError(t('nameAndPhoneRequired'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName.trim(),
          clientPhone: form.clientPhone.trim(),
          clientEmail: form.clientEmail.trim() || undefined,
          barberId: barber.id,
          serviceId: service.id,
          startsAt: slot.startsAt.toISOString(),
          notes: form.notes.trim() || undefined,
          shopId,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tCommon('error'))
      }
      const { data } = await res.json()
      router.push(`/book/${shopSlug}/confirm?appointmentId=${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  const dateStr = slot.startsAt.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1">{t('stepX', { step: 4 })}</p>
      <h2 className="text-2xl font-black text-gray-900 mb-1">{t('yourDetails')}</h2>
      <p className="text-gray-400 text-sm mb-5">{t('confirmSubtitle')}</p>

      {/* Booking summary card */}
      <div className="rounded-2xl overflow-hidden mb-6 border border-gray-100">
        {/* Dark header */}
        <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
            <Scissors className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">{t('bookingSummary')}</span>
          <div className="ml-auto">
            <span className="text-amber-400 font-black text-lg">
              {service.priceCents === 0 ? t('free') : formatPrice(service.priceCents)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 divide-y divide-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <Scissors className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-gray-900 text-sm">{service.name}</p>
              <p className="text-xs text-gray-400">{formatDuration(service.durationMins)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <User className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700">{t('withBarber', { name: barber.name })}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 capitalize">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm font-bold text-gray-700">{slot.label}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="clientName" className="flex items-center gap-1.5 text-gray-700 font-semibold mb-1.5">
            <User className="w-3.5 h-3.5" /> {t('name')} *
          </Label>
          <Input
            id="clientName"
            name="clientName"
            placeholder="Mohammed Alami"
            value={form.clientName}
            onChange={handleChange}
            className="rounded-xl border-gray-200 focus-visible:ring-amber-500 font-medium"
            required
          />
        </div>

        <div>
          <Label htmlFor="clientPhone" className="flex items-center gap-1.5 text-gray-700 font-semibold mb-1.5">
            <Phone className="w-3.5 h-3.5" /> {t('phone')} *
          </Label>
          <Input
            id="clientPhone"
            name="clientPhone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={form.clientPhone}
            onChange={handleChange}
            className="rounded-xl border-gray-200 focus-visible:ring-amber-500 font-medium"
            required
          />
        </div>

        <div>
          <Label htmlFor="clientEmail" className="flex items-center gap-1.5 text-gray-700 font-semibold mb-1.5">
            <Mail className="w-3.5 h-3.5" /> {t('email')}
          </Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            placeholder="mohammed@email.com"
            value={form.clientEmail}
            onChange={handleChange}
            className="rounded-xl border-gray-200 focus-visible:ring-amber-500"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="flex items-center gap-1.5 text-gray-700 font-semibold mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> {t('notes')}
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder={t('notes')}
            value={form.notes}
            onChange={handleChange}
            className="rounded-xl border-gray-200 focus-visible:ring-amber-500 resize-none"
            rows={3}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 text-white font-black text-base rounded-xl py-4 transition-all duration-150 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('confirming')}</span>
            </>
          ) : (
            <>
              <span>{t('confirmAppointment')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          {t('whatsappConfirmation')}
        </p>
      </form>
    </div>
  )
}

