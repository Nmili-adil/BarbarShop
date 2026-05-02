/**
 * Prayer time awareness using the free Aladhan API.
 * https://aladhan.com/prayer-times-api
 *
 * Returns prayer time windows that should be blocked in barber slots.
 * Uses Casablanca (Africa/Casablanca) by default; can be overridden per city.
 */

export type PrayerWindow = {
  name: string
  startsAt: Date
  endsAt: Date
}

type AladhanTimings = {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  [key: string]: string
}

/** Prayer names to block (Dhuhr, Asr, Maghrib — the ones during business hours) */
const BLOCKED_PRAYERS: string[] = ['Dhuhr', 'Asr', 'Maghrib']

/** Duration to block around each prayer time (minutes) */
const BLOCK_DURATION_MINS = 20

function parsePrayerTime(timeStr: string, baseDate: Date): Date {
  // Aladhan returns times like "13:45" in local time
  const [hours, minutes] = timeStr.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(hours, minutes, 0, 0)
  return d
}

async function fetchPrayerTimings(
  date: Date,
  city: string
): Promise<AladhanTimings | null> {
  const dateStr = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getFullYear()}`

  const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=MA&method=3`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    return (json?.data?.timings as AladhanTimings) ?? null
  } catch {
    console.warn('[prayerTimes] Could not fetch prayer times from Aladhan')
    return null
  }
}

/**
 * Returns prayer time windows for the given date and city.
 * Returns an empty array if the API is unavailable.
 */
export async function getPrayerWindows(
  date: Date,
  city = 'Casablanca'
): Promise<PrayerWindow[]> {
  const timings = await fetchPrayerTimings(date, city)
  if (!timings) return []

  const windows: PrayerWindow[] = []
  for (const prayer of BLOCKED_PRAYERS) {
    const prayerStart = parsePrayerTime(timings[prayer], date)
    const prayerEnd = new Date(prayerStart.getTime() + BLOCK_DURATION_MINS * 60_000)
    windows.push({ name: prayer, startsAt: prayerStart, endsAt: prayerEnd })
  }
  return windows
}

/** Check if a slot overlaps with any prayer window */
export function slotOverlapsPrayer(
  slotStart: Date,
  slotEnd: Date,
  prayerWindows: PrayerWindow[]
): boolean {
  return prayerWindows.some(
    (p) => slotStart < p.endsAt && slotEnd > p.startsAt
  )
}
