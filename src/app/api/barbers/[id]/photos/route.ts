import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/barbers/[id]/photos — list barber photos (public) */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const photos = await prisma.barberPhoto.findMany({
      where: { barberId: params.id },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ data: photos })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** POST /api/barbers/[id]/photos — add a photo */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { url, caption } = body as { url: string; caption?: string }
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

    // Validate URL format
    try { new URL(url) } catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }) }

    const last = await prisma.barberPhoto.findFirst({
      where: { barberId: params.id },
      orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = (last?.sortOrder ?? -1) + 1

    const photo = await prisma.barberPhoto.create({
      data: { barberId: params.id, url, caption: caption ?? null, sortOrder },
    })
    return NextResponse.json({ data: photo }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** DELETE /api/barbers/[id]/photos?photoId=xxx */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get('photoId')
    if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 })

    await prisma.barberPhoto.delete({
      where: { id: photoId, barberId: params.id },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
