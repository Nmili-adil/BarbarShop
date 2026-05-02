import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/slots'

// GET /api/slots?barberId=&serviceId=&date=YYYY-MM-DD
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const barberId = searchParams.get('barberId')
    const serviceId = searchParams.get('serviceId')
    const dateStr = searchParams.get('date')

    if (!barberId || !serviceId || !dateStr) {
      return NextResponse.json({ error: 'barberId, serviceId, and date are required' }, { status: 400 })
    }

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    const slots = await getAvailableSlots(barberId, serviceId, date)

    // Serialize Date objects to ISO strings for JSON transport
    const serialized = slots.map(s => ({
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      label: s.label,
    }))

    return NextResponse.json({ slots: serialized })
  } catch (err) {
    console.error('[GET /api/slots]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
