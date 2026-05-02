import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Header } from '@/components/dashboard/Header'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { AppointmentCard } from '@/components/dashboard/AppointmentCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ExternalLink } from 'lucide-react'
import type { DashboardStats } from '@/types'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const shopId = (session.user as { shopId?: string }).shopId
  if (!shopId) redirect('/login')

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayAppts, weekAppts, pendingCount, noShowCount, shop] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barber: { shopId },
        startsAt: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELLED' },
      },
      include: { client: true, barber: true, service: true },
      orderBy: { startsAt: 'asc' },
    }),
    prisma.appointment.count({
      where: {
        barber: { shopId },
        startsAt: { gte: weekStart },
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.appointment.count({
      where: { barber: { shopId }, status: 'PENDING' },
    }),
    prisma.appointment.count({
      where: {
        barber: { shopId },
        status: 'NO_SHOW',
        startsAt: { gte: monthStart },
      },
    }),
    prisma.shop.findUnique({ where: { id: shopId } }),
  ])

  const revenueResult = await prisma.appointment.findMany({
    where: {
      barber: { shopId },
      status: 'COMPLETED',
      startsAt: { gte: monthStart },
    },
    include: { service: { select: { priceCents: true } } },
  })
  const revenueThisMonth = revenueResult.reduce((sum, a) => sum + a.service.priceCents, 0)

  const stats: DashboardStats = {
    appointmentsToday: todayAppts.length,
    appointmentsThisWeek: weekAppts,
    pendingConfirmations: pendingCount,
    noShowsThisMonth: noShowCount,
    revenueThisMonth,
  }

  return (
    <div className="p-6 space-y-6">
      <Header
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      <StatsBar stats={stats} />

      {/* Today's Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Today&apos;s Appointments</h2>
            <p className="text-sm text-gray-400">{todayAppts.length} scheduled</p>
          </div>
          <div className="flex gap-2">
            {shop?.slug && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={`/book/${shop.slug}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Booking Page
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/appointments">
                <Plus className="w-3.5 h-3.5" />
                New Walk-In
              </Link>
            </Button>
          </div>
        </div>

        {todayAppts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-medium text-gray-500">No appointments today</p>
            <p className="text-sm mt-1">Share your booking page to get clients booked</p>
            {shop?.slug && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                  {process.env.NEXT_PUBLIC_APP_URL}/book/{shop.slug}
                </code>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {todayAppts.map((appt) => (
              <AppointmentCard 
                key={appt.id} 
                appointment={JSON.parse(JSON.stringify(appt))} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
