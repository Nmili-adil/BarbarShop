import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')

export async function sendBookingConfirmation(params: {
  to: string
  clientName: string
  barberName: string
  serviceName: string
  startsAt: Date
  shopName: string
  shopAddress?: string | null
  appointmentId: string
}) {
  const dateStr = params.startsAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = params.startsAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Booking Confirmed</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; padding: 40px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 40px 30px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">✂️</div>
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 700;">${params.shopName}</h1>
          <p style="color: #9ca3af; margin: 8px 0 0; font-size: 14px;">Appointment Confirmed</p>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 16px; color: #111827; margin: 0 0 24px;">Hi <strong>${params.clientName}</strong>,</p>
          <p style="font-size: 15px; color: #374151; margin: 0 0 32px;">Your appointment has been confirmed! Here are the details:</p>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 110px;">Service</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${params.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Barber</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${params.barberName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${dateStr}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${timeStr}</td></tr>
              ${params.shopAddress ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location</td><td style="padding: 8px 0; color: #111827; font-size: 14px;">${params.shopAddress}</td></tr>` : ''}
            </table>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/cancel?appointmentId=${params.appointmentId}" style="display: inline-block; padding: 12px 24px; background: #f3f4f6; color: #374151; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">Cancel Appointment</a>
          
          <p style="margin: 32px 0 0; font-size: 13px; color: #9ca3af;">If you have questions, please contact ${params.shopName} directly.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@barbershop.app',
      to: params.to,
      subject: `Appointment Confirmed — ${params.serviceName} at ${params.shopName}`,
      html,
    })
  } catch (err) {
    console.error('[email] Failed to send booking confirmation:', err)
  }
}

export async function sendReminderEmail(params: {
  to: string
  clientName: string
  barberName: string
  serviceName: string
  startsAt: Date
  shopName: string
  shopAddress?: string | null
}) {
  const dateStr = params.startsAt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = params.startsAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Appointment Reminder</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; padding: 40px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">⏰</div>
          <h1 style="color: #f59e0b; margin: 0; font-size: 22px;">Appointment Tomorrow</h1>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 16px; color: #111827;">Hi <strong>${params.clientName}</strong>,</p>
          <p style="font-size: 15px; color: #374151;">Just a reminder — you have an appointment tomorrow at <strong>${params.shopName}</strong>.</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 15px; color: #92400e;"><strong>${params.serviceName}</strong> with ${params.barberName}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #92400e;">${dateStr} at ${timeStr}</p>
            ${params.shopAddress ? `<p style="margin: 4px 0 0; font-size: 13px; color: #92400e;">${params.shopAddress}</p>` : ''}
          </div>
          <p style="font-size: 14px; color: #6b7280;">See you soon! 💈</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@barbershop.app',
      to: params.to,
      subject: `Reminder: ${params.serviceName} tomorrow at ${params.shopName}`,
      html,
    })
  } catch (err) {
    console.error('[email] Failed to send reminder:', err)
  }
}
