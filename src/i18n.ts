import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  // Detect locale from cookie; default to 'fr' for Morocco
  const cookieStore = cookies()
  const locale = (cookieStore.get('locale')?.value ?? 'fr') as 'fr' | 'ar' | 'en'
  const validLocales = ['fr', 'ar', 'en']
  const safeLocale = validLocales.includes(locale) ? locale : 'fr'

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  }
})
