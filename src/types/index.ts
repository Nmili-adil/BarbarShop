import type {
  Appointment,
  Barber,
  Client,
  Service,
  Shop,
  Reminder,
  Subscription,
  BarberRole,
  AppointmentStatus,
  ReminderChannel,
  ReminderStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentMethod,
  PaymentStatus,
  WalkIn,
  WalkInStatus,
  BarberPhoto,
  Review,
  LoyaltyTransaction,
  LoyaltyTxType,
  ShopHoliday,
} from '@prisma/client'

// Re-export prisma types for convenience
export type {
  Appointment,
  Barber,
  Client,
  Service,
  Shop,
  Reminder,
  Subscription,
  BarberRole,
  AppointmentStatus,
  ReminderChannel,
  ReminderStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentMethod,
  PaymentStatus,
  WalkIn,
  WalkInStatus,
  BarberPhoto,
  Review,
  LoyaltyTransaction,
  LoyaltyTxType,
  ShopHoliday,
}

// Relation-enriched types
export type AppointmentWithRelations = Appointment & {
  client: Client
  barber: Barber
  service: Service
  reminder?: Reminder | null
}

export type BarberWithRelations = Barber & {
  services: Service[]
  shop: Shop
}

export type ShopWithRelations = Shop & {
  barbers: Barber[]
  services: Service[]
  subscription?: Subscription | null
}

export type AppointmentWithAll = Appointment & {
  client: Client
  barber: Barber & { shop: Shop }
  service: Service
  reminder?: Reminder | null
  review?: Review | null
}

export type BarberWithPhotos = Barber & {
  photos: BarberPhoto[]
  services: Service[]
}

export type ClientWithLoyalty = Client & {
  loyaltyTransactions: LoyaltyTransaction[]
}

// Session user extension
export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  shopId: string
  role: BarberRole
}

// API response types
export type ApiError = {
  error: string
}

export type ApiSuccess<T> = {
  data: T
}

// Dashboard stats
export type DashboardStats = {
  appointmentsToday: number
  appointmentsThisWeek: number
  pendingConfirmations: number
  noShowsThisMonth: number
  revenueThisMonth: number
}
