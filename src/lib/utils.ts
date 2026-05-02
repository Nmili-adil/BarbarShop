import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format price in Moroccan Dirham (MAD) */
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} DH`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function generateICS(params: {
  title: string
  description: string
  location: string
  startsAt: Date
  endsAt: Date
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberShop SaaS//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@barbershop`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(params.startsAt)}`,
    `DTEND:${fmt(params.endsAt)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description}`,
    `LOCATION:${params.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
