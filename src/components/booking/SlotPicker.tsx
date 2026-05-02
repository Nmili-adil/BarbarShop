'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Clock, Sun, Sunset, Moon } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface TimeSlot {
  startsAt: string
  endsAt: string
  label: string
}

interface SlotPickerProps {
  barberId: string
  serviceId: string
  onSelect: (slot: { startsAt: Date; endsAt: Date; label: string }) => void
  selectedSlot: { startsAt: Date; endsAt: Date; label: string } | null
}

const TIME_GROUPS_CONFIG = [
  { key: 'morning', icon: Sun, color: 'text-amber-500', start: 0, end: 12 },
  { key: 'afternoon', icon: Sunset, color: 'text-orange-500', start: 12, end: 17 },
  { key: 'evening', icon: Moon, color: 'text-indigo-500', start: 17, end: 24 },
]

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function SlotPicker({ barberId, serviceId, onSelect, selectedSlot }: SlotPickerProps) {
  const t = useTranslations('booking')
  const locale = useLocale()

  const TIME_GROUPS = TIME_GROUPS_CONFIG.map(g => ({ ...g, label: t(g.key as 'morning' | 'afternoon' | 'evening') }))

  const dayShortFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const dayLabelFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' })

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, weekOffset * 7 + i))

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true)
      setSlots([])
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const res = await fetch(`/api/slots?barberId=${barberId}&serviceId=${serviceId}&date=${dateStr}`)
        const data = await res.json()
        setSlots(data.slots ?? [])
      } catch { setSlots([]) }
      finally { setLoading(false) }
    }
    fetchSlots()
  }, [barberId, serviceId, selectedDate])

  const grouped = TIME_GROUPS.map(g => ({
    ...g,
    slots: slots.filter(s => {
      const h = new Date(s.startsAt).getHours()
      return h >= g.start && h < g.end
    }),
  })).filter(g => g.slots.length > 0)

  const selectedDayLabel = (() => {
    if (isSameDay(selectedDate, today)) return t('today')
    if (isSameDay(selectedDate, addDays(today, 1))) return t('tomorrow')
    return dayLabelFmt.format(selectedDate)
  })()

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1">{t('stepX', { step: 3 })}</p>
      <h2 className="text-2xl font-black text-gray-900 mb-1">{t('chooseSlot')}</h2>
      <p className="text-gray-400 text-sm mb-5">{t('selectDateAndTime')}</p>

      {/* Week navigator */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 transition-all shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex-1 grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const isPast = day < today
            const isSel = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, today)
            return (
              <button
                key={day.toISOString()}
                disabled={isPast}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'flex flex-col items-center py-2 rounded-xl text-xs transition-all duration-150',
                  isPast && 'opacity-25 cursor-not-allowed',
                  isSel && 'bg-amber-500 text-white shadow-lg shadow-amber-500/40',
                  !isSel && !isPast && 'hover:bg-amber-50 text-gray-700',
                  isToday && !isSel && 'ring-2 ring-amber-300'
                )}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {dayShortFmt.format(day)}
                </span>
                <span className="text-base font-black mt-0.5">{day.getDate()}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setWeekOffset(w => w < 4 ? w + 1 : w)}
          disabled={weekOffset >= 4}
          className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 transition-all shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day label */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{selectedDayLabel}</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Slots */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-gray-300" />
          </div>
          <p className="font-bold text-gray-500">{t('noSlotsAvailable')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('tryAnotherDate')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(group => {
            const Icon = group.icon
            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className={cn('w-4 h-4', group.color)} />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{group.label}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {group.slots.map(slot => {
                    const isSel = selectedSlot && new Date(slot.startsAt).getTime() === selectedSlot.startsAt.getTime()
                    return (
                      <button
                        key={slot.startsAt}
                        onClick={() => onSelect({ startsAt: new Date(slot.startsAt), endsAt: new Date(slot.endsAt), label: slot.label })}
                        className={cn(
                          'py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all duration-150',
                          isSel
                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30 scale-[1.03]'
                            : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                        )}
                      >
                        {slot.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
