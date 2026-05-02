import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BarberBook — Online Booking for Barbershops',
    template: '%s | BarberBook',
  },
  description:
    'Stop losing clients to missed appointments. BarberBook gives your barbershop an online booking page, automated reminders, and a powerful dashboard.',
  keywords: ['barbershop booking', 'barber appointments', 'online booking', 'barbershop software'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'BarberBook',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
