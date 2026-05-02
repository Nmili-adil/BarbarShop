'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Crown, CheckCircle2, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Barber {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: string
}

interface BarberPickerProps {
  barbers: Barber[]
  selectedId: string | null
  onSelect: (barber: Barber) => void
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// Give each barber a unique avatar background
const AVATAR_GRADIENTS = [
  'from-amber-500 to-orange-600',
  'from-zinc-700 to-zinc-900',
  'from-orange-500 to-red-600',
  'from-stone-600 to-stone-800',
]

export function BarberPicker({ barbers, selectedId, onSelect }: BarberPickerProps) {
  const t = useTranslations('booking')

  function getRoleLabel(role: string) {
    if (role === 'OWNER') return t('roleOwner')
    if (role === 'MANAGER') return t('roleManager')
    return t('roleBarber')
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1">{t('stepX', { step: 2 })}</p>
      <h2 className="text-2xl font-black text-gray-900 mb-1">{t('chooseYourBarber')}</h2>
      <p className="text-gray-400 text-sm mb-6">{t('allExpertsAvailable')}</p>

      <div className="grid grid-cols-2 gap-3">
        {barbers.map((barber, index) => {
          const isSelected = selectedId === barber.id
          const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]

          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber)}
              className={cn(
                'relative flex flex-col items-center py-6 px-4 rounded-2xl border-2 transition-all duration-200 text-left',
                isSelected
                  ? 'border-amber-500 bg-gradient-to-b from-amber-50 to-white shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/15'
                  : 'border-gray-100 bg-white hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10'
              )}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 fill-white" />
                </div>
              )}

              {/* Avatar */}
              <div className={cn(
                'relative mb-4 transition-all duration-200',
                isSelected && 'drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              )}>
                <div className={cn(
                  'p-0.5 rounded-full transition-all duration-200',
                  isSelected ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-transparent'
                )}>
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={barber.avatarUrl ?? undefined} alt={barber.name} />
                    <AvatarFallback className={cn('text-lg font-black text-white bg-gradient-to-br', gradient)}>
                      {getInitials(barber.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Name */}
              <span className="font-black text-gray-900 text-center text-sm leading-tight mb-1.5">
                {barber.name}
              </span>

              {/* Role */}
              <div className="flex items-center gap-1 mb-2">
                {barber.role === 'OWNER' && <Crown className="w-3 h-3 text-amber-500" />}
                <span className="text-[11px] text-gray-500 font-semibold">{getRoleLabel(barber.role)}</span>
              </div>

              {/* Stars decoration */}
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Available dot */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] text-emerald-600 font-bold">{t('available')}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
