/**
 * WhatsApp Business Cloud API integration (Meta).
 * Set WHATSAPP_TOKEN (permanent system user token) and
 * WHATSAPP_PHONE_NUMBER_ID in your environment.
 */

const BASE_URL = 'https://graph.facebook.com/v19.0'

async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('[whatsapp] Not configured — skipping WhatsApp message')
    return
  }

  // Normalise Moroccan numbers: +212 prefix
  const normalised = to.startsWith('+') ? to : `+212${to.replace(/^0/, '')}`

  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalised,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('[whatsapp] Failed to send message:', err)
    throw new Error(`WhatsApp API error: ${res.status}`)
  }
}

export async function sendWhatsAppReminder(params: {
  clientPhone: string
  clientName: string
  serviceName: string
  barberName: string
  startsAt: Date
  shopName: string
  shopAddress?: string | null
}): Promise<void> {
  const timeStr = params.startsAt.toLocaleTimeString('fr-MA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Casablanca',
  })
  const dateStr = params.startsAt.toLocaleDateString('fr-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Casablanca',
  })

  const lines = [
    `✂️ *${params.shopName}* — Rappel de rendez-vous`,
    ``,
    `Bonjour *${params.clientName}*,`,
    `Votre rendez-vous est confirmé pour demain :`,
    ``,
    `🗓 ${dateStr} à ${timeStr}`,
    `💈 Service : ${params.serviceName}`,
    `👤 Barbier : ${params.barberName}`,
    params.shopAddress ? `📍 ${params.shopAddress}` : null,
    ``,
    `À bientôt !`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  await sendWhatsAppMessage(params.clientPhone, lines)
}

export async function sendWhatsAppBookingConfirmation(params: {
  clientPhone: string
  clientName: string
  serviceName: string
  barberName: string
  startsAt: Date
  shopName: string
  shopAddress?: string | null
  appointmentId: string
}): Promise<void> {
  const timeStr = params.startsAt.toLocaleTimeString('fr-MA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Casablanca',
  })
  const dateStr = params.startsAt.toLocaleDateString('fr-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Casablanca',
  })

  const lines = [
    `✅ *Réservation confirmée — ${params.shopName}*`,
    ``,
    `Bonjour *${params.clientName}*,`,
    `Votre rendez-vous a bien été enregistré !`,
    ``,
    `🗓 ${dateStr} à ${timeStr}`,
    `💈 ${params.serviceName}`,
    `👤 ${params.barberName}`,
    params.shopAddress ? `📍 ${params.shopAddress}` : null,
    ``,
    `Merci et à bientôt ! 🙏`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  await sendWhatsAppMessage(params.clientPhone, lines)
}

export async function sendWhatsAppQueueNotification(params: {
  clientPhone: string
  clientName: string
  shopName: string
  position: number
  estimatedWaitMins: number
}): Promise<void> {
  const text =
    params.position === 1
      ? [
          `✂️ *${params.shopName}*`,
          ``,
          `C'est votre tour, *${params.clientName}* ! 🎉`,
          `Veuillez vous présenter à la caisse maintenant.`,
        ].join('\n')
      : [
          `✂️ *${params.shopName}*`,
          ``,
          `Bonjour *${params.clientName}*,`,
          `Vous êtes maintenant numéro *${params.position}* dans la file.`,
          `Temps d'attente estimé : ~${params.estimatedWaitMins} min.`,
        ].join('\n')

  await sendWhatsAppMessage(params.clientPhone, text)
}

export async function sendWhatsAppReviewRequest(params: {
  clientPhone: string
  clientName: string
  shopName: string
  appointmentId: string
  appUrl: string
}): Promise<void> {
  const reviewUrl = `${params.appUrl}/review/${params.appointmentId}`
  const text = [
    `✂️ *${params.shopName}*`,
    ``,
    `Merci pour votre visite, *${params.clientName}* ! 😊`,
    `Votre avis nous aide à nous améliorer.`,
    `Laissez une évaluation ici (1 min) :`,
    `👉 ${reviewUrl}`,
  ].join('\n')

  await sendWhatsAppMessage(params.clientPhone, text)
}
