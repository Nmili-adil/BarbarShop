import cron from 'node-cron'
import { sendDueReminders } from './sendReminders'

console.log('[jobs] Starting BarberBook cron server...')

// Run every hour at :00
cron.schedule('0 * * * *', async () => {
  console.log(`[jobs] Running reminder job at ${new Date().toISOString()}`)
  try {
    await sendDueReminders()
  } catch (err) {
    console.error('[jobs] Reminder job failed:', err)
  }
})

// Also run immediately on startup to catch any missed reminders
sendDueReminders().catch(err => {
  console.error('[jobs] Initial reminder run failed:', err)
})

console.log('[jobs] Cron server running. Reminders fire every hour.')
