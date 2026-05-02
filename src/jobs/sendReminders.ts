import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'
import { sendSMS, buildReminderSMS } from '@/lib/sms'
import { sendWhatsAppReminder } from '@/lib/whatsapp'

export async function sendDueReminders(): Promise<void> {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  // Find reminders scheduled to fire within the next hour that haven't been sent
  const reminders = await prisma.reminder.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        lte: oneHourFromNow,
        gte: now,
      },
    },
    include: {
      appointment: {
        include: {
          client: true,
          barber: { include: { shop: true } },
          service: true,
        },
      },
    },
  })

  console.log(`[reminders] Processing ${reminders.length} due reminders`)

  for (const reminder of reminders) {
    const { appointment } = reminder
    const { client, barber, service } = appointment
    const shop = barber.shop

    try {
      if (reminder.channel === 'EMAIL' && client.email) {
        await sendReminderEmail({
          to: client.email,
          clientName: client.name,
          barberName: barber.name,
          serviceName: service.name,
          startsAt: appointment.startsAt,
          shopName: shop.name,
          shopAddress: shop.address,
        })
      } else if (reminder.channel === 'WHATSAPP' && client.phone) {
        await sendWhatsAppReminder({
          clientPhone: client.phone,
          clientName: client.name,
          barberName: barber.name,
          serviceName: service.name,
          startsAt: appointment.startsAt,
          shopName: shop.name,
          shopAddress: shop.address,
        })
      } else if (reminder.channel === 'SMS' && client.phone) {
        const message = buildReminderSMS({
          clientName: client.name,
          serviceName: service.name,
          barberName: barber.name,
          startsAt: appointment.startsAt,
          shopName: shop.name,
          shopAddress: shop.address,
        })
        await sendSMS(client.phone, message)
      } else {
        console.warn(`[reminders] No contact info for reminder ${reminder.id}`)
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'FAILED', sentAt: new Date() },
        })
        continue
      }

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentAt: new Date() },
      })

      console.log(`[reminders] Sent ${reminder.channel} reminder ${reminder.id} for appointment ${appointment.id}`)
    } catch (err) {
      console.error(`[reminders] Failed to send reminder ${reminder.id}:`, err)
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'FAILED' },
      })
    }
  }
}
