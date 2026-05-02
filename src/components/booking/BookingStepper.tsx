'use client'

import { cn } from '@/lib/utils'
import { Scissors, User, Calendar, FileText, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BookingStepperProps {
  currentStep: number
  selectedService?: { name: string } | null
  selectedBarber?: { name: string } | null
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const t = useTranslations('booking')

  const STEPS = [
    { label: t('steps.service'), icon: Scissors },
    { label: t('steps.barber'), icon: User },
    { label: t('steps.schedule'), icon: Calendar },
    { label: t('steps.info'), icon: FileText },
  ]
  return (
    <div className="flex items-center px-1 mb-5">
      {STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = currentStep > stepNum
        const isCurrent = currentStep === stepNum
        const Icon = step.icon

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-amber-500 shadow-lg shadow-amber-500/40',
                  isCurrent && 'bg-amber-500 shadow-lg shadow-amber-500/50 ring-4 ring-white/20',
                  !isCompleted && !isCurrent && 'bg-zinc-800/80'
                )}
              >
                {isCompleted
                  ? <Check className="w-4 h-4 text-white" />
                  : <Icon className={cn('w-4 h-4', isCurrent ? 'text-white' : 'text-zinc-500')} />
                }
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wide whitespace-nowrap',
                isCurrent ? 'text-amber-400' : isCompleted ? 'text-amber-500/60' : 'text-zinc-600'
              )}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-1.5 mb-5">
                <div className={cn(
                  'h-0.5 w-full rounded-full transition-all duration-500',
                  currentStep > stepNum ? 'bg-amber-500' : 'bg-zinc-800/60'
                )} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

