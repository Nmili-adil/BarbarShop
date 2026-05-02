'use client'

import { formatPrice, formatDuration } from '@/lib/utils'
import { Clock, Scissors, Sparkles, Star, Zap, Crown, Check, CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Service {
  id: string
  name: string
  description: string | null
  durationMins: number
  priceCents: number
}

interface ServicePickerProps {
  services: Service[]
  selectedId: string | null
  onSelect: (service: Service) => void
}

function getServiceIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('color') || n.includes('couleur') || n.includes('mèche')) return Sparkles
  if (n.includes('beard') || n.includes('barbe') || n.includes('rasage') || n.includes('shave')) return Zap
  if (n.includes('kids') || n.includes('enfant') || n.includes('child') || n.includes('junior')) return Star
  if (n.includes('vip') || n.includes('premium') || n.includes('royal') || n.includes('complet')) return Crown
  return Scissors
}

const CARD_THEMES = [
  { ring: 'ring-amber-500', border: 'border-amber-500', iconBg: 'bg-amber-500', iconRing: 'bg-amber-100', label: 'text-amber-600', glow: 'shadow-amber-500/25' },
  { ring: 'ring-zinc-800', border: 'border-zinc-800', iconBg: 'bg-zinc-900', iconRing: 'bg-zinc-100', label: 'text-zinc-700', glow: 'shadow-zinc-800/20' },
  { ring: 'ring-orange-500', border: 'border-orange-500', iconBg: 'bg-orange-500', iconRing: 'bg-orange-100', label: 'text-orange-600', glow: 'shadow-orange-500/25' },
  { ring: 'ring-stone-600', border: 'border-stone-600', iconBg: 'bg-stone-700', iconRing: 'bg-stone-100', label: 'text-stone-600', glow: 'shadow-stone-600/20' },
]

export function ServicePicker({ services, selectedId, onSelect }: ServicePickerProps) {
  const t = useTranslations('booking')

  if (services.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
          <CalendarX className="w-7 h-7 text-gray-400" />
        </div>
        <p className="font-semibold text-gray-700">{t('noServiceAvailable')}</p>
        <p className="text-sm text-gray-400">{t('contactShop')}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1">{t('stepX', { step: 1 })}</p>
      <h2 className="text-2xl font-black text-gray-900 mb-1">{t('whatDoYouWant')}</h2>
      <p className="text-gray-400 text-sm mb-6">{t('chooseServiceBelow')}</p>

      <div className="grid gap-3">
        {services.map((service, index) => {
          const isSelected = selectedId === service.id
          const theme = CARD_THEMES[index % CARD_THEMES.length]
          const Icon = getServiceIcon(service.name)

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={cn(
                'group w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden',
                isSelected
                  ? `${theme.border} shadow-xl ${theme.glow} bg-white ring-4 ${theme.ring}/20`
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
              )}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                  isSelected ? theme.iconBg : 'bg-gray-100 group-hover:bg-gray-200'
                )}>
                  <Icon className={cn('w-6 h-6 transition-colors', isSelected ? 'text-white' : 'text-gray-500')} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 text-base leading-tight">{service.name}</h3>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{service.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">{formatDuration(service.durationMins)}</span>
                  </div>
                </div>

                {/* Price / check */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {isSelected ? (
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', theme.iconBg)}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-xl font-black text-gray-900 leading-none">
                        {service.priceCents === 0 ? 'Gratuit' : formatPrice(service.priceCents)}
                      </div>
                    </div>
                  )}
                  {isSelected && (
                    <span className={cn('text-xs font-bold', theme.label)}>
                      {service.priceCents === 0 ? 'Gratuit' : formatPrice(service.priceCents)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom accent bar when selected */}
              {isSelected && (
                <div className={cn('h-1 w-full', theme.iconBg)} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
