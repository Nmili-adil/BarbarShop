import twilio from 'twilio'

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

export async function sendSMS(to: string, body: string): Promise<void> {
  if (!client) {
    console.warn('[sms] Twilio not configured — skipping SMS')
    return
  }

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER ?? '',
      to,
    })
  } catch (err) {
    console.error('[sms] Failed to send SMS:', err)
    throw err
  }
}

export function buildReminderSMS(params: {
  clientName: string
  serviceName: string
  barberName: string
  startsAt: Date
  shopName: string
  shopAddress?: string | null
}): string {
  const timeStr = params.startsAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const dateStr = params.startsAt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return [
    `Hi ${params.clientName}! Reminder from ${params.shopName}:`,
    `${params.serviceName} with ${params.barberName}`,
    `${dateStr} at ${timeStr}`,
    params.shopAddress ? params.shopAddress : null,
    'Reply STOP to opt out.',
  ]
    .filter(Boolean)
    .join('\n')
}
