import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** POST /api/appointments/[id]/review — submit a review (public, token-less) */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { rating, comment, clientName } = body as {
      rating: number
      comment?: string
      clientName?: string
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 })
    }

    // Verify appointment exists and is completed
    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { client: true },
    })
    if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    if (appt.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Reviews are only allowed for completed appointments' }, { status: 422 })
    }

    // One review per appointment (review has @unique on appointmentId)
    const existing = await prisma.review.findUnique({ where: { appointmentId: params.id } })
    if (existing) return NextResponse.json({ error: 'Review already submitted' }, { status: 409 })

    const review = await prisma.review.create({
      data: {
        appointmentId: params.id,
        rating,
        comment: comment?.trim() ?? null,
        clientName: clientName ?? appt.client.name,
        isPublic: true,
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** GET /api/appointments/[id]/review — check if review already exists */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({ where: { appointmentId: params.id } })
    return NextResponse.json({ data: review })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
