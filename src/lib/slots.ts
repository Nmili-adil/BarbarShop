import { prisma } from '@/lib/prisma'
import { getPrayerWindows, slotOverlapsPrayer } from '@/lib/prayerTimes'

export type TimeSlot = {
  startsAt: Date
  endsAt: Date
  label: string
}

function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const result = new Date(baseDate)
  result.setUTCHours(hours, minutes, 0, 0)
  return result
}

function formatSlotLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}

function slotsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && endA > startB
}

export async function getAvailableSlots(
  barberId: string,
  serviceId: string,
  date: Date
): Promise<TimeSlot[]> {
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getUTCDay()

  // Fetch barber availability for this day
  const availability = await prisma.availability.findUnique({
    where: {
      barberId_dayOfWeek: {
        barberId,
        dayOfWeek,
      },
    },
  })

  if (!availability) return []

  // Fetch service duration and barber's shop
  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    include: { shop: true },
  })
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { durationMins: true },
  })

  if (!service || !barber) return []

  // Check if today is a shop holiday
  const shop = barber.shop
  const dayStart = new Date(date)
  dayStart.setUTCHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setUTCHours(23, 59, 59, 999)

  const holiday = await prisma.shopHoliday.findFirst({
    where: { shopId: shop.id, date: { gte: dayStart, lte: dayEnd } },
  })
  if (holiday) return [] // Closed on holiday

  // Fetch existing appointments for this barber on this date (not cancelled)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      startsAt: { gte: dayStart, lte: dayEnd },
      status: { not: 'CANCELLED' },
    },
    select: { startsAt: true, endsAt: true },
  })

  // Fetch prayer windows if enabled for shop
  const prayerWindows =
    shop.prayerBreaksEnabled
      ? await getPrayerWindows(date, shop.city ?? 'Casablanca')
      : []

  // Generate all possible slots
  const slots: TimeSlot[] = []
  const slotDuration = service.durationMins * 60 * 1000 // ms

  const workStart = parseTime(availability.startTime, date)
  const workEnd = parseTime(availability.endTime, date)

  let cursor = workStart.getTime()
  const end = workEnd.getTime()

  while (cursor + slotDuration <= end) {
    const slotStart = new Date(cursor)
    const slotEnd = new Date(cursor + slotDuration)

    // Check if this slot overlaps with any existing appointment
    const isBooked = existingAppointments.some((appt) =>
      slotsOverlap(slotStart, slotEnd, appt.startsAt, appt.endsAt)
    )

    // Check if this slot overlaps with a prayer break
    const isPrayerBreak = slotOverlapsPrayer(slotStart, slotEnd, prayerWindows)

    if (!isBooked && !isPrayerBreak) {
      slots.push({
        startsAt: slotStart,
        endsAt: slotEnd,
        label: formatSlotLabel(slotStart),
      })
    }

    cursor += slotDuration
  }

  return slots
}
