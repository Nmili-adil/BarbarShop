'use client'

import { useState, useEffect } from 'react'
import { BookingStepper } from '@/components/booking/BookingStepper'
import { ServicePicker } from '@/components/booking/ServicePicker'
import { BarberPicker } from '@/components/booking/BarberPicker'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { BookingForm } from '@/components/booking/BookingForm'
import { ShopReviews } from '@/components/booking/ShopReviews'
import { BarberPhotoGallery } from '@/components/booking/BarberPhotoGallery'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { Scissors, MapPin, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Service { id: string; name: string; description: string | null; durationMins: number; priceCents: number }
interface Barber { id: string; name: string; email: string; avatarUrl: string | null; role: string }
interface Shop { id: string; name: string; slug: string; address: string | null; phone: string | null; logoUrl: string | null; services: Service[]; barbers: Barber[] }

export default function BookingPage({ params }: { params: { slug: string } }) {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ startsAt: Date; endsAt: Date; label: string } | null>(null)
  const t = useTranslations('booking')
  const tCommon = useTranslations('common')

  useEffect(() => {
    fetch(`/api/shops/${params.slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => { if (d) { setShop(d.data); setLoading(false) } })
  }, [params.slug])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 border-2 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <Scissors className="absolute inset-0 m-auto w-6 h-6 text-amber-500" />
        </div>
        <p className="text-zinc-500 text-sm">{tCommon('loading')}</p>
      </div>
    </div>
  )

  if (notFound || !shop) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center p-4">
      <div>
        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Scissors className="w-10 h-10 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">{t('shopNotFound')}</h1>
        <p className="text-zinc-500 text-sm">{t('shopNotFoundDesc')}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#1a1208] to-zinc-950" />
        {/* Diagonal barber-pole stripes */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(-55deg, #f59e0b 0px, #f59e0b 2px, transparent 2px, transparent 28px)' }}
        />
        {/* Amber radial glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto px-5 pt-10 pb-28">
          {/* Locale switcher */}
          <div className="flex justify-end mb-6">
            <LocaleSwitcher />
          </div>

          {/* Shop logo */}
          <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60 mb-5 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600">
            {shop.logoUrl
              ? <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
              : <Scissors className="w-8 h-8 text-white" />
            }
          </div>

          <h1 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">{shop.name}</h1>

          <div className="flex flex-col gap-1.5">
            {shop.address && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{shop.address}</span>
              </div>
            )}
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="flex items-center gap-2 text-zinc-400 text-sm hover:text-amber-400 transition-colors w-fit">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{shop.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ─── Stepper + Card ───────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 -mt-[88px] relative z-10 pb-16">
        <BookingStepper currentStep={step} selectedService={selectedService} selectedBarber={selectedBarber} />

        {/* Main content card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="p-6">
            {step === 1 && (
              <ServicePicker
                services={shop.services}
                selectedId={selectedService?.id ?? null}
                onSelect={(svc) => { setSelectedService(svc); setSelectedBarber(null); setSelectedSlot(null); setStep(2) }}
              />
            )}
            {step === 2 && (
              <BarberPicker
                barbers={shop.barbers}
                selectedId={selectedBarber?.id ?? null}
                onSelect={(b) => { setSelectedBarber(b); setSelectedSlot(null); setStep(3) }}
              />
            )}
            {step === 3 && selectedBarber && selectedService && (
              <SlotPicker
                barberId={selectedBarber.id}
                serviceId={selectedService.id}
                selectedSlot={selectedSlot}
                onSelect={(slot) => { setSelectedSlot(slot); setStep(4) }}
              />
            )}
            {step === 4 && selectedService && selectedBarber && selectedSlot && (
              <BookingForm
                shopId={shop.id}
                shopSlug={shop.slug}
                service={selectedService}
                barber={selectedBarber}
                slot={selectedSlot}
              />
            )}
          </div>

          {/* Reviews — shown below step 1 content */}
          {step === 1 && (
            <div className="border-t border-gray-100">
              <ShopReviews shopId={shop.id} />
            </div>
          )}

          {/* Barber gallery — shown below step 2 when barber selected */}
          {step === 2 && selectedBarber && (
            <div className="border-t border-gray-100 bg-gray-50/60">
              <BarberPhotoGallery barberId={selectedBarber.id} barberName={selectedBarber.name} />
            </div>
          )}
        </div>

        {/* Back button */}
        {step > 1 && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-zinc-500 hover:text-amber-400 transition-colors text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-900"
            >
              <span>←</span>
              <span>{t('back')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-8 text-center">
        <p className="text-xs text-zinc-700">{t('poweredBy')} <span className="font-semibold text-zinc-600">BarberBook</span></p>
      </div>
    </div>
  )
}


