/**
 * Moroccan public holidays.
 *
 * Fixed-date holidays are embedded here.
 * Islamic holidays (Eid, Mawlid) shift each year — their dates should
 * be stored in the ShopHoliday table (managed via the dashboard) since
 * their Gregorian dates change annually.
 */

export type MoroccanHoliday = {
  name: string
  nameAr: string
  nameFr: string
  month: number // 1-based
  day: number
  recurring: boolean
}

/** Fixed Gregorian holidays observed in Morocco */
export const MOROCCAN_FIXED_HOLIDAYS: MoroccanHoliday[] = [
  { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', nameFr: 'Nouvel An', month: 1, day: 1, recurring: true },
  { name: 'Proclamation of Independence', nameAr: 'ذكرى تقديم وثيقة الاستقلال', nameFr: 'Fête de la Proclamation de l\'Indépendance', month: 1, day: 11, recurring: true },
  { name: 'Labour Day', nameAr: 'عيد الشغل', nameFr: 'Fête du Travail', month: 5, day: 1, recurring: true },
  { name: 'Throne Day', nameAr: 'عيد العرش', nameFr: 'Fête du Trône', month: 7, day: 30, recurring: true },
  { name: 'Oued Ed-Dahab Day', nameAr: 'ذكرى استرجاع إقليم وادي الذهب', nameFr: 'Fête de Oued Ed-Dahab', month: 8, day: 14, recurring: true },
  { name: 'Revolution Day', nameAr: 'ذكرى ثورة الملك والشعب', nameFr: 'Fête de la Révolution', month: 8, day: 20, recurring: true },
  { name: 'Youth Day', nameAr: 'عيد الشباب', nameFr: 'Fête de la Jeunesse', month: 8, day: 21, recurring: true },
  { name: 'Green March Day', nameAr: 'ذكرى المسيرة الخضراء', nameFr: 'Marche Verte', month: 11, day: 6, recurring: true },
  { name: 'Independence Day', nameAr: 'عيد الاستقلال', nameFr: 'Fête de l\'Indépendance', month: 11, day: 18, recurring: true },
]

/**
 * Returns whether the given date is a fixed Moroccan public holiday.
 */
export function isFixedHoliday(date: Date): MoroccanHoliday | null {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return (
    MOROCCAN_FIXED_HOLIDAYS.find((h) => h.month === month && h.day === day) ?? null
  )
}

/**
 * Seed the ShopHoliday table with all fixed holidays for a given shop.
 * Called once during shop onboarding or via admin action.
 */
export function buildSeedHolidays(shopId: string, year: number) {
  return MOROCCAN_FIXED_HOLIDAYS.map((h) => ({
    shopId,
    name: h.name,
    nameAr: h.nameAr,
    nameFr: h.nameFr,
    date: new Date(year, h.month - 1, h.day),
    recurring: true,
  }))
}
