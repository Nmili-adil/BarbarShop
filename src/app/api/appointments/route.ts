import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAppointmentSchema, updateAppointmentStatusSchema } from '@/lib/validations'
import { getAvailableSlots } from '@/lib/slots'
import { sendBookingConfirmation } from '@/lib/email'
import { sendWhatsAppBookingConfirmation } from '@/lib/whatsapp'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const shopId = (session.user as { shopId?: string }).shopId
    if (!shopId) return NextResponse.json({ error: 'No shop found' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const barberId = searchParams.get('barberId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const clientId = searchParams.get('clientId')

    const where: Record<string, unknown> = { barber: { shopId } }
    if (barberId) where.barberId = barberId
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (date) {
      const d = new Date(date)
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      where.startsAt = { gte: start, lte: end }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { client: true, barber: true, service: true, reminder: true },
      orderBy: { startsAt: 'desc' },
    })

    return NextResponse.json({ data: appointments })
  } catch (err) {
    console.error('[GET /api/appointments]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { clientName, clientPhone, clientEmail, barberId, serviceId, startsAt, notes, shopId } = parsed.data
    const startsAtDate = new Date(startsAt)

    // Race condition guard: check slot inside a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // Verify barber belongs to shop
      const barber = await tx.barber.findFirst({ where: { id: barberId, shopId } })
      if (!barber) throw new Error('Barber not found')

      const service = await tx.service.findFirst({ where: { id: serviceId, shopId, isActive: true } })
      if (!service) throw new Error('Service not found')

      const endsAtDate = new Date(startsAtDate.getTime() + service.durationMins * 60 * 1000)

      // Check for conflicts
      const conflict = await tx.appointment.findFirst({
        where: {
          barberId,
          status: { not: 'CANCELLED' },
          OR: [
            { startsAt: { lt: endsAtDate }, endsAt: { gt: startsAtDate } },
          ],
        },
      })
      if (conflict) throw new Error('Time slot is no longer available. Please pick another time.')

      // Find or create client
      const clientWhere = clientEmail
        ? { shopId_email: { shopId, email: clientEmail } }
        : undefined

      let client = clientWhere
        ? await tx.client.findUnique({ where: clientWhere })
        : null

      if (!client) {
        try {
          client = await tx.client.create({
            data: { shopId, name: clientName, phone: clientPhone, email: clientEmail || null },
          })
        } catch {
          // Race condition — find the one that was just created
          client = await tx.client.findFirst({ where: { shopId, phone: clientPhone } })
          if (!client) throw new Error('Failed to create client')
        }
      } else {
        // Update name if changed
        client = await tx.client.update({ where: { id: client.id }, data: { name: clientName, phone: clientPhone } })
      }

      // Create appointment
      const newAppt = await tx.appointment.create({
        data: {
          clientId: client.id,
          barberId,
          serviceId,
          startsAt: startsAtDate,
          endsAt: endsAtDate,
          notes: notes ?? null,
          status: 'PENDING',
        },
        include: { client: true, barber: { include: { shop: true } }, service: true },
      })

      // Schedule reminder 24h before — prefer WhatsApp if phone is available
      const reminderAt = new Date(startsAtDate.getTime() - 24 * 60 * 60 * 1000)
      if (reminderAt > new Date()) {
        const channel = clientPhone ? 'WHATSAPP' : clientEmail ? 'EMAIL' : null
        if (channel) {
          await tx.reminder.create({
            data: {
              appointmentId: newAppt.id,
              channel,
              scheduledAt: reminderAt,
            },
          })
        }
      }

      return newAppt
    })

    // Send confirmation email
    if (parsed.data.clientEmail) {
      await sendBookingConfirmation({
        to: parsed.data.clientEmail,
        clientName,
        barberName: appointment.barber.name,
        serviceName: appointment.service.name,
        startsAt: startsAtDate,
        shopName: appointment.barber.shop.name,
        shopAddress: appointment.barber.shop.address,
        appointmentId: appointment.id,
      })
    }

    // Send WhatsApp confirmation if client has a phone
    if (parsed.data.clientPhone) {
      await sendWhatsAppBookingConfirmation({
        clientPhone: parsed.data.clientPhone,
        clientName,
        barberName: appointment.barber.name,
        serviceName: appointment.service.name,
        startsAt: startsAtDate,
        shopName: appointment.barber.shop.name,
        shopAddress: appointment.barber.shop.address,
        appointmentId: appointment.id,
      }).catch((err) => console.warn('[whatsapp] Confirmation not sent:', err))
    }

    return NextResponse.json({ data: appointment }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    const status = msg.includes('no longer available') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
