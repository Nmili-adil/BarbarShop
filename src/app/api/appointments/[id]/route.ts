import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateAppointmentStatusSchema } from '@/lib/validations'
import { sendWhatsAppReviewRequest } from '@/lib/whatsapp'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        barber: { include: { shop: true } },
        service: true,
        reminder: true,
      },
    })
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: appt })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = updateAppointmentStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.status) updateData.status = parsed.data.status
    if (parsed.data.paymentMethod) updateData.paymentMethod = parsed.data.paymentMethod
    if (parsed.data.paymentStatus) updateData.paymentStatus = parsed.data.paymentStatus

    const appt = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true, barber: { include: { shop: true } }, service: true },
    })

    // Award loyalty points and send review request when appointment is completed
    if (parsed.data.status === 'COMPLETED') {
      const POINTS_PER_VISIT = 10
      await prisma.$transaction([
        prisma.client.update({
          where: { id: appt.clientId },
          data: { loyaltyPoints: { increment: POINTS_PER_VISIT } },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            clientId: appt.clientId,
            appointmentId: appt.id,
            points: POINTS_PER_VISIT,
            type: 'EARN',
            description: `Visit: ${appt.service.name}`,
          },
        }),
      ])

      // Send WhatsApp review request
      if (appt.client.phone) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
        sendWhatsAppReviewRequest({
          clientPhone: appt.client.phone,
          clientName: appt.client.name,
          shopName: appt.barber.shop.name,
          appointmentId: appt.id,
          appUrl,
        }).catch((err) => console.warn('[whatsapp] Review request not sent:', err))
      }
    }

    return NextResponse.json({ data: appt })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
